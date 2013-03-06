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

### Prepare a local database

    $ fab prepare

### Add a test user:

    $ sqlite3 kitin.db
    > INSERT INTO userdata VALUES ('somebody','somepass');

### Run the mock-whelk
Development is more fun when there's data to toy around with.
Clone the librisxl project and run its builtin mockserver

    $ git clone git@github.com:libris/librisxl.git
    $ cd librisxl/whelk-core
    $ gradle jettyRun

### Configure and run the flask client

1. Make a local copy of the config file.
    $ cp config.cfg.in config.cfg
2. Open config.cfg in your favourite editor and set WHELK_HOST to point to localhost, like so: `WHELK_HOST = 'http://localhost:8080/whelk-core'`
3. Run webapp
    $ ./kitin.py -d

Run ./kitin.py -h for help


## Development and Maintenance

### Running js test scripts

    $ Install node *brew install node* on MacOSX _(also, make sure to install npm)_
    $ NODE_PATH=.:$PWD/static/js
    $ node test/js/test_marcjson.js

### Running python unit tests

[Nose](https://nose.readthedocs.org/en/latest/testing.html) is used for unit tests. It is installed via pip (see above).
Execute the following command to run all tests.
All tests meaning all tests that matches the configured testMatch regular expression ((?:^|[\\b_\\.-])[Tt]est) by default – that is, has test or Test at a word boundary or following a - or _) and lives in a module that also matches that expression will be run as a test.
    $ nosetests

If for some reason nose fails to find the tests, tell it where to find them and where to find required modules

    $ PYTHONPATH=$PYTHONPATH:. nosetests -w test/python

### Downloading third-party web assets

Web assets are JS and CSS dependencies. Add their locations to this script:

    $ tools/fetch-vendor-assets.sh

By doing this, their origin is documented, and updates to them become easily
downloaded.

