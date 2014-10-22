#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import logging
import re
from datetime import datetime, timedelta
import json
import urllib2
from urlparse import urlparse
import mimetypes
from flask import (Flask, render_template, request, make_response, Response,
        abort, redirect, url_for, Markup, session, send_from_directory)
from flask_login import LoginManager, login_required, login_user, flash, current_user, logout_user
import jinja2
import requests
from storage import Storage
from user import User


here = os.path.dirname(os.path.abspath(__file__))
logger = logging.getLogger(__name__)
logging.basicConfig(format='%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]')
mimetypes.add_type('application/font-woff', '.woff')


#class SubFlask(Flask):
#    jinja_options = dict(Flask.jinja_options,
#            variable_start_string='{%=',
#            variable_end_string='%}')

#app = SubFlask(__name__)
app = Flask(__name__)
app.config.from_pyfile('config.cfg')
app.config.from_envvar('SETTINGS', silent=True)
app.secret_key = app.config.get('SESSION_SECRET_KEY')
app.remember_cookie_duration = timedelta(days=31)
app.permanent_session_lifetime = timedelta(days=31)

login_manager = LoginManager()
login_manager.setup_app(app)

storage = Storage(app.config.get("DRAFTS_DIR"), app)

JSON_LD_MIME_TYPE = 'application/ld+json'

@app.context_processor
def global_view_variables():
    mtime = os.stat(here).st_mtime
    return {'modified': datetime.fromtimestamp(mtime)}



@login_manager.user_loader
def _load_user(uid):
    app.logger.debug("Loading user %s " % uid)
    app.logger.debug("Sigel in session %s" % session.get('sigel'))
    if not 'sigel' in session:
        return None
    return User(uid, sigel=session.get('sigel'))

@login_manager.unauthorized_handler
def _handle_unauthorized():
    return redirect("/login")


# LOGIN START
# ----------------------------

@app.route("/login", methods=["GET", "POST"])
def login():
    msg = None
    remember = False
    if request.method == "POST" and "username" in request.form:
        username = request.form["username"]
        password = request.form["password"]
        if "remember" in request.form:
            remember = True
        app.logger.debug("remember %s" % remember)
        user = User(username)
        if getattr(app, 'fakelogin', False):
            sigel = "NONE"
        else:
            sigel = user.authorize(password, app.config)
        if sigel == None:
            sigel = ""
            msg = u"Kunde inte logga in. Kontrollera användarnamn och lösenord."
        else:
            user.sigel = sigel
            session['sigel'] = sigel
            login_user(user, remember)
            session.permanent = remember
            app.logger.debug("User %s logged in with sigel %s" % (user.username, user.sigel))
            return redirect("/")
    return render_template("partials/login.html", msg = msg, remember = remember)

@app.route("/signout")
@login_required
def logout():
    "Trying to sign out..."
    logout_user()
    session.pop('sigel', None)
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
@login_required
def index(source=None, rec_type=None, rec_id=None):
    return render_template('index.html', user=current_user, partials = {"/partials/index" : "partials/index.html"}, debug = app.debug, WHELK_HOST = app.config['CLIENT_WHELK_HOST'])

# SEARCH TEMPLATE 
@app.route("/search/<record_type>")
@login_required
def search(record_type):
    return render_template('index.html', partials = {"/partials/search" : "partials/search.html"}, debug = app.debug, WHELK_HOST = app.config['CLIENT_WHELK_HOST'])

# PARTIAL TEMPLATES
@app.route("/partials/<path:path>")
@login_required
def show_partial(path):
    return render_template('partials/%s.html' % path)

# SNIPPETS TEMPLATES
@app.route("/snippets/<path:path>")
@login_required
def show_snippets(path):
    print '%s.html' % path
    return send_from_directory('templates/snippets/', '%s.html' % path)

# INITIAL STATIC RECORD
@app.route("/record/template/<type>", methods=["GET"])
@login_required
def get_template(type):
    return raw_json_response(open(os.path.join(here, "examples/templates/%s.json" % type), 'r').read())

# RESOURCES
@app.route("/resource/<path:path>")
@login_required
def get_resource(path):
    if path == 'translation':
        language = request.args.get('lang')
        if(language == 'se'):
            return raw_json_response(open(os.path.join(here, "examples/translations/label_%s.json" % language), 'r').read())    
    else:
        return get_dataset("resource/%s?%s" % (path, request.query_string))

# STYLEGUIDE
@app.route("/styleguide/")
@login_required
def show_styleguide():
    return render_template('styleguide/style.html' )

# ----------------------------
# STATIC CONTENT END



# WHELK API PROXY START
# ----------------------------

@app.route("/whelk-webapi", methods=['GET', 'PUT', 'POST', 'DELETE'])
@app.route("/whelk-webapi/<path:path>", methods=['GET', 'PUT', 'POST', 'DELETE'])
@login_required
def proxy_request(path=''):

    # Modify headers
    headers = extract_x_forwarded_for_header(request)
    headers['content-type'] = JSON_LD_MIME_TYPE
    if 'If-match' in request.headers:
        headers['If-match'] = request.headers['If-match']

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

    storage.update_draft(current_user.get_id(), rec_type, request.data, etag, draft_id)
    return json.dumps(request.json)

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
    app.logger.debug('Sending request %s to: %s' % (method, url));

    try:
        if method == 'POST':
            response = requests.post(url, params=params, headers=headers, data=data)
        elif method == 'PUT':
            response = requests.put(url, params=params, headers=headers, data=data, allow_redirects=allow_redirects)
        elif method == 'DELETE':
            response = requests.delete(url, headers=headers, allow_redirects=allow_redirects)
        else:
            response = requests.get(url, params=params, headers=headers, allow_redirects=allow_redirects)

    except requests.exceptions.RequestException as e:
        app.logger.warning(e)
        if response:
            app.logger.warning("Error response %s on %s <%s>" % (response.status_code, method, url))
            abort(response.status_code)

    app.logger.debug('Got response: %s' % response.status_code);
    
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
            app.logger.warning('Error status code 201 but no Location header, %s', (method))

    # This is what the server returns when deleting a holding, handle it:
    elif response.status_code == 204:
        return ''

    # Error
    else:
        app.logger.warning('Error response %s on %s <%s>' % (response.status_code, method, url))
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
    app.debug = opts.debug
    app.fakelogin = opts.fakelogin
    app.run(host='0.0.0.0')
