#!/usr/bin/env python

from fabric.api import *

from kitin import UPLOAD_FOLDER

from sqlalchemy import *
from sqlalchemy.orm import *

import json, os

def create_db():
    if not os.path.exists('kitin.db'):
        db = create_engine('sqlite:///kitin.db')
        db.echo = True
        metadata = MetaData(db)
        marcpost = Table('marcpost', metadata,
            Column('id', Integer, primary_key=True),
            Column('userid', String),
            Column('marc', PickleType(pickler=json)),
            Column('bibid', String),
            Column('spills', PickleType(pickler=json))
        )
        marcpost.create()

def prepare():
    if not os.path.exists(UPLOAD_FOLDER):
        os.mkdir(UPLOAD_FOLDER)
    create_db()
