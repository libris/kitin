#!/usr/bin/env python
# -*- coding: utf-8 -*-
from flask_login import UserMixin
import json
import requests

class User(UserMixin):
    def __init__(self, username, active = True, sigel = None):
        self.username = unicode(username)
        self.active = active
        self.sigel = sigel

    def __repr__(self):
        return '<User %r>' % (self.username)

    def get_id(self):
        return self.username

    def get_sigel(self):
        return self.sigel

    def is_active(self):
        return self.active

    def authorize(self, password, cfg):
        bibdb_api = cfg.get('BIBDB_API')
        api_key = cfg.get('BIBDB_API_KEY')
        user_data = {"username": self.username, "password": password}
        api_headers = {"APIKEY_AUTH_HEADER": "%s" % api_key}
        # TODO: Change to /auth/login when new bibdb is deployed
        reply = requests.post("%s/login/auth" % bibdb_api, data = user_data, headers = api_headers)
        try:
            print "%s/login/auth" % bibdb_api
            print reply.text
            if reply.text == "Authenticated":
                print "User %s authenticated." % self.username
                # TODO: Change to /auth/role when new bibdb is deployed
                rolereply = requests.get("%s/user/role" % bibdb_api, params = {'username': self.username}, headers = api_headers)
                roles = json.loads(rolereply.text)
                sigel = None
                role_type = None
                for sig, perms in roles["roles"].iteritems():
                    if perms["reg"] == True:
                        sigel = sig.split("_")[0]
                        role_type = sig.split("_")[1]
                if sigel == None:
                    print "User %s not authorized." % self.username
                    return None
                else:
                    print "User %s authorized for sigel %s. Roletype %s" % (self.username, sigel, role_type)
                    return sigel
        except Exception as e:
            print "Error authorizing user... ", e
            return None

