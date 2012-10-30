#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json, os, re

from fabric.api import *

from sqlalchemy import *
from sqlalchemy.orm import *

env.hosts = ['devlab.libris.kb.se']
env.user = 'jenkins'
virtualenv_home = '/srv/data/virtualenvs/505'
kitin_path = '/srv/www/kitin'

cfg = {}
#execfile(os.path.join(os.path.dirname(__file__), 'config.cfg'), cfg)

@task
def create_db():
    execfile(os.path.join(os.path.dirname(__file__), 'config.cfg'), cfg)
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
        i.execute(
                  {'username': u'skalbagge', 'active': 1})

@task
def prepare():
    create_config()
    execfile(os.path.join(os.path.dirname(__file__), 'config.cfg'), cfg)
    if not os.path.exists(cfg.get('UPLOAD_FOLDER')):
        os.mkdir(cfg.get('UPLOAD_FOLDER'))
    create_db()

@task
def fetch_vendor_assets():
    local("tools/fetch-vendor-assets.sh")

@task
def deploy():
    prepare()
    sudo('rm /tmp/kitin.tgz')
    local('tar cfz /tmp/kitin.tgz --exclude=\'.*\' *')
    put('/tmp/kitin.tgz', '/tmp/')
    sudo('rm -fr /srv/www/kitin')
    sudo('mkdir -m 775 /srv/www/kitin')
    sudo('chown %s:apache /srv/www/kitin' % env.user)
    run('mkvirtualenv kitin')
    with cd('/srv/www/kitin'):
        run('tar xzf /tmp/kitin.tgz')
        run('python tools/create_wsgi_file.py')
        sudo('chown apache kitin.db')

    with prefix('workon kitin'):
        run('pip install -r /srv/www/kitin/dev-requirements.txt')


@task
def create_config():
    if not os.path.exists('config.cfg'):
        f = open('config.cfg.in', 'r')
        file_contents = f.read()
        f.close()
        newfile = open('config.cfg', 'w')
        newfile.write(_replace_setting_values(file_contents))
        newfile.close()


# Helper method
def _replace_setting_values(text):
    rc = re.compile('(\<)(\w+)(\>)')
    def translate(match):
        return os.environ.get(match.group(2), '')
    return rc.sub(translate, text)
