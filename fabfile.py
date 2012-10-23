#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json, os

from fabric.api import *

from sqlalchemy import *
from sqlalchemy.orm import *

env.hosts = ['devlab.libris.kb.se']
env.user = 'jenkins'
virtualenv_home = '/srv/data/virtualenvs'

cfg = {}
execfile(os.path.join(os.path.dirname(__file__), 'config.cfg'), cfg)

@task
def create_db():
    if not os.path.exists(cfg.get('DBNAME')):
        db = create_engine(cfg.get('DBENGINE') + ':///' + cfg.get('DBNAME'))
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

        userdata = Table('userdata', metadata,
            Column('id', Integer),
            Column('username', String, primary_key=True),
            Column('roles', PickleType(pickler=json)),
            Column('active', Boolean),
        )
        userdata.create()

        i = userdata.insert()
        i.execute({'username': u'räv', 'active': 1},
                  {'username': u'skalbagge', 'active': 1},
                  {'username': u'bälta', 'active': 1})

@task
def create_wsgi_file():
    wsgifile = open('kitin.wsgi', 'w')
    #wsgifile.write("activate_this = '%s/kitin/bin/activate_this.py'\n" % os.environ.get('WORKON_HOME'))
    wsgifile.write("activate_this = '%s/kitin/bin/activate_this.py'\n" % virtualenv_home)
    wsgifile.write("execfile(activate_this, dict(__file__=activate_this))\n\n")
    wsgifile.write("from kitin import app as application\n")
    wsgifile.close()

@task
def prepare():
    if not os.path.exists(cfg.get('UPLOAD_FOLDER')):
        os.mkdir(cfg.get('UPLOAD_FOLDER'))
    create_db()

@task
def fetch_vendor_assets():
    local("tools/fetch-vendor-assets.sh")

@task
def deploy():
    create_wsgi_file()
    prepare()
    sudo('rm /tmp/kitin.tgz')
    local('tar cfz /tmp/kitin.tgz --exclude=\'.*\' *')
    put('/tmp/kitin.tgz', '/tmp/')
    sudo('rm -fr /srv/www/kitin2')
    sudo('mkdir /srv/www/kitin2', user='apache')
    with cd('/srv/www/kitin2'):
        sudo('tar xzf /tmp/kitin.tgz', user='apache')
        with prefix ('workon kitin'):
            sudo('pip install -r dev-requirements.txt', user='apache')



