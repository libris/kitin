#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os, sys
import logging
from logging import config
from logging.handlers import RotatingFileHandler
import time
import re
from datetime import datetime, timedelta
import json
import urllib, urllib2
from urlparse import urlparse
import mimetypes
from flask import (Flask, render_template, request, make_response, Response,
        abort, redirect, url_for, Markup, session, send_from_directory)
from flask_login import LoginManager, login_required, login_user, flash, current_user, logout_user
import jinja2
import requests
from requests_oauthlib import OAuth2Session, TokenUpdated
from storage import Storage
from user import User



here = os.path.dirname(os.path.abspath(__file__))
mimetypes.add_type('application/font-woff', '.woff')


JSON_LD_MIME_TYPE = 'application/ld+json'


app = Flask(__name__)
app.config.from_pyfile('config.cfg')
app.config.from_pyfile('version.cfg', silent=True)
app.config.from_envvar('SETTINGS', silent=True)
app.secret_key = app.config.get('SESSION_SECRET_KEY')
app.remember_cookie_duration = timedelta(days=31)
app.permanent_session_lifetime = timedelta(days=31)

login_manager = LoginManager()
login_manager.setup_app(app)

storage = Storage(app.config.get("DRAFTS_DIR"), app)

with open(os.path.join(here, 'messages.json')) as f:
    message_base = json.load(f)
    messages = dict(message_base['all'],
            **message_base.get(app.config['ENVIRONMENT'], {}))

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = app.config['OAUTHLIB_INSECURE_TRANSPORT']

def get_token():
    if 'oauth_token' in session:
        return session['oauth_token']
    return None

# Run on access token refreshed
def token_updater(token):
    app.logger.info("Token expired updated to be %s ", json.dumps(token))
    session['oauth_token'] = token

def get_requests_oauth():
    # Create new oAuth 2 session
    requests_oauth = OAuth2Session(app.config['OAUTH_CLIENT_ID'], 
               redirect_uri=app.config['OAUTH_REDIRECT_URI'],
               auto_refresh_kwargs={ 'client_id': app.config['OAUTH_CLIENT_ID'], 'client_secret': app.config['OAUTH_CLIENT_SECRET'] }, 
               auto_refresh_url=app.config['OAUTH_TOKEN_URL'],
               token = get_token(),
               token_updater=token_updater
               )
    return requests_oauth


def fake_login():
    if hasattr(app, 'fakelogin') and app.fakelogin:
        user = User('Fake banana', authorization=[{ 'sigel': 'NONE', 'xlreg': True, 'kat': True, 'reg': True }])
        app.logger.debug("Faking login %s %s", user.get_id(), json.dumps(user.get_authorization()))
        login_user(user, True)
        session['authorization'] = user.authorization
        return True
    return False

@app.context_processor
def global_view_variables():
    mtime = os.stat(here).st_mtime
    return {
        'modified': datetime.fromtimestamp(mtime),
        'MESSAGES': messages
    }



@login_manager.user_loader
def _load_user(uid):
    if not 'authorization' in session:
        return None
    return User(uid, authorization=session.get('authorization'))


def _render_login(msg = None):
    return render_template("partials/login.html", msg = msg, WHELK_HOST = app.config['WHELK_HOST'])

@login_manager.unauthorized_handler
def _handle_unauthorized():
    # Redirect to "/login" removed. Since IE finds itself in an infinit loop
    # trying to decide between /login and /#!/login 
    if fake_login():
        return redirect('/')
    return _render_login()


# LOGIN START
# ----------------------------
@app.route("/login")
def login():
    if fake_login():
        return redirect('/')
    return _render_login()

@app.route("/login/authorize")
def login_authorize():
    try:
        requests_oauth = get_requests_oauth()
        authorization_url, state =  requests_oauth.authorization_url(app.config['OAUTH_AUTHORIZATION_URL'], approval_prompt="auto")
        app.logger.info("[%s] Trying to authorize user, redirecting to %s ", request.remote_addr, authorization_url)
        # Redirect to oauth authorization
        return redirect(authorization_url)
    except Exception, e:
        app.logger.error("Failed to create authorization url,  %s ", str(e))
        return _render_login(str(e))

