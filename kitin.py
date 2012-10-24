#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import json
import urllib2
import logging
from flask import Flask, render_template, request, make_response, abort, redirect, url_for
from flask_login import *
from werkzeug import secure_filename
import requests
from babydb import Storage, User
from flask_login import UserMixin
from sqlalchemy.orm import mapper
#from spill import Spill


app = Flask(__name__)
app.config.from_pyfile('config.cfg')
app.config.from_envvar('SETTINGS', silent=True)
app.secret_key = 'secret key'

login_manager = LoginManager()
login_manager.setup_app(app)

storage = Storage(app.config)

logger = logging.getLogger(__name__)


@app.route("/")
def start():
    open_records = []
    if app.config.get('MOCK_API', False):
        open_records = list(find_mockdata_record_summaries())
    return render_template('home.html',
            name="Guest",
            record_templates=find_record_templates(),
            open_records=open_records,
            user = current_user if current_user.is_active() else None)


@app.route("/search")
def search():
    q = request.args.get('q')
    search_results = None
    b = request.args.get('b', None)
    boost = ("&boost=%s" % b) if b else ''
    if q:
        resp = requests.get("%sbib/kitin/_search?q=%s%s" % (
            app.config['WHELK_HOST'], q, boost))
        data = json.loads(resp.text)
        search_results = [get_record_summary(item['data']) for item in data['list']]
    return render_template('search.html', **vars())


@app.route("/mockups/<name>")
def show_mockup(name):
    return render_template('mockups/'+ name +'.html')


@app.route("/profile")
def profile():
    return render_template('mockups/profile.html')


@app.route('/user/<name>')
def user_home(name=None):
    """dummy"""
    return render_template('home.html', name=name)


@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    """working, called by form in upload.html - testpage"""
    """Upload marc document from either local file system or from whelk. Save to kitin db."""
    if request.method == 'POST':
        uid = request.form['uid']
        if request.form.get('files', None):
            f = request.files['jfile']
            fname = secure_filename(f.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], fname)
            f.save(filepath)
            json_text = open(filepath)
            json_data = json.load(json_text)
            print "json", type(json_data)

        elif request.form.get('backend', None):
            bibid = request.form['bibid']
            bpost = requests.get("%sbib/%s" % (app.config['WHELK_HOST'], bibid))
            json_data = json.loads(bpost.text)['marc']
        #get table and save record
        bibid = json_data.get('001', None)
        mid = storage.save2(bibid, uid, json_data)
        return render_template('view.html', marcposts = [(str(mid), json.dumps(json_data))], uid = uid )
    else:
        return render_template('upload.html')


@app.route('/record/bib/<id>/draft', methods=['POST'])
def save_draft(id):
    """Save draft to kitin, called by form"""
    json_data = request.data
    if exists_as_draft(id):
        storage.update(id, json_data)
    else:
        storage.save(id, json_data)
    return json.dumps(request.json)


@app.route('/record/bib/<id>', methods=['PUT'])
def update_document(id):
    """Saves updated records to whelk (Backbone would send a POST if the record isNew)"""
    # IMP: Using request.data is enough; do we really need this json validation?
    json_string = json.dumps(request.json)
    headers = {'content-type': 'application/json'}
    response = requests.put("%sbib/%s" % (app.config['WHELK_HOST'], id), data=json_string, headers=headers)
    if response.status_code >= 400:
        abort(response.status_code)
    else:
        if exists_as_draft(id):
            storage.delete(id)
    return raw_json_response(json_string)


@app.route('/record/bib/<id>', methods=['GET'])
def show_record(id):
    # TODO: Check if exists as draft and fetch from local db if so..!
    if app.config.get('MOCK_API', False):
        response = requests.Response()
        response.status_code = 200
        response.raw = open(mockdatapath('bib', id))
    else:
        response = requests.get("%s/bib/%s" % (app.config['WHELK_HOST'], id))
    if request.is_xhr:
        if response.status_code >= 400:
            abort(response.status_code)
        return raw_json_response(response.text)
    if not response:
        return render_template('bib.html')
    else:
        json_post = json.loads(response.text)
        return render_template('bib.html', data=json_post)


@app.route('/record/bib/<id>/lite')
def render_lite(id):
    return render_template('lite.html')


@app.route('/marcmap.json')
def get_marcmap():
    with open(app.config['MARC_MAP']) as f:
        return raw_json_response(f.read())


@app.route('/record/create', methods=['POST'])
def create_record():
    tplt_name = request.form.get('template')
    # FIXME: just a hack to test!
    import shutil as sh
    tplt_fpath = mockdatapath('templates', tplt_name)
    new_id = 'new-record' # + tplt_name
    created_fpath =  mockdatapath('bib', new_id)
    sh.copy(tplt_fpath, created_fpath)
    return redirect(url_for('render_lite', id=new_id))


@app.route('/suggest/auth')
def suggest_auth_completions():
    q = request.args.get('q')
    if app.config.get('MOCK_API', False):
        with open(os.path.join(app.root_path, 'templates/mockups/auth_suggest.json')) as f:
            return raw_json_response(f.read())
    response = requests.get("%s/suggest/_complete?name=%s" % (app.config['WHELK_HOST'], q))
    if response.status_code >= 400:
        abort(response.status_code)
    return raw_json_response(response.text)


