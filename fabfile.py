#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os, re
from fabric.api import *
from fabric.contrib.files import exists, upload_template

#env.remotepath = ...
#env.wwwuser = ...
if 'wwwgroup' not in env and 'wwwuser' in env:
    env.wwwgroup = env.wwwuser
env.virtenvpath = '/var/virtualenvs/kitin'

@task
def deploy():
    require('wwwuser', 'wwwgroup', 'remotepath')
    local("tar cfz /tmp/kitin.tgz --exclude='.*' --exclude=storage --exclude=config.cfg *")
    run('rm -f /tmp/kitin.tgz')
    put('/tmp/kitin.tgz', '/tmp/')
    with settings(sudo_user=env.wwwuser):
        sudo('rm -fr %(remotepath)s' % env)
        sudo('mkdir -m 775 %(remotepath)s' % env)
        with cd(env.remotepath):
            sudo('tar xzf /tmp/kitin.tgz')
            sudo('ln -s ../storage .')
            sudo('ln -s ../config.cfg .')
            #run('chown %(wwwuser)s storage' % env)
        upload_template("kitin.wsgi.in", "kitin.wsgi", env, backup=False)
        sudo("cp kitin.wsgi %(remotepath)s" % env)
        run("rm kitin.wsgi")
    with prefix('source %(virtenvpath)s/bin/activate' % env):
        run('pip install -r %(remotepath)s/requirements.txt' % env)

@task
def create_config(force=False):
    if os.path.exists('config.cfg') and not int(force):
        return
    with open('config.cfg.in', 'r') as f:
        file_contents = f.read()
    with open('config.cfg', 'w') as newfile:
        key = os.urandom(24).encode('hex')
        newfile.write(_replace_setting_values(file_contents,
            dict(os.environ, SESSION_SECRET_KEY=key)))

def _replace_setting_values(text, data):
    return re.sub('(\<)(\w+)(\>)',
            lambda match: data.get(match.group(2), ''), text)

@task
def prepare():
    # System requirements (tailored for Ubuntu Linux)
    sudo("apt-get install python-dev") # Python header files, for C-extensions
    sudo("apt-get install python-pip")
    sudo("apt-get install python-virtualenv") #or sudo("pip install virtualenv")
    # Application directories
    sudo("mkdir -p %(virtenvpath)s" % env)
    sudo('chown -R %(user)s %(virtenvpath)s' % env)
    run("virtualenv --distribute --never-download %(virtenvpath)s" % env)
    sudo("mkdir -p %(remotepath)s" % env)
    with cd(env.remotepath):
        if not exists("../storage"): sudo("mkdir ../storage")
        sudo('chown -R %(wwwuser)s:%(wwwgroup)s ..' % env)

@task
def fetch_vendor_assets():
    local("tools/fetch-vendor-assets.sh")
