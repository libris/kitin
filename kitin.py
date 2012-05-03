#!/usr/bin/env python
# -*- coding: utf-8 -*-
from flask import Flask, render_template, request
from werkzeug import secure_filename
import os, json
from pprint import pprint
from sqlalchemy import *
import pickle
#from babydb import Marcpost
import requests
from config import appconfig as ac, ac as kc


app = Flask(__name__)
for key, value in ac.items(): 
    app.config[key] = value

db = create_engine(_db_string())
db.echo = True
metadata = MetaData(db)

def _db_string():
    return "%s:///%s", (kc['DBENGINE'], kc['DBNAME'])

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
            bpost = requests.get("%s/bib/%s" % (kc['WHELK_HOST'], bibid))
            json_data = json.loads(bpost.text)['marc']
        #get table and save post
        marcpost = Table('marcpost', metadata, autoload=True)
        bi = json_data.get('001', None)
        i = marcpost.insert()
        r = i.execute(marc=pickle.dumps(json_data), bibid=bi, userid=uid)
        mid = str(r.last_inserted_ids()[0])
        return render_template('view.html', marcposts = [(mid, json.dumps(json_data))], uid = uid )
    else:
        return render_template('upload.html')

@app.route('/lookup/<uid>')
def lookup(uid=None):
    """List marc documents available in kitin for given user id."""
    try:
        marcpost = Table('marcpost', metadata, autoload=True)
        thequery = marcpost.select(marcpost.c.userid == uid)
        theposts = thequery.execute().fetchall()
        if len(theposts) == 1:
            print "one"
            json_text = pickle.loads(theposts[0]['marc'])
            #json_data = json.(json_text)
            mid = theposts[0].id
            
            return render_template('view.html', marcposts = [(mid, json.dumps(json_text))], uid = uid)


        if len(theposts) > 1:
            print "many"
            themarcs = [(thepost.id, json.dumps(pickle.loads(thepost.marc))) for thepost in theposts]
            return render_template('view.html', marcposts = themarcs, uid = uid, )

        else:
            return "no marcposts available for user %s" % uid

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
        mp = Table('marcpost', metadata, autoload=True)
        if not bibid:
            try:
                bibid = jd['035'][3]['9']
            except:
                bibid = '666'

        if request.form.get('publish', None):

            bjson = '{"uid": %s, "marc": %s}' % (uid, json_text)
            r = requests.put("%s/bib/%s" % (kc['WHELK_HOST'], bibid), data = bjson.encode('utf-8'))
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



