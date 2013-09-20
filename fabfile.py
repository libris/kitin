#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os, re
from fabric.api import *
from fabric.contrib.files import exists, upload_template
try:
    import fabconf as conf
except ImportError:
    pass

def _settings():
    require('wwwuser', 'remotepath')
    env.setdefault('virtenvpath', '/var/virtualenvs/kitin')
    env.setdefault('wwwgroup', env.wwwuser)
    env.setdefault('osflavour', 'ubuntu')

@task
def deploy():
    """
    Deploy a new version of the Kitin web application
    """
    _settings()
    local("tar cfz /tmp/kitin.tgz --exclude='.*' --exclude=storage --exclude=config.cfg *")
    sudo('rm -f /tmp/kitin.tgz')
    put('/tmp/kitin.tgz', '/tmp/', use_sudo=True)
    with settings(sudo_user=env.wwwuser):
        sudo('rm -rf %(remotepath)s-old' % env)
        sudo('mv %(remotepath)s %(remotepath)s-old' % env)
        sudo('mkdir -m 775 %(remotepath)s' % env)
        with cd(env.remotepath):
            sudo('tar xzf /tmp/kitin.tgz')
            sudo('ln -s ../storage .')
            sudo('ln -s ../config.cfg .')
        upload_template("kitin.wsgi.in", "kitin.wsgi", env, backup=False)
        sudo("cp kitin.wsgi %(remotepath)s" % env)
        run("rm kitin.wsgi")
        with prefix('source %(virtenvpath)s/bin/activate' % env):
            sudo('pip install -r %(remotepath)s/requirements.txt' % env)

@task
def prepare():
    """
    Prepare the system for deployment (commonly done once per server)
    """
    _settings()
    install_packages()
    make_app_dirs()
    create_config()

@task
def install_packages():
    """Install system packages (Unbuntu Linux)"""
    assert env.osflavour == 'ubuntu'
    sudo("apt-get install python-dev") # Python header files, for C-extensions
    sudo("apt-get install python-pip")
    sudo("apt-get install python-virtualenv") #or sudo("pip install virtualenv")

@task
def make_app_dirs():
    sudo("mkdir -p %(virtenvpath)s" % env)
    sudo('chown -R %(user)s %(virtenvpath)s' % env)
    run("virtualenv --distribute --never-download %(virtenvpath)s" % env)
    sudo("mkdir -p %(remotepath)s" % env)
    with cd(env.remotepath):
        if not exists("../storage"): sudo("mkdir ../storage")
        sudo('chown -R %(wwwuser)s:%(wwwgroup)s ..' % env)

@task
def create_config():
    target_config = "%(remotepath)s/../config.cfg" % env
    cfg = {}
    execfile(os.path.join(os.path.dirname(__file__), 'config.cfg'), cfg)
    cfg['SESSION_SECRET_KEY'] = os.urandom(24).encode('hex')
    upload_template("config.cfg.in", target_config, cfg, use_sudo=True)

@task
def fetch_vendor_assets():
    local("tools/fetch-vendor-assets.sh")
