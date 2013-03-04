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

    def save_draft(self, user_id, rec_type, rec_id, json_data):
        path = construct_path([self.path, user_id, rec_type])
        create_dir_if_not_exists(path)
        filename = "/".join([path, rec_id])
        with open(filename, 'w') as f:
            f.write(json_data)

    def update_draft(self, user_id, rec_type, rec_id, json_data):
        self.save_draft(user_id, rec_type, rec_id, json_data)

    def get_draft(self, user_id, rec_type, rec_id):
        path = construct_path([self.path, user_id, rec_type])
        filename = "/".join([path, rec_id])
        if os.path.exists(filename):
            with open(filename) as f:
                return open(filename, 'r').read()
        else:
            None

    def delete_draft(self, user_id, rec_type, rec_id):
        filename = construct_path([self.path, user_id, rec_type, rec_id])
        if os.path.exists(filename):
            os.remove(filename)

    def get_drafts(self, user_id):
        result = {}
        for root, subFolders, files in os.walk(construct_path([self.path, user_id])):
            for file in files:
                f = os.path.join(root,file)
                result["/".join(f.rsplit("/",2)[-2:])] = f
        return result

    def load_user(self, uname, pword, remember):
        raise NotImplementedError("noop")

    def draft_exists(self, rec_type, rec_id):
        return os.path.exists("/".join([self.path, rect_type, rec_id]))


def construct_path(path_array):
    return "/".join(path_array)

def create_dir_if_not_exists(path):
    if not os.path.exists(str(path)):
        os.makedirs(path)

