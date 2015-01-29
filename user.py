#!/usr/bin/env python
# -*- coding: utf-8 -*-
from flask_login import UserMixin
import json
import requests

class User(UserMixin):
    def __init__(self, username, active = True, sigel = None, token = None):
        self.username = unicode(username)
        self.active = active
        self.sigel = sigel
        self.token = token

    def __repr__(self):
        return '<User %r>' % (self.username)

    def get_id(self):
        return self.username

    def get_sigel(self):
        return self.sigel

    def is_active(self):
        return self.active

    def get_token(self):
        return self.token