@app.route("/login/authorized")
def authorized():
    app.logger.debug("Got authorized redirect")

    try:
        # Get access token
        try:
            token_url = app.config['OAUTH_TOKEN_URL']
            app.logger.info("[%s] Trying to get access token from %s", request.remote_addr, token_url)
            requests_oauth = get_requests_oauth()
            # On authorized fetch token
            session['oauth_token'] = requests_oauth.fetch_token(token_url, client_secret=app.config['OAUTH_CLIENT_SECRET'], authorization_response=request.url)
            if app.debug:
                app.logger.info("OAuth token received %s ", json.dumps(session['oauth_token']))
        except Exception, e:
            print e
            raise Exception("Failed to get token, %s response: %s " % (token_url, str(e)))

        # Get user from verify
        try:    
            varify_url = app.config['OAUTH_VERIFY_URL']
            verify_response = requests_oauth.get(varify_url).json()
            verify_user = verify_response['user']
            authorization = verify_user['authorization']
            username = verify_user['username']
            app.logger.info("[%s] User received from verify %s, %s", request.remote_addr, username, json.dumps(verify_user))

            # Create Flask User and login
            if(app.config.get('ALWAYS_ALLOW_XLREG') == 'True'):
                for auth in authorization:
                    auth['xlreg'] = True;
            user = User(username, authorization=authorization, token=session['oauth_token'])
            session['authorization'] = authorization
            login_user(user, True)

            return redirect('/')

        except Exception, e:
            raise Exception("Failed to verify user. %s response: %s " % (varify_url, str(e)))
            
    except Exception, e:
        msg = str(e)
        app.logger.error(msg)
        return _render_login(msg)

    
@app.route("/signout")
@login_required
def logout():
    app.logger.info("[%s] Trying to sign out.", request.remote_addr)
    logout_user()
    session.pop('authorization', None)
    session.pop('oauth_token', None)
    return redirect("/login")

# LOGIN END
# ----------------------------



# STATIC CONTENT START
# ----------------------------

# START PAGE
@app.route("/")
@app.route('/edit/<source>/<rec_type>/<rec_id>')   # Edit start template
@app.route('/jsonld/<source>/<rec_type>/<rec_id>') # JSON-LD start template
@app.route('/marc/<rec_type>/<rec_id>')   # Marc start template
@app.route("/search/<rec_type>") # Search template
@login_required
def index(source=None, rec_type=None, rec_id=None):
    best = request.accept_mimetypes.best_match(['application/json', 'text/html'])
    if (best == 'application/json' and request.accept_mimetypes[best] > request.accept_mimetypes['text/html']):
        return 'Error: Base requested using XHR', 500

    return render_template('index.html', user=current_user, debug=app.debug,
            WHELK_HOST=app.config['WHELK_HOST'],
            WHELK_WRITE_HOST=app.config['WHELK_WRITE_HOST'])

# SEARCH TEMPLATE
# @app.route("/search/<record_type>")
# @login_required
# def search(record_type):
#     return render_template('index.html', partials = {"/partials/search" : "partials/search.html"}, debug = app.debug, WHELK_HOST = app.config['CLIENT_WHELK_HOST'])

# PARTIAL TEMPLATES
@app.route("/partials/<path:path>")
@login_required
def show_partial(path):
    return send_from_directory(app.root_path + '/templates/partials/', '%s.html' % path)
    #return render_template('partials/%s.html' % path)

# SNIPPETS TEMPLATES
@app.route("/snippets/<path:path>")
@login_required
def show_snippets(path):
    print '%s.html' % path
    return send_from_directory('templates/snippets/', '%s.html' % path)

# INITIAL STATIC RECORD
@app.route("/record/template/<type>", methods=["GET"])
def get_template(type):
    return raw_json_response(open(os.path.join(here, "examples/templates/%s.json" % type), 'r').read())

