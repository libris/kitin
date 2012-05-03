#!/usr/bin/env python

from fabric.api import *

from config import *

from sqlalchemy import *
from sqlalchemy.orm import *

import json, os

def create_db():
    if not os.path.exists(kitinconfig['DBNAME']):
        db = create_engine(kitinconfig['DBENGINE'] + ':///' + kitinconfig['DBNAME'])
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
    if not os.path.exists(appconfig['UPLOAD_FOLDER']):
        os.mkdir(appconfig['UPLOAD_FOLDER'])
    create_db()
