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

    def save_draft(self, rec_type, rec_id, json_data):
        path = "/".join([self.path, rec_type])
        create_dir_if_not_exists(path)
        filename = "/".join([path, rec_id])
        with open(filename, 'w') as f:
            f.write(json.dumps(json_data))

    def update_draft(self, rec_type, rec_id, json_data):
        self.save_draft(rec_type, rec_id, json_data)

    def get_draft(self, data_type, data_id):
        path = "/".join([self.path, data_type])
        filename = "/".join([path, data_id])
        if os.path.exists(filename):
            with open(filename) as f:
                return open(filename, 'r').read()
        else:
            None

    def delete_draft(self, data_type, data_id):
        filename = "/".join([self.path, data_type, data_id])
        if os.path.exists(filename):
            os.remove(filename)

    def find_by_user(self, uid):
        raise RuntimeError("no impl yet")

    def load_user(self, uname, pword, remember):
        raise RuntimeError("no impl yet")

    def draft_exists(self, rec_type, rec_id):
        return os.path.exists("/".join([self.path, rect_type, rec_id]))


def create_dir_if_not_exists(path):
    if not os.path.exists(path):
        os.makedirs(path)

