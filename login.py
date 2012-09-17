#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask_login import UserMixin


class User(UserMixin):
    def __init__(self, username):
        self.username = username
    
    def get_id(self):
        return self.username
        