@app.route('/lookup/<uid>')
def lookup(uid=None):
    """List marc documents available in kitin for given user id."""
    try:
        posts = list(storage.find_by_user(uid))

        if not posts:
            return "no marcposts available for user %s, please try another uid" % uid

        elif len(theposts) == 1:
            post = posts[0]
            print "one record:", post.id
            spill = Spill(post.marc).get_spill()
            print "spill: ", spill

        raw_items = [(post.id, json.dumps(post.marc)) for post in posts]
        return render_template('view.html', marcposts=raw_items, uid=uid)

    except Exception as e:
        print "exc", e
        return "failed"


@app.route('/save', methods=['GET', 'POST'])
def save_to_db():
    """Save draft to kitin, or publish document to whelk and remove from kitin.
    called by form in view.html"""
    if request.method == 'POST':
        json_text = request.form['jdata']
        json_data = json.loads(json_text)
        uid = request.form['uid']
        mid = request.form['mid']
        bibid = json_data.get('001', None)
        nollotta = json_data.get('008', None)
        print "08: -%s-" % nollotta
        if not bibid:
            try:
                bibid = jd['035'][3]['9']
            except:
                bibid = '666'

        if request.form.get('publish', None):
            bjson = '{"uid": %s, "marc": %s}' % (uid, json_text)
            r = requests.put("%sbib/%s" % (app.config['WHELK_HOST'], bibid),
                    data=bjson.encode('utf-8'))
            print "published"
            storage.delete(mid)
            print "deleted draft"

        elif request.form.get('draft', None):
            storage.update(mid, json_data)
            print "saved draft"
            return "tack"

        return "tack"


def raw_json_response(s):
    resp = make_response(s)
    resp.headers['Content-Type'] = 'application/json'
    return resp

def exists_as_draft(id):
    return storage.exists(id)


def get_record_summary(data):
    fields = {}
    for field in data['fields']:
        for k, v in field.items():
            fields.setdefault(k, []).append(v)
    has_author = '100' in fields
    try:
        tit = "%s %s" % (fields['245'][0]['subfields'][0]['a'], fields['245'][0]['subfields'][1]['b'])
    except Exception as e:
        tit=fields['245'][0]['subfields'][0]['a'] if '245' in fields else 'N/A'
    return dict(
        id=fields['001'][0] if '001' in fields else 'N/A',
        isbn=fields['035'][0]['subfields'][0].get('9', "")
                if '035' in fields else "",
        title=tit,
        author=fields['100'][0]['subfields'][0]['a'] if has_author else "",
        # TODO: 'd' can be at another offset?
        author_extra=fields['100'][0]['subfields'][1].get('d', '')
            if has_author and len(fields['100'][0]['subfields']) > 1 else "")


def find_record_templates():
    """Use to list drafts and templates in local dir."""
    for fname in os.listdir(mockdatapath('templates')):
        ext = '.json'
        if not fname.endswith(ext):
            continue
        yield fname.replace(ext, '')


def find_mockdata_record_summaries():
    fdir = mockdatapath('bib')
    for fname in os.listdir(fdir):
        if not fname.endswith('.json'):
            continue
        with open(os.path.join(fdir, fname)) as f:
            try:
                data = json.load(f)
            except Exception as e:
                app.logger.exception(e)
                continue
            if 'fields' not in data:
                app.logger.warning("File %s is not in proper marc-json" % f.name)
                continue
            yield get_record_summary(data)


def mockdatapath(rectype, recid=None):
    dirpath = os.path.join(app.root_path, 'examples', rectype)
    if recid:
        return os.path.join(dirpath, recid +'.json')
    else:
        return dirpath



@login_manager.user_loader
def _load_user(uid):
    """Get user by uid from bibdb? Return None if uid is not valid. Ensure uid is unicode."""
    print "loading user from nowhere"
    return User(uid)


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST" and "username" in request.form:
        print "trying to log in"
        username = request.form["username"]
        password = request.form["password"] 
        remember = request.form.get("remember", "no") == "yes"
        user = storage.load_user(username, password)
        if (user):
            login_user(user, remember)

            flash("Logged in!")
        else:
            flash("No such user.")

    elif "signout" in request.form and current_user:
        try:
            logout_user()
        except Exception as e:
            print "FAIL: %s" % e
            return render_template("home.html")
        user = None

    print "current_user: ", current_user
    return render_template("home.html", user = current_user if current_user.is_active() else None)

@app.route("/signout")
@login_required
def logout():
    logout_user()
    return render_template("home.html")

if __name__ == "__main__":
    from optparse import OptionParser
    oparser = OptionParser()
    oparser.add_option('-d', '--debug', action='store_true', default=False)
    oparser.add_option('--mockapi', action='store_true', default=False)
    oparser.add_option('-m', '--marcmap', type=str, default="marcmap.json")
    opts, args = oparser.parse_args()
    app.debug = opts.debug
    app.config['MOCK_API'] = opts.debug and opts.mockapi
    app.config['MARC_MAP'] = opts.marcmap
    app.run(host='0.0.0.0')

