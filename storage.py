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
    def __init__(self, path):
        self.path = path
        if not os.path.exists(self.path):
            os.makedirs(self.path)

    def save(self, rec_type, rec_id, json_data):
        path = "/".join([self.path, rec_type])
        create_dir_if_not_exists(path)
        filename = "/".join([path, rec_id])
        with open(filename, 'w') as f:
            f.write(json.dumps(json_data))

    def update(self, rec_type, rec_id, json_data):
        self.save(rec_type, rec_id, json_data)

    def read(self, data_type, data_id):
        path = "/".join([self.path, data_type])
        filename = "/".join([path, data_id])
        with open(filename) as f:
            return open(filename, 'r').read()

    def delete(self, data_type, data_id):
        filename = "/".join([self.path, data_type, data_id])
        if os.path.exists(filename):
            os.remove(filename)

    def find_by_user(self, uid):
        raise RuntimeError("no impl yet")

    def load_user(self, uname, pword, remember):
        raise RuntimeError("no impl yet")


def create_dir_if_not_exists(path):
    if not os.path.exists(path):
        os.makedirs(path)

