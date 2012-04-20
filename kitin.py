#!/usr/bin/env python
from flask import Flask, render_template, request
from werkzeug import secure_filename
import os, json
from pprint import pprint
from sqlalchemy import *
import pickle


app = Flask(__name__)
UPLOAD_FOLDER = '/Users/lisa/dev/kitin/storage/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

db = create_engine('sqlite:///kitin.db')
db.echo = True
metadata = MetaData(db)

@app.route("/")
def start():
    return render_template('start.html')

@app.route("/monografi.html")
def monografi():
    return render_template('monografi.html')

@app.route('/user/<name>')
def show_user(name=None):
    return render_template('home.html', name=name)

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        #get and save file
        f = request.files['jfile']
        fname = secure_filename(f.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], fname)
        f.save(filepath)
        json_file = open(filepath)
        json_data = json.load(json_file)
        pprint(json_data)

        #get table and save post
        marcpost = Table('marcpost', metadata, autoload=True)
        bi = json_data.get('001', None)
        i = marcpost.insert()
        i.execute(marc=pickle.dumps(json_data), bibid=bi)

        #get post
        #s = marcpost.select()
        #rs = s.execute()
        #row = rs.fetchone()
        #marcet = pickle.loads(row['marc'])
        #hundra = marcet.get('100', 'inget')
        #for sf in hundra:
        #    print sf
        #print json_data.get('100', "nej")
        return "tack"
    else:
        return render_template('upload.html')

@app.route('/lookup/<bibid>/<field>')
def lookup(bibid=None, field=None):
    try:
        marcpost = Table('marcpost', metadata, autoload=True)
        s = marcpost.select(marcpost.c.bibid == bibid)
        print "s", s
        rs = s.execute()
        print "executed"
        print "size", rs.rowcount()
        row = rs.fetchone()
        return row
        themarc = pickle.loads(row['marc'])
        return themarc
        thefield = themarc.get(field, 'inget')
        return thefield
    except Exception as e:
        print "exc", e

if __name__ == "__main__":
    from sys import argv
    if '-d' in argv:
        app.debug = True
    app.run()
