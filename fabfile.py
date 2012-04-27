#!/usr/bin/env python

from fabric.api import *

from sqlalchemy import *
from sqlalchemy.orm import *

def create_db():
    db = create_engine('sqlite:///kitin2.db')

def prepare():
    create_db()
