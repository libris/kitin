#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import json
import urllib2
import logging
from urlparse import urlparse
from flask import Flask, render_template, request, make_response, abort, redirect, url_for, Markup
from flask_login import LoginManager, login_required, login_user, flash, current_user, UserMixin, logout_user
import requests
import re
from storage import Storage, User
import jinja2

app = Flask(__name__)
app.config.from_pyfile('config.cfg')
app.config.from_envvar('SETTINGS', silent=True)
app.secret_key = 'secret key'

login_manager = LoginManager()
login_manager.setup_app(app)

storage = Storage(app.config.get("DRAFTS_DIR"))

logger = logging.getLogger(__name__)


@app.before_request
def before_request():
    if app.debug:
        user = User("kalle", "hemligt", True)
        login_user(user)

#@app.route("/")
def start():
    open_records = []
    user = current_user if current_user.is_active() else None
    print "USER: ", user
    return render_template('home.html',
            user=user,
            record_templates=find_record_templates(),
            open_records=open_records)
    
# How check if user is logged in?
@app.route("/")
@login_required
def index():
    user = current_user if current_user.is_active() else None
    return render_template('index.html', user=user, partials = {"/partials/index" : "partials/index.html"})

@app.route("/search")
def search():
    q = request.args.get('q')
    facet = request.args.get('f', '').strip()
    if facet:
        dedupf = []
        for ftmp in facet.split(' '):
            if ftmp in dedupf:
                dedupf.remove(ftmp)
            else:
                dedupf.append(ftmp)
            facet = ' '.join(dedupf)
    freq = "&f=%s" % facet

    search_results = None
    b = request.args.get('b', '')
    boost = ("&boost=%s" % b) if b else ''
    if q:
        resp = requests.get("%s/bib/kitin/_search?q=%s%s%s" % (
            app.config['WHELK_HOST'], q, freq, boost))
        if request.is_xhr:
           return raw_json_response(resp.text)
    return render_template('index.html', partials = {"/partials/search" : "partials/search.html"})

@app.route('/record/<record_type>/<record_id>/holdings')
def get_holdings(record_type, record_id):
        resp = requests.get("%s/hold/_metasearch?link=%s" % (app.config['WHELK_HOST'], record_id))
        return raw_json_response(resp.text)

@app.route('/holding/<holding_id>', methods=['GET'])
def get_holding(holding_id):
    response = requests.get("%s/hold/%s" % (app.config['WHELK_HOST'], holding_id))
    if response.status_code == 200:
        resp = raw_json_response(response.text)
        resp.headers['etag'] = response.headers['etag'].replace('"', '')
        return resp
    else:
        abort(response.status_code)

@app.route('/holding/<holding_id>', methods=['PUT'])
def save_holding(holding_id):
    if_match = request.headers['If-match']
    h = {'content-type': 'application/json', 'If-match': if_match}
    path = "%s/hold/%s" % (app.config['WHELK_HOST'], holding_id)
    response = requests.put(path, data=request.data, headers=h, allow_redirects=True)
    if response.status_code == 200:
        resp = raw_json_response(response.text)
        resp.headers['etag'] = response.headers['etag'].replace('"', '')
        return resp
    else:
        abort(response.status_code)

@app.route('/holding/<holding_id>', methods=['DELETE'])
def delete_holding(holding_id):
    path = "%s/hold/%s" % (app.config['WHELK_HOST'], holding_id)
    response = requests.delete(path)
    return make_response("success")

@app.route("/resource")
def get_resource():
    restype = request.args.get("type")
    url = "%s/resource/_resourcelist?%s=all" % (
                app.config['WHELK_HOST'], restype)
    resp = requests.get(url)
    return raw_json_response(resp.text)

def get_mockresult():
    with open("mocked_result_set.json") as f:
        return raw_json_response(f.read())

def chunk_number(num):
    number = str(num)
    return re.sub(r'\B(?=(\d{3})+(?!\d))', " ", number)

