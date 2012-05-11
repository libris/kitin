#!/usr/bin/env python
# -*- coding: utf-8 -*-
from flask import Flask, render_template, request, make_response
from werkzeug import secure_filename
import os, json
from pprint import pprint
from sqlalchemy import *
import pickle
#from babydb import Marcpost
import requests
from spill import Spill

app = Flask(__name__)
app.config.from_pyfile('config.cfg')
app.config.from_envvar('SETTINGS', silent = True)

def _db_string():
    return "%s:///%s" %(app.config['DBENGINE'], app.config['DBNAME'])

db = create_engine(_db_string())
db.echo = True
metadata = MetaData(db)

@app.route("/")
def start():
    return render_template('start.html')

@app.route("/monografi.html")
def monografi():
    return render_template('monografi.html')

@app.route("/new_bibliographic.html")
def new_bibliographic():
    return render_template('new_bibliographic.html')

@app.route("/profile.html")
def profile():
    return render_template('profile.html')

@app.route('/user/<name>')
def show_user(name=None):
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
        #get table and save post
        marcpost = Table('marcpost', metadata, autoload=True)
        bi = json_data.get('001', None)
        i = marcpost.insert()
        print "type jsondata", type(json_data)
        r = i.execute(marc=pickle.dumps(json_data), bibid=bi, userid=uid)
        mid = str(r.last_inserted_ids()[0])
        return render_template('view.html', marcposts = [(mid, json.dumps(json_data))], uid = uid )
    else:
        return render_template('upload.html')

@app.route('/record/<bibid>')
def browse_document(bibid):
    post = requests.get("%s/bib/%s" % (app.config['WHELK_HOST'], bibid))
    if not post:
        return render_template('monografi.html')
    if request.is_xhr:
        resp = make_response(post.text)
        resp.headers['Content-Type'] = 'application/json'
        return resp
    else:
        json_post = json.loads(post.text)
        return render_template('monografi.html', data = json_post)

@app.route('/lookup/<uid>')
def lookup(uid=None):
    """List marc documents available in kitin for given user id."""
    try:
        marcpost = Table('marcpost', metadata, autoload=True)
        thequery = marcpost.select(marcpost.c.userid == uid)
        theposts = thequery.execute().fetchall()
        if len(theposts) == 1:
            print "one post"
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

if __name__ == "__main__":
    from sys import argv
    if '-d' in argv:
        app.debug = True
    app.run()



