Kitin - README
========================================================================

## Getting started

### Install requirements

Mac OS X specific:

    $ sudo easy_install pip
    $ pip install virtualenvwrapper
    $ Add `export WORKON_HOME=$HOME/.virtualenvs` to your shell profile (zshrc, bashrc)
    $ Add `source </path/to/virtualenvwrapper.sh>` to your shell profile (zshrc, bashrc)
    $ mkvirtualenv kb-kitin
    $ workon kb-kitin
    $ pip install -r dev-requirements.txt

### Run the mock-whelk
Development is more fun when there's data to toy around with.
Clone the librisxl project and run its builtin mockserver

    $ git clone git@github.com:libris/librisxl.git
    $ cd librisxl/whelk-core
    $ export JAVA_OPTS="-Dfile.encoding=utf8"
    $ gradle jettyRun

Add export JAVA_OPTS="-Dfile.encoding=utf8" to .profile 

### Configure and run the flask client

1. Make a local copy of the config file.
    $ cp config.cfg.in config.cfg
2. Open config.cfg in your favourite editor and set WHELK_HOST to point to localhost, like so: `WHELK_HOST = 'http://localhost:8080/whelk-webapi'`
3. Set BIBDB_API and BIBDB_API_KEY. Ask for directions...
4. Set SESSION_SECRET_KEY. To generate a key using python:
    $ import os
    $ os.urandom(24).encode('hex')
3. Run webapp
    $ ./kitin.py -d

Run ./kitin.py -h for help


## Development and Maintenance

### Running js test scripts

Install [node ](http://nodejs.org/) and [npm](https://npmjs.org).

    $ brew install node npm (MacOSX)
    $ sudo yain node npm (Archlinux)

Using npm, install [testacular](http://testacular.github.com):

    $ sudo npm install -g testacular

Run the unit and end2end tests by executing any of these:

    $ testacular start test/js/config/testacular.conf.js
    $ testacular start test/js/config/testacular-e2e.conf.js

They assume chrome but can use other browsers as well. Settings and configuration options are located under test/js/config.

### Running python unit tests

[Nose](https://nose.readthedocs.org/en/latest/testing.html) is used for unit tests. It is installed via pip (see above).
Execute the following command to run all tests.

    $ nosetests

If for some reason nose fails to find the tests, tell it where to find them and where to find required modules(.)

    $ PYTHONPATH=$PYTHONPATH:. nosetests -w test/python

### Downloading third-party web assets

Web assets are JS and CSS dependencies. Add their locations to this script:

    $ tools/fetch-vendor-assets.sh

By doing this, their origin is documented, and updates to them become easily
downloaded.