def get_facet_labels(f_group, f_values):

    mm = json.loads(open(app.config['MARC_MAP']).read())['bib']

    #group labels
    fparts = f_group.split('.')
    f_value_labels = {}
    propref = ''
    label_sv = ''

    #value labels
    if fparts[0] == "leader":
        propref = fparts[2]
        label_sv = _get_fixfield_label(propref, mm['000']['fixmaps'][0]['columns'])
        f_values = _get_value_label(f_values, propref, mm['fixprops'])
    elif fparts[0] == "custom":
        propref = fparts[1]
        label_sv, f_values = _get_custom_label(f_values, propref)

    elif fparts[0] == "fields":
        propref = fparts[3]
        if fparts[1].startswith('00'): #fixfield
            if fparts[3] == 'carrierType':
                f_values = _get_carrier_type(f_values, mm['007']['fixmaps'])
                propref = 'carrierType'
                label_sv = u'B\u00e4rartyp'
            else:
                label_sv = _get_fixfield_label(propref, mm[fparts[1]]['fixmaps'][0]['columns'])
                f_values = _get_value_label(f_values, propref, mm['fixprops'])

        else:
                f_values = dict([(value, [count]) for value, count in f_values.items()])
                label_sv = _get_subfield_label(fparts[1], fparts[3], mm)
    else:
        f_values = dict([(value, [count, value]) for value, count in f_values.items()])

    if not propref == "yearTime1":
        a = sorted(f_values.items(), key=lambda x: x[1][0], reverse=True)

    else:
        a = sorted(f_values.items(), key=lambda x: x[0], reverse=True)

    f_labels = {}
    f_labels['propref'] = propref
    f_labels['label_sv'] = label_sv
    f_labels['link'] = f_group
    f_labels['f_values'] = a#f_values
    return f_labels


def _get_custom_label(f_values, propref):
    #TODO: sync with backend
    specialdict = {"book": "Bok",
                    "audiobook": "Ljudbok",
                    "ebook": "E-bok",
                    "serial": "Tryckt tidskrift",
                    "eserial": "E-tidskrift",
                    "bookSerial": "Bok-/tidskriftstyp"
        }
    for code, count in f_values.items():
        if specialdict.get(code, None):
            f_values[code] = [count, specialdict[code]]
        else:
            f_values[code] = [count, code]
    label_sv = specialdict.get(propref, propref)
    return (label_sv, f_values)


def _get_subfield_label(tag, subfield, mm):
    for sf, sfinfo in mm[tag]['subfield'].items():
        if sf == subfield:
            return sfinfo['label_sv']

    return ""

def _get_carrier_type(f_values, fixmaps):
    for fm in fixmaps:
        for code, count in f_values.items():
            if code in fm['matchKeys']:
                label_sv = fm.get("label_sv", '').strip("&").replace("&", '')
                #TODO remove '&' from sv-labels in marcmap to avoid ugly strip-solution above
                f_values[code] = [count, label_sv]
    return f_values

def _get_value_label(f_values, propref, fp):
    #print "pf", fp
    for code, count in f_values.items():
        if fp.get(propref, None):
            value_label = fp[propref][code]['label_sv']
            f_values[code] = [count, value_label]
        else:
            if code in ['audiobook']:
                f_value[code] = [count, "Ljudbok"]
            f_values[code] = [count, code]

    return f_values

def _get_fixfield_label(pr, columns):
    #pr = PropRef, bibLevel
    #extracting the label of the leader position
    label_sv = pr
    for column in columns:
        try:
            if column['propRef'] == pr:
                label_sv = column.get('label_sv', pr)
                label_sv = label_sv.strip(" (1)")
        except Exception as e:
            print "propRef fail: ", e
            return None
    return label_sv


def _get_field_label(tagdict, fields):
    #extracting standard field label for get_record_summary
    record_info_dict = {}

    for tag in tagdict.keys():
        if tag in fields:
            record_info_dict['label_sv_%s' % tag] = json.loads(open(app.config['MARC_MAP']).read())['bib'][tag].get('label_sv', tag)
 
            if 'ind1' in tagdict[tag].keys():
                try:
                    print "ind1", tag, fields[tag][0]
                    ind1 = fields[tag][0]['ind1']
                    if ind1.strip():
                        ind1 == '_'
                    record_info_dict['tag_%s_ind1_code' % tag] = ind1
                    ind1_info = json.loads(open(app.config['MARC_MAP']).read())['bib'][tag]['ind1'].get(ind1, None)
                    if ind1_info:
                        label_sv = ind1_info.get("label_sv", ind1) 
                        print "label_sv", label_sv
                        record_info_dict['tag_%s_ind1' % tag] = label_sv
                        print "record_info_dict", record_info_dict
                except:
                    record_info_dict['tag_%s_ind1' % tag] = "%s - ind1" % tag


            for s in fields[tag][0]['subfields']:
                if s.keys()[0] in tagdict[tag].keys():
                   record_info_dict[tagdict[tag][s.keys()[0]]]  = s.values()[0].strip(' /')

            
    return record_info_dict

def _get_control_field_label(control_list, mm, leader):
    control_fields = {}
    for pos in control_list:
        for s in leader:
            if s.keys()[0] == pos:
                val = '_' if s.values()[0] == ' ' else s.values()[0]
                control_fields['%s_code' % pos] = val
                mm_val = mm[pos].get(val, None)
                if mm_val:
                    control_fields[pos] = mm[pos][val].get('label_sv', val)
                else:
                    control_fields[pos] = val
    return control_fields


