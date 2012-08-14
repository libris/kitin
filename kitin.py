#!/usr/bin/env python
# -*- coding: utf-8 -*-
from flask import Flask, render_template, request, make_response, abort
from werkzeug import secure_filename
import os, json
from pprint import pprint
from sqlalchemy import *
import pickle
#from babydb import Marcpost
import requests
#from spill import Spill


app = Flask(__name__)
app.config.from_pyfile('config.cfg')
app.config.from_envvar('SETTINGS', silent = True)


def _db_string():
    return "%(DBENGINE)s:///%(DBNAME)s" % app.config

db = create_engine(_db_string())
db.echo = True
metadata = MetaData(db)


@app.route("/")
def start():
    open_records = []
    if app.config['MOCK_API']:
        open_records = list(find_mockdata_record_summaries())
    return render_template('search.html',
            open_records=open_records)


@app.route("/search")
def search():
    q = request.args.get('q')
    search_results = None
    if q:
        resp = requests.get("%sbib/kitin/_search?q=%s" % (
            app.config['WHELK_HOST'], q))
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
    return render_template('home.html', name=name)


@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
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
        marcpost = Table('marcpost', metadata, autoload=True)
        bi = json_data.get('001', None)
        i = marcpost.insert()
        print "type jsondata", type(json_data)
        r = i.execute(marc=pickle.dumps(json_data), bibid=bi, userid=uid)
        mid = str(r.last_inserted_ids()[0])
        return render_template('view.html', marcposts = [(mid, json.dumps(json_data))], uid = uid )
    else:
        return render_template('upload.html')


@app.route('/record/bib/<id>/draft', methods=['POST'])
def save_draft(id):
    """Save draft to kitin"""
    json_data = request.data
    table = Table('marcpost', metadata, autoload=True)
    if exists_as_draft(id):
        newmp = table.update().where(table.c.id == id).values(marc=pickle.dumps(json_data))
        db.execute(newmp)
    else:
        insert = table.insert()
        insert.execute(id=id, marc=pickle.dumps(json_data))
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
            db.execute(table.delete().where(table.c.id == id))
    return raw_json_response(json_string)

@app.route('/record/bib/<id>', methods=['GET'])
def browse_document(id):
    # TODO: Check if exists as draft and fetch from local db if so..!
    if app.config['MOCK_API']:
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


@app.route('/suggest/auth')
def suggest_auth_completions():
    q = request.args.get('q')
    if app.config['MOCK_API']:
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
        marcpost = Table('marcpost', metadata, autoload=True)
        thequery = marcpost.select(marcpost.c.userid == uid)
        theposts = thequery.execute().fetchall()
        if len(theposts) == 1:
            print "one record"
            json_text = pickle.loads(theposts[0]['marc'])
            print "one"
            print "two"
            mid = theposts[0].id
            print "three"
            spill = Spill(json_text).get_spill()
            print "spill: ", spill
            return render_template('view.html', marcposts = [(mid, json.dumps(json_text))], uid = uid)


        if len(theposts) > 1:
            print "many"
            themarcs = [(thepost.id, json.dumps(pickle.loads(thepost.marc))) for thepost in theposts]
            return render_template('view.html', marcposts = themarcs, uid = uid, )

        else:
            return "no marcposts available for user %s, please try another uid" % uid

    except Exception as e:
        print "exc", e
        return "failed"


@app.route('/save', methods=['GET', 'POST'])
def save_to_db():
    """Save draft to kitin, or publish document to whelk and remove from kitin."""
    if request.method == 'POST':
        json_text = request.form['jdata']
        json_data = json.loads(json_text)
        uid = request.form['uid']
        mid = request.form['mid']
        bibid = json_data.get('001', None)
        nollotta = json_data.get('008', None)
        print "08: -%s-" % nollotta
        mp = Table('marcpost', metadata, autoload=True)
        if not bibid:
            try:
                bibid = jd['035'][3]['9']
            except:
                bibid = '666'

        if request.form.get('publish', None):

            bjson = '{"uid": %s, "marc": %s}' % (uid, json_text)
            r = requests.put("%sbib/%s" % (app.config['WHELK_HOST'], bibid), data = bjson.encode('utf-8'))
            print "published"
            delmp = mp.delete().where(mp.c.id==mid)
            db.execute(delmp)
            print "deleted draft"
        elif request.form.get('draft', None):
            newmp = mp.update().where(mp.c.id==mid).values(marc=pickle.dumps(json_data))
            db.execute(newmp)

            print "saved draft"
            return "tack"

        return "tack"


def raw_json_response(s):
    resp = make_response(s)
    resp.headers['Content-Type'] = 'application/json'
    return resp

def exists_as_draft(id):
    table = Table('marcpost', metadata, autoload=True)
    return table.select().where(exists([table.c.id], and_(table.c.id == id))).execute().scalar()


def get_record_summary(data):
    fields = {}
    for field in data['fields']:
        for k, v in field.items():
            fields.setdefault(k, []).append(v)
    has_author = '100' in fields
    return dict(
            id=fields['001'][0],
            isbn=fields['035'][0]['subfields'][0].get('9', "")
                    if '035' in fields else "",
            title=fields['245'][0]['subfields'][0]['a'],
            author=fields['100'][0]['subfields'][0]['a'] if has_author else "",
            # TODO: 'd' can be at another offset?
            author_extra=fields['100'][0]['subfields'][1].get('d', '')
                        if has_author and len(fields['100'][0]['subfields']) > 1
                        else "")


def find_mockdata_record_summaries():
    bibdir = mockdatapath('bib')
    for fname in os.listdir(bibdir):
        if not fname.endswith('.json'):
            continue
        with open(os.path.join(bibdir, fname)) as f:
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
    app.run()