# RESOURCES
@app.route("/resource/<path:path>")
def get_resource(path):
    return send_from_directory(app.root_path + '/resource/', '%s' % path)

# STYLEGUIDE
@app.route("/styleguide/")
@login_required
def show_styleguide():
    return render_template('styleguide/style.html' )

# ----------------------------
# STATIC CONTENT END



# WHELK API PROXY START
# ----------------------------

@app.route("/whelk", methods=['GET', 'PUT', 'POST', 'DELETE'])
@app.route("/whelk/<path:path>", methods=['GET', 'PUT', 'POST', 'DELETE'])
@login_required
def proxy_request(path=''):

    # Modify headers    
    headers = extract_x_forwarded_for_header(request)
    if 'If-match' in request.headers:
        headers['If-match'] = request.headers['If-match']
    if 'Authorization' in request.headers:
        headers['Authorization'] = request.headers['Authorization']
    headers['Content-Type'] = JSON_LD_MIME_TYPE

    # Handle PUT/POST data
    data = None
    allow_redirects=False
    if request.method == 'PUT' or request.method == 'POST':
        data = json.dumps(request.json)
        allow_redirects=True # needed?

    # Send request to whelk
    resp = do_request(
                path='/%s' % path, 
                params=request.args, 
                headers=headers,
                method=request.method,
                data=data,
                allow_redirects=allow_redirects
            )
    return resp

# ----------------------------
# WHELK API PROXY END


# DRAFT START
# ----------------------------

# NEW
@app.route('/drafts', methods=['GET'])
@login_required
def get_drafts():
    drafts = storage.get_drafts_index(current_user.get_id())
    drafts = json.dumps(drafts)
    return raw_json_response(drafts)

# GET
@app.route('/draft/<rec_type>/<draft_id>', methods=['GET'])
@login_required
def get_draft(rec_type, draft_id):
    draft = storage.get_draft(current_user.get_id(), rec_type, draft_id)
    if(draft):
        json_data = json.loads(draft)
        resp = raw_json_response(json.dumps(json_data))
        #resp.headers['etag'] = json_data['etag']
        return resp
    else:
        abort(404)

# CREATE
@app.route('/draft/<rec_type>', methods=['POST'])
@app.route('/draft/<rec_type>/<rec_id>', methods=['POST'])
@login_required
def create_draft(rec_type, rec_id=None):
    #!TODO handle etag properly
    etag = ''
    if('If-match' in request.headers):
        etag = request.headers['If-match']

    json_data = storage.save_draft(current_user.get_id(), rec_type, request.data, etag, rec_id)
    return json.dumps(json_data)

# UPDATE
@app.route('/draft/<rec_type>/<draft_id>', methods=['PUT'])
@login_required
def save_draft(rec_type, draft_id):
    """Save draft to kitin, called by form"""
    #!TODO handle etag properly
    etag = ''
    if('If-match' in request.headers):
        etag = request.headers['If-match']

    updated_draft = storage.update_draft(current_user.get_id(), rec_type, request.data, etag, draft_id)
    return json.dumps(updated_draft)

# DELETE
@app.route('/draft/<rec_type>/<draft_id>', methods=['DELETE'])
@login_required
def delete_draft(rec_type, draft_id):
    storage.delete_draft(current_user.get_id(), rec_type, draft_id)
    return redirect("/drafts", code=303)

# ----------------------------
# DRAFT END




# UTILS 
# -------------------

