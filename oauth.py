from flask import Flask, redirect, url_for, session, request, jsonify
from flask_oauthlib.client import OAuth
import requests
import urllib


app = Flask(__name__)
app.debug = True
app.SESSION_COOKIE_NAME = 'sessionid'
app.secret_key = 'development'
oauth = OAuth(app)

bibdb = oauth.remote_app(
    'bibdb',
    consumer_key='mJ7.nwVHph;E!BQ?vr-JH==yCVbAthy0r4K9!537', #client_id
    consumer_secret='-JW2zL@m4MgHr:XG62nhMV4QkUSlC68v_Wt:7K-osHI3JfJzCuNJaPT!87lG3dt-J_lc9LE4UxAY?BvqV!7b=ypN0xzY5=ra;rA.Ibaes36so5vxnp3DkEN3LMCG89JR',
    
    base_url='https://bibdb.libris.kb.se/o',
    request_token_url=None,
    access_token_method='POST',
    access_token_url='https://bibdb.libris.kb.se/o/token/',#'https://bibdb.libris.kb.se/o/access_token',
    authorize_url='https://bibdb.libris.kb.se/o/authorize'
)




@app.route('/')
def index():
    if 'bibdb_token' in session:
        return jsonify(session)
        #me = bibdb.get('user')
        #return jsonify(me.data)
    return redirect(url_for('login'))


@app.route('/login')
def login():
    
    return bibdb.authorize(callback=url_for('authorized', _external=True))

@app.route('/logout')
def logout():
    session.pop('bibdb_token', None)
    return redirect(url_for('index'))


@app.route('/login/authorized')
def authorized():
    resp = bibdb.authorized_response()
    print resp
    print request
    if resp is None:
        return 'Access denied: reason=%s error=%s' % (
            request.args['error_reason'],
            request.args['error_description']
        )
    
    session['bibdb_token'] = (resp['access_token'], '')
    me = bibdb.get('verify')
    print jsonify(me.data)
    return 'SUCCESS'


@bibdb.tokengetter
def get_bibdb_oauth_token():
    return session.get('bibdb_token')


if __name__ == '__main__':
    app.run()