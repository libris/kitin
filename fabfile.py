#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json, os, re

from fabric.api import *

from sqlalchemy import *
from sqlalchemy.orm import *

kitin_path = '/srv/www/kitin'

cfg = {}
#execfile(os.path.join(os.path.dirname(__file__), 'config.cfg'), cfg)

@task
def lab():
    env.hosts = ['devlab.libris.kb.se']
    env.user = 'jenkins'
    env.wwwuser = 'apache'
    env.wwwgroup = 'apache'

@task
def demo():
    env.hosts = ['193.10.75.247']
    env.user = 'riakcluster4'
    env.wwwuser = '_www'
    env.wwwgroup = '_www'

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
            Column('spills', PickleType(pickler=json)),
            #Column('timestamp', Date)) #datatype??
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
    if not env.host:
        print "Call lab or demo first, i.e: $>fab lab deploy"
    else:
        prepare()
        sudo('rm -f /tmp/kitin.tgz')
        local('tar cfz /tmp/kitin.tgz --exclude=\'.*\' *')
        put('/tmp/kitin.tgz', '/tmp/')
        sudo('rm -fr %s' % kitin_path)
        sudo('mkdir -m 775 %s' % kitin_path)
        sudo('chown %s:%s %s' % (env.user, env.wwwgroup, kitin_path))
        run('mkvirtualenv kitin')
        with cd('%s' % kitin_path):
            run('tar xzf /tmp/kitin.tgz')
            run('python tools/create_wsgi_file.py')
            sudo('chown %s kitin.db' % env.wwwuser)

        with prefix('workon kitin'):
            run('pip install -r %s/dev-requirements.txt' % kitin_path)

@task
def clear_config():
    local('rm config.cfg')

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
