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
import uuid
from flask import (Flask, render_template, request, make_response, Response,
        abort, redirect, url_for, Markup, session)
from flask_login import LoginManager, login_required, login_user, flash, current_user, logout_user
import jinja2
import requests
from storage import Storage
from user import User


here = os.path.dirname(os.path.abspath(__file__))
logger = logging.getLogger(__name__)
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

storage = Storage(app.config.get("DRAFTS_DIR"))

JSON_LD_MIME_TYPE = 'application/ld+json'



@login_manager.user_loader
def _load_user(uid):
    print "Loading user %s " % uid
    print "Sigel in session %s" % session.get('sigel')
    if not 'sigel' in session:
        return None
    return User(uid, sigel=session.get('sigel'))

@login_manager.unauthorized_handler
def _handle_unauthorized():
    return redirect("/login")


@app.context_processor
def global_view_variables():
    mtime = os.stat(here).st_mtime
    return {'modified': datetime.fromtimestamp(mtime)}


@app.route("/")
@login_required
def index():
    return render_template('index.html', user=current_user, partials = {"/partials/index" : "partials/index.html"}, debug = app.debug)


@app.route("/login", methods=["GET", "POST"])
def login():
    msg = None
    remember = False
    if request.method == "POST" and "username" in request.form:
        username = request.form["username"]
        password = request.form["password"]
        if "remember" in request.form:
            remember = True
        print "remember %s" % remember
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
            print "User logged in"
            print "User %s logged in with sigel %s" % (user.username, user.sigel)
            return redirect("/")
    return render_template("partials/login.html", msg = msg, remember = remember)

@app.route("/signout")
@login_required
def logout():
    "Trying to sign out..."
    logout_user()
    session.pop('sigel', None)
    return redirect("/login")



# SEARCH START
# ----------------------------

@app.route("/search/<record_type>")
@login_required
def search(record_type):
    return render_template('index.html', partials = {"/partials/search" : "partials/search.html"})

@app.route("/search/<record_type>.json")
def search_json(record_type):
    search_path = "/%s/_search" % record_type
    if(record_type == "remote"):
        search_path = '_remotesearch'
        
    resp = do_search(search_path)
    return raw_json_response(resp.text)

def do_search(service_path):
    args = request.args.copy()
    # Special handle some parameters.
    if args.get('b'):
        args.add('boost', args.get('b'))
        args.pop('b')
    if args.get('f'):
        f = args.get('f').replace('/','\\/').strip()
        del args['f']
        args.add('f', f)

    return  do_request(
                service_path, 
                params=args, 
                headers=extract_x_forwarded_for_header(request)
            )

# ----------------------------
# SEARCH END

# RECORD START
# ----------------------------

@app.route("/record/<rec_type>", methods=["GET"])
@login_required
def get_template(rec_type):
    """Returns a template object"""
    if rec_type == 'bib':
        return raw_json_response(open(os.path.join(here, "examples/templates/monografi.json"), 'r').read())

@app.route('/record/<rec_type>/<rec_id>', methods=["GET"])
@login_required
def get_bib_data(rec_type, rec_id):

    # TODO: How check if user is logged in?
    response = do_request("/%s/%s" % (rec_type, rec_id))
    resp = raw_json_response(response.text)
    resp.headers['etag'] = response.headers['etag']
    return resp

@app.route('/record/<record_type>/<record_id>/holdings', methods=["GET"])
@login_required
def get_holdings(record_type, record_id):
        bibnr = record_id.split("/")[-1]
        resp = do_request("/hold/_search?q=*+about.annotates.@id:\/resource\/bib\/%s" % bibnr)
        return raw_json_response(resp.text)

@app.route('/record/<rec_type>/<rec_id>', methods=['PUT'])
@login_required
def update_document(rec_type, rec_id):
    #Saves updated records to whelk
    json_string = json.dumps(request.json)
    if_match = request.headers['If-match']
    h = {'content-type': JSON_LD_MIME_TYPE, 'If-match': if_match}
    response = do_request(
        path="/bib/%s" % rec_id, 
        method='PUT', 
        data=json_string, 
        headers=h, 
        allow_redirects=True
    )
    # Delete draft
    storage.delete_draft(current_user.get_id(), "bib", rec_id)

    resp = raw_json_response(response.text)
    resp.headers['etag'] = response.headers['etag'].replace('"', '')
    return resp

@app.route('/record/bib/create', methods=['POST'])
@login_required
def create_record():
    response = do_request(
        path='/', 
        method='POST', 
        data=json.dumps(request.json), 
        headers={'content-type': JSON_LD_MIME_TYPE, 'format': 'jsonld'}, 
        allow_redirects=False
    )
    resp = raw_json_response(response.text)
    resp.headers['etag'] = response.headers['etag'].replace('"', '')
    return resp

# ----------------------------
# RECORD END



# HOLDING START
# ----------------------------

@app.route('/holding/<holding_id>', methods=['GET'])
@login_required
def get_holding(holding_id):
    response = do_request("/hold/%s" % holding_id)
    resp = raw_json_response(response.text)
    resp.headers['etag'] = response.headers['etag'].replace('"', '')
    return resp

@app.route("/holding/bib/new", methods=["GET"])
@login_required
def get_holding_template():
    return raw_json_response(open(os.path.join(here, "examples/templates/holding.json"), 'r').read())

@app.route('/holding', methods=['POST'])
@login_required
def create_holding():
    response = do_request(
        path="/hold/", 
        method='POST', 
        data=request.data, 
        allow_redirects=False
    )
    resp = raw_json_response(response.text)
    resp.headers['etag'] = response.headers['etag'].replace('"', '')
    return resp

