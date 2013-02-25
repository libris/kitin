#!/usr/bin/env python
# -*- coding: utf-8 -*-
import pickle
import json
import requests
import os
from flask_login import UserMixin

class User(UserMixin):
    def __init__(self, username, password="Secret", active=True):
        try:
            self.username = unicode(username)
            self.password = unicode(password)
            self.active = active
        except Exception as e:
            print "Could not initiate user %s %s" % (username, e)

    def __repr__(self):
        return '<User %r>' % (self.username) 

    def get_id(self):
        return self.username

    def is_active(self):
        return self.active

class Storage(object):
    def __init__(self, path="/opt/kitin"):
        self.path = path
        if not os.path.exists(self.path):
            os.makedirs(self.path)

    def save(self, record_type, record_id, json_data):
        path = "/".join([self.path, record_type, record_id])
        if not os.path.exists(path):
            os.makedirs(path)
        f = open(path, 'w')
        f.write(json_data) ## TODO need to convert to str first?

    def update(self, id, json_data):
        raise RuntimeError("no impl yet")

    def delete(self, id):
        raise RuntimeError("no impl yet")

    def exists(self, id):
        raise RuntimeError("no impl yet")

    def find_by_user(self, uid):
        raise RuntimeError("no impl yet")

    def load_user(self, uname, pword, remember):
        raise RuntimeError("no impl yet")