def get_record_summary(data):
    fields = {}
    for field in data['fields']:
        for k, v in field.items():
            fields.setdefault(k, []).append(v)

    #TODO? globalise marcmap
    mm = json.loads(open(app.config['MARC_MAP']).read())['bib']['fixprops']
    
    #extracting the control field values
    #cannot be done as the general fields, as the json structure differs
    control_list = ['bibLevel', 'typeOfRecord', 'encLevel']
    control_fields = _get_control_field_label(control_list, mm, data['leader']['subfields'])

    control_fields['id'] = fields['001'][0] if '001' in fields else ''
   
    #extracting general fields.
    #change in the dict to extract other fields/subfields or save them under different labels
    tagdict = {'008': {'yearTime1': 'pubyear_008'},
                '020': {'a': 'isbn'},
                '022': {'a': 'issn'},
                '024': {'a': 'other_standard_id', 'ind1': '024ind1'},
                '028': {'a': 'publisher_number', 'b': 'publisher', 'ind1': 'ind1'},
                '035': {'9': 'librisIII-id'},
                '040': {'a': 'catinst_a', 'd': 'catinst_d'},
                '041': {'a': 'lang_target', 'h': 'lang_source'},
                '100': {'a': 'author', 'b': 'author_numeration', 'd': 'author_date', '4': 'author_4', 'c': 'author_association', 'e': 'author_e', 'q': 'author_q'},
                '110': {'a': 'author', 'd': 'author_date', '4': '110_4', 'c': '110_c', 'n': '110_n'},
                '111': {'a': 'author', 'd': 'author_date', '4': '111_4', 'c': '111_c', 'n': '111_n'},
                '245': {'a': 'tit_a', 'b': 'tit_b', 'c': 'tit_c', 'n': 'tit_n', 'p': 'tit_p'},
                '250': {'a': 'edition'},
                '260': {'c': 'pubyear'},
                '773': {'a': 'link_author', 't': 'link_tit', 'g': 'link_related'},
              }
    general_fields = _get_field_label(tagdict, fields)
    return dict(control_fields.items() + general_fields.items())


@app.route('/edit/<edit_mode>')
def show_record_form(**kws):
    return render_template('bib.html', **kws)
@app.route('/edit/<rec_type>/<rec_id>')
def show_edit_record(rec_type, rec_id):
    return index()

@app.route('/marc/<rec_type>/<rec_id>')
def show_marc_record(rec_type, rec_id):
    return index()
    #return render_template('index.html', partials = {"/partials/frbr" : "partials/frbr.html"})

@app.route('/record/bib/<rec_id>')
#@login_required
def get_bib_data(rec_id):
    # TODO: How check if user is logged in?
    draft = storage.get_draft(current_user.get_id(), "bib", rec_id)
    if draft == None:
        whelk_url = "%s/bib/%s" % (app.config['WHELK_HOST'], rec_id)
        response = requests.get(whelk_url)
        if response.status_code >= 400:
            app.logger.warning("Error response %s on GET <%s>" % (response.status_code, whelk_url))
            abort(response.status_code)
        else:
            document = response.text
            etag = response.headers['etag']
    else:
        json_data = json.loads(draft)
        document = json.dumps(json_data['document'])
        etag = json_data['etag']

    resp = raw_json_response(document)
    resp.headers['etag'] = etag
    return resp

## TODO: Add middleware to support DELETE method instead of POST
@app.route('/record/bib/<id>/draft/delete', methods=['POST'])
def delete_draft(id):
    storage.delete_draft(current_user.get_id(), "bib", id)
    drafts = storage.get_drafts_as_json(current_user.get_id())
    return raw_json_response(drafts)

@app.route('/record/bib/<id>/draft', methods=['POST'])
def save_draft(id):
    """Save draft to kitin, called by form"""
    json_data = request.data
    storage.save_draft(current_user.get_id(), "bib", id, json_data, request.headers['If-match'])
    return json.dumps(request.json)

@app.route('/draft/<rec_type>/<rec_id>')
def get_draft(rec_type, rec_id):
    draft = storage.get_draft(current_user.get_id(), rec_type, rec_id)
    if(draft):
        json_data = json.loads(draft)
        resp = raw_json_response(json.dumps(json_data['document']))
        resp.headers['etag'] = json_data['etag']
        return resp
    else:
        abort(404)

@app.route('/drafts')
def get_drafts():
    drafts = storage.get_drafts_as_json(current_user.get_id())
    return raw_json_response(drafts)