def do_request(path, params=None, method='GET', headers=None, data=None, allow_redirects=False, host=app.config['WHELK_HOST'], json_response=True):
    url = '%s%s' % (host,path)
    app.logger.info('Sending %s request to: %s' , method, url)
    requests_oauth = get_requests_oauth()

    try:
        if method == 'POST':
            response = requests_oauth.post(url, params=params, headers=headers, data=data)
        elif method == 'PUT':
            response = requests_oauth.put(url, params=params, headers=headers, data=data, allow_redirects=allow_redirects)
        elif method == 'DELETE':
            response = requests_oauth.delete(url, headers=headers, allow_redirects=allow_redirects)
        else:
            response = requests.get(url, params=params, headers=headers, allow_redirects=allow_redirects)

    except requests.exceptions.RequestException as e:
        app.logger.warning(e)
        if response:
            app.logger.warning("Error response %s on %s <%s>", response.status_code, method, url)
            abort(response.status_code)

    app.logger.debug('Got response: %s', response.status_code);
    
    # OK
    if response.status_code == 200:
        # Convert to propper json
        if json_response:
            resp = raw_json_response(response.text)
        else:
            resp = response
        # Preserve etag header
        if 'etag' in response.headers:
            resp.headers['etag'] = response.headers['etag'].replace('"', '')
        app.logger.debug('Request done');
        return resp

    # Updated/Created
    elif response.status_code == 201:
        if 'Location' in response.headers:
            return do_request(response.headers['Location'],host='')
        else:
            app.logger.warning('Error status code 201 but no Location header, %s', method)

    # This is what the server returns when deleting a holding, handle it:
    elif response.status_code == 204:
        return ''

    # Error
    else:
        app.logger.warning('Error response %s on %s <%s>' , response.status_code, method, url)
        abort(response.status_code)



def get_dataset(path, cache=False):
    remote_resp = do_request('/%s' % path, json_response=False)
    resp = Response(remote_resp.text,
            status=remote_resp.status_code,
            content_type=remote_resp.headers['content-type'])
    if not cache:
        resp.headers['Expires'] = '-1'
    return resp

def extract_x_forwarded_for_header(request):
    if not request.headers.getlist("X-Forwarded-For"):
        remote_ip = request.remote_addr
    else:
        remote_ip = request.headers.getlist("X-Forwarded-For")[0]
    return {"X-Forwarded-For":"%s" % remote_ip}

def raw_json_response(s):
    resp = make_response(s)
    resp.headers['Content-Type'] = 'application/json'
    resp.headers['Expires'] = '-1'
    return resp

def append_star(q):
    queryItems = []
    for item in q.split('+'):
        if len(item) > 1 and item[-1] != ' ' and item[-1] != '*':
            if ':' in item:
                fieldName = item.split(':')[0]
                lastPartOfFieldName = fieldName.split('.')[-1]
                if lastPartOfFieldName != 'untouched':
                    queryItems.append('%s*' % item)
                else:
                    queryItems.append(item)
            else:
                queryItems.append('%s*' % item)
        else:
            queryItems.append(item)
    return ' '.join(queryItems)



def chunk_number(num):
    number = str(num)
    return re.sub(r'\B(?=(\d{3})+(?!\d))', " ", number)

jinja2.filters.FILTERS['chunk_number'] = chunk_number

if __name__ == "__main__":
    from optparse import OptionParser
    oparser = OptionParser()
    oparser.add_option('-d', '--debug', action='store_true', default=False)
    oparser.add_option('-L', '--fakelogin', action='store_true', default=False)
    opts, args = oparser.parse_args()

    log_level = logging.INFO
    if 'DEBUG' in app.config:
        app.debug = app.config['DEBUG']
        log_level = logging.DEBUG

    if opts.debug:
        app.debug = opts.debug

    # Setting a LOG_FILE attribute is not really necessary when running with
    # apache/mod_wsgi, because all logged messages will be piped to stderr anyway
    # and thus end up in the apache error log.
    if 'LOG_FILE' in app.config:
        file_handler = RotatingFileHandler(app.config['LOG_FILE'], "a", 10485760, 3, "utf-8")
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
    errloghandler = logging.StreamHandler(stream=sys.stderr)
    errloghandler.setLevel(logging.INFO)
    app.logger.addHandler(errloghandler)
    
    logging.Formatter.converter = time.gmtime

    app.fakelogin = opts.fakelogin
    app.run(host='0.0.0.0')