@app.route('/holding/<holding_id>', methods=['PUT'])
@login_required
def save_holding(holding_id):
    if_match = request.headers.get('If-match')
    response = do_request(
        path="/hold/%s" % holding_id, 
        method='PUT', 
        data=request.data, 
        headers={'content-type': JSON_LD_MIME_TYPE, 'If-match': if_match}, 
        allow_redirects=True
    )
    
    resp = raw_json_response(response.text)
    resp.headers['etag'] = response.headers['etag'].replace('"', '')
    return resp
    
@app.route('/holding/<holding_id>', methods=['DELETE'])
@login_required
def delete_holding(holding_id):
    response = do_request("/hold/%s" % holding_id, method='DELETE')
    return make_response("success")

# ----------------------------
# HOLDING END


# DRAFT START
# ----------------------------

@app.route('/drafts', methods=['GET'])
@login_required
def get_drafts():
    drafts = storage.get_drafts_as_json(current_user.get_id())
    return raw_json_response(drafts)

@app.route('/draft/<rec_type>/<draft_id>', methods=['GET'])
@login_required
def get_draft(rec_type, draft_id):
    draft = storage.get_draft(current_user.get_id(), rec_type, draft_id)
    if(draft):
        json_data = json.loads(draft)
        resp = raw_json_response(json.dumps(json_data))
        resp.headers['etag'] = json_data['etag']
        return resp
    else:
        abort(404)

@app.route('/draft/<rec_type>', methods=['POST'])
@login_required
def create_draft(rec_type):
    #!TODO handle etag properly
    etag = ''
    if('If-match' in request.headers):
        etag = request.headers['If-match']

    #Remember that this is a draft
    draft_id =  'draft-'  + str(uuid.uuid4())
    json_data = json.dumps({
      'isDraft': True,
      'draft_id': rec_type + '/' + draft_id,
      'document': json.loads(request.data),
      'etag': etag
    });
    storage.save_draft(current_user.get_id(), rec_type, draft_id, json_data,'')
    return json_data

@app.route('/draft/<rec_type>/<draft_id>', methods=['PUT'])
@login_required
def save_draft(rec_type, draft_id):
    """Save draft to kitin, called by form"""
    #!TODO handle etag properly
    etag = ''
    if('If-match' in request.headers):
        etag = request.headers['If-match']

    json_data = json.dumps({
      'isDraft': True,
      'draft_id': rec_type + '/' + draft_id,
      'document': json.loads(request.data),
      'etag': etag
    });
    storage.update_draft(current_user.get_id(), rec_type, draft_id, json_data,'')
    return json.dumps(request.json)

@app.route('/draft/<rec_type>/<draft_id>', methods=['DELETE'])
@login_required
def delete_draft(rec_type, draft_id):
    storage.delete_draft(current_user.get_id(), rec_type, draft_id)
    return redirect("/drafts", code=303)

# ----------------------------
# DRAFT END



# TRANSLATION START
# ----------------------------
# MOVE INTO DEF?
@app.route("/translation/", methods=["GET"])
@login_required
def get_labels():
    language = request.args.get('lang')
    if(language == 'se'):
        return raw_json_response(open(os.path.join(here, "examples/translations/label_%s.json" % language), 'r').read())

# ----------------------------
# TRANSLATION END

@app.route("/def")
@login_required
def def_completions():
    response = do_request(
        path="/def/_search",
        params=request.args
    )
    return raw_json_response(response.text)

@app.route("/deflist/<path:path>")
@login_required
def get_def(path):
    return get_dataset("def/%s" % path)

@app.route("/resource/<path:path>")
@login_required
def get_resource(path):
    return get_dataset("resource/%s?%s" % (path, request.query_string))

@app.route('/edit/<rec_type>/<rec_id>')
@login_required
def show_edit_record(rec_type, rec_id):
    return index()

@app.route('/marc/<rec_type>/<rec_id>')
@login_required
def show_marc_record(rec_type, rec_id):
    return index()
    #return render_template('index.html', partials = {"/partials/frbr" : "partials/frbr.html"})

@app.route('/jsonld/<rec_type>/<rec_id>')
@login_required
def show_jsonld_record(rec_type, rec_id):
    return index()

@app.route('/marcmap.json')
@login_required
def get_marcmap():
    path = "/resource/_marcmap"
    response = do_request(path)
    return raw_json_response(response.text)

@app.route('/suggest/<indextype>')
@login_required
def suggest_completions(indextype):
    q = request.args.get('q')
    response = do_request("/%s/_search?q=%s" % (indextype, q))
    return raw_json_response(response.text)

@app.route("/partials/<path:path>")
@login_required
def show_partial(path):
    return render_template('partials/%s.html' % path)

@app.route("/styleguide/")
@login_required
def show_styleguide():
    return render_template('styleguide/style.html' )



# UTILS 
# -------------------

def do_request(path, params=None, method='GET', headers=None, data=None, allow_redirects=False, host=app.config['WHELK_HOST']):
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
        return response
    # Updated/Created
    elif response.status_code == 201:
        if 'Location' in response.headers:
            return do_request(response.headers['Location'],host='')
        else:
            app.logger.warning('Error status code 201 but no Location header, %s', (method))

    # Error
    else:
        app.logger.warning('Error response %s on %s <%s>' % (response.status_code, method, url))
        abort(response.status_code)

def get_dataset(path, cache=False):
    remote_resp = do_request('/%s' % path)
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