@app.route("/record/bib/new")
def get_template():
    """Returns a template object"""
    return raw_json_response(open("./examples/templates/monografi.json", 'r').read())

@app.route('/record/<rec_type>/<rec_id>', methods=['PUT'])
def update_document(rec_type, rec_id):
    """Saves updated records to whelk"""
    json_string = json.dumps(request.json)
    if_match = request.headers['If-match']
    h = {'content-type': 'application/json', 'If-match': if_match}
    path = "%s/bib/%s" % (app.config['WHELK_HOST'], rec_id)
    response = requests.put(path, data=json_string, headers=h, allow_redirects=True)
    if response.status_code == 200:
        storage.delete_draft(current_user.get_id(), "bib", rec_id)
        resp = raw_json_response(response.text)
        resp.headers['etag'] = response.headers['etag'].replace('"', '')
        return resp
    else:
        abort(response.status_code)

@app.route('/record/bib/create', methods=['POST'])
def create_record():
    h = {'content-type': 'application/json', 'format': 'jsonld'}
    path = "%s/bib/" % (app.config['WHELK_HOST'])
    response = requests.post(path, data=json.dumps(request.json), headers=h, allow_redirects=False)
    if response.status_code == 200:
        resp = raw_json_response(response.text)
        resp.headers['etag'] = response.headers['etag'].replace('"', '')
        return resp
    elif response.status_code == 303:
        data = {}
        data['document'] = json.loads(response.text)
        data['document_id'] = urlparse(response.headers['Location']).path.rsplit("/")[-1]
        resp = raw_json_response(json.dumps(data))
        resp.headers['etag'] = response.headers['etag'].replace('"', '')
        return resp
    else:
        abort(response.status_code)

@app.route('/marcmap.json')
def get_marcmap():
    with open(app.config['MARC_MAP']) as f:
        return raw_json_response(f.read())


@app.route('/overlay.json')
def get_overlay():
    with open(app.config['MARC_OVERLAY']) as f:
        return raw_json_response(f.read())


@app.route('/suggest/auth')
def suggest_auth_completions():
    q = request.args.get('q')
    response = requests.get("%s/suggest/_complete?name=%s" % (app.config['WHELK_HOST'], q))
    if response.status_code >= 400:
        abort(response.status_code)
    return raw_json_response(response.text)


@app.route("/partials/<name>")
def show_partial(name):
    return make_response(open(app.template_folder + '/' + 'partials/'+ name +'.html').read())


# TODO: integrate mockups in views and remove this
@app.route("/mockups/<name>")
def show_mockup(name):
    return render_template('mockups/'+ name +'.html')

def raw_json_response(s):
    resp = make_response(s)
    resp.headers['Content-Type'] = 'application/json'
    return resp


def find_record_templates():
    """Use to list drafts and templates in local dir."""
    for fname in os.listdir(mockdatapath('templates')):
        ext = '.json'
        if not fname.endswith(ext):
            continue
        yield fname.replace(ext, '')


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
    try:
        user = User(uid)
    except Exception as e:
        print "Exception trying to load user. %s" % e
    return user

@login_manager.unauthorized_handler
def _handle_unauthorized():
    return redirect("/login")


@app.route("/login", methods=["GET", "POST"])
def login():
    msg = None
    if request.method == "POST" and "username" in request.form:
        username = request.form["username"]
        password = request.form["password"] 
        remember = request.form.get("remember", "no") == "yes"
        user = storage.load_user(username, password, remember)
        if (user):
            login_user(user, remember)

            flash("Logged in!")
        else:
            flash("No such user.")
            msg = u"Kunde inte logga in. Kontrollera användarnamn och lösenord."

    elif "signout" in request.form and current_user:
        try:
            logout_user()
        except Exception as e:
            print "FAIL: %s" % e
            return render_template("home.html")
        user = None

    return render_template("home.html", user = current_user if current_user.is_active() else None, msg = msg)

@app.route("/signout")
@login_required #add this decorator to all views that require log in, i.e. all but login
def logout():
    logout_user()
    return render_template("home.html")

jinja2.filters.FILTERS['chunk_number'] = chunk_number

if __name__ == "__main__":
    from optparse import OptionParser
    oparser = OptionParser()
    oparser.add_option('-d', '--debug', action='store_true', default=False)
    oparser.add_option('-m', '--marcmap', type=str, default="marcmap.json")
    oparser.add_option('-o', '--overlay', type=str, default="marcmap-overlay.json")
    opts, args = oparser.parse_args()
    app.debug = opts.debug
    app.config['MARC_MAP'] = opts.marcmap
    app.config['MARC_OVERLAY'] = opts.overlay
    app.run(host='0.0.0.0')


