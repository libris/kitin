#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json, os, re

from fabric.api import *


cfg = {}
#execfile(os.path.join(os.path.dirname(__file__), 'config.cfg'), cfg)
env.virtenvpath = '/var/virtualenvs/kitin'

for e in os.environ:
    if e.startswith("FABRIC_"):
        if e == "FABRIC_HOST":
            h = os.environ.get(e)
            hl = h.split(",")
            env.hosts = hl
        else:
            env[e[7:].lower()] = os.environ.get(e)


@task
def prepare():
    create_config()
    execfile(os.path.join(os.path.dirname(__file__), 'config.cfg'), cfg)
    #if not os.path.exists(cfg.get('STORAGE_DIR')):
    #    os.mkdir(cfg.get('STORAGE_DIR'))
    #create_db()

@task
def fetch_vendor_assets():
    local("tools/fetch-vendor-assets.sh")

@task
def deploy():
    if not env.hosts or not env.wwwuser or not env.wwwgroup or not env.remotepath:
        print "Make sure you have the proper environment settings before deploying."
    else:
        prepare()
        run('rm -f /tmp/kitin.tgz')
        local('tar cfz /tmp/kitin.tgz --exclude=\'.*\' *')
        put('/tmp/kitin.tgz', '/tmp/')
        run('rm -fr %s' % env.remotepath)
        run('mkdir -m 775 %s' % env.remotepath)
        with cd('%s' % env.remotepath):
            run('tar xzf /tmp/kitin.tgz')
            run('python tools/create_wsgi_file.py')
            #run('chown %s kitin.db' % env.wwwuser)
            #run('chown %s storage' % env.wwwuser)

        with prefix('source %s/bin/activate' % env.virtenvpath):
            run('pip install -r %s/dev-requirements.txt' % env.remotepath)

        #run('chown -R %s:%s %s' % (env.wwwuser, env.wwwgroup, env.remotepath))
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
