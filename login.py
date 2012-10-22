#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask_login import UserMixin


class User(UserMixin):
    __tablename__ = 'userdata'
    def __init__(self, username, active=True):
        self.username = username
        self.active = active
    
    def get_id(self):
        return self.username

    def is_active(self):
        return self.active


    
        
