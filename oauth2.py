from requests_oauthlib import OAuth2Session, TokenUpdated
from flask import Flask, request, redirect, session, url_for
from flask.json import jsonify
import os
from time import time

app = Flask(__name__)

# This information is obtained upon registration of a new GitHub
client_id = "mJ7.nwVHph;E!BQ?vr-JH==yCVbAthy0r4K9!537"
client_secret = "-JW2zL@m4MgHr:XG62nhMV4QkUSlC68v_Wt:7K-osHI3JfJzCuNJaPT!87lG3dt-J_lc9LE4UxAY?BvqV!7b=ypN0xzY5=ra;rA.Ibaes36so5vxnp3DkEN3LMCG89JR"
authorization_base_url = 'https://bibdb.libris.kb.se/o/authorize'
token_url = 'https://bibdb.libris.kb.se/o/token/'
authorized_url = 'http://localhost:5000/login/authorized'
oauth_verify_url = 'https://bibdb.libris.kb.se/api/o/verify'
global bibdb_oauth

def get_token():
    if 'oauth_token' in session:
        return session['oauth_token']
    return None

def get_bib_oauth():
    try:
        # Create new oAuth 2 session
        requests_oauth = OAuth2Session(client_id, 
                   redirect_uri=authorized_url,
                   auto_refresh_kwargs={ 'client_id': client_id, 'client_secret': client_secret }, 
                   auto_refresh_url=token_url,
                   token = get_token()
                   )
    except TokenUpdated as e:
        # Thrown on access token refreshed
        session['oauth_token'] = e.token
    return requests_oauth


@app.route("/")
def demo():
    
    if 'oauth_token' in session:
        requests_oauth = get_bib_oauth()
        return jsonify(requests_oauth.token)
        #resp = requests_oauth.post(url='http://localhost:8180/whelk/bib', headers={'Content-Type': 'application/ld+json'}, data='{"@type":"Record","about":{"@type":["Text","Monograph"],"influentialRelation":[{"@type":"Title"}],"hasAnnotation":[{"@type":"DissertationAnnotation"}],"replaces":[{"@type":"Concept"}],"publication":[{"place":{"@type":"Place"},"@type":"ProviderEvent"}],"manufacture":[{"place":{"@type":"Place"},"@type":"ProviderEvent"}],"identifier":[{"identifierScheme":{"@id":"/def/identifiers/isbn"},"@type":"Identifier"}],"hasFormat":[{"@type":"Product"}]}}')
        #return resp.text
    else:
        return redirect('/login')

@app.route("/login")
def login():
    requests_oauth = get_bib_oauth()
    authorization_url, state =  requests_oauth.authorization_url(authorization_base_url, approval_prompt="auto");
    print authorization_url
    return redirect(authorization_url)

@app.route("/login/authorized")
def authorized():
    requests_oauth = get_bib_oauth()

    session['oauth_token'] = requests_oauth.fetch_token(token_url, client_secret=client_secret, authorization_response=request.url)
    user = requests_oauth.get(oauth_verify_url).json()
    return redirect('/')

@app.route("/logout")
def logout():
    session.pop('oauth_token', None)
    return ""

if __name__ == "__main__":
    # This allows us to use a plain HTTP callback
    os.environ['DEBUG'] = "1"
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "True"



    app.secret_key = 'te2st'
    app.run(debug=True)



