#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json, os, re

from fabric.api import *

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
def prepare():
    create_config()
    execfile(os.path.join(os.path.dirname(__file__), 'config.cfg'), cfg)
    if not os.path.exists(cfg.get('STORAGE_DIR')):
        os.mkdir(cfg.get('STORAGE_DIR'))
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
    local('rm -f config.cfg')

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
