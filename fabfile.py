#!/usr/bin/env python

from fabric.api import *

from sqlalchemy import *
from sqlalchemy.orm import *

def create_db():
    db = create_engine('sqlite:///kitin2.db')

def prepare():
#    with prefix('workon kitin'):
#        local('pip install -r dev-requirements.txt')
    create_db()
