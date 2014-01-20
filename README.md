Kitin - README
========================================================================

Instructions for using and developing the Kitin web application.

(These instructions work for OS X and Linux. Substitute `brew` in cmdline
examples below with the package manager of your OS.)

Prerequisites
------------------------------------------

### Python and Friends

Install:

    $ sudo easy_install pip
    $ pip install virtualenvwrapper

Add these to your shell profile:

    export WORKON_HOME=$HOME/.virtualenvs
    source </path/to/virtualenvwrapper.sh>

### Node and Friends

Install:

    $ brew install node
    $ npm install -g grunt-cli


Initial Configuration
------------------------------------------

### Virtualenv and Flask Settings

Create a virtualenv for this project:

    $ mkvirtualenv kb-kitin
    $ workon kb-kitin
    $ pip install -r dev-requirements.txt

Make a local copy of the config file.

    $ cp config.cfg.in config.cfg

In it, set `WHELK_HOST` to point to localhost:

    WHELK_HOST = 'http://localhost:8180/whelk-webapi'

Set `BIBDB_API` and `BIBDB_API_KEY`. (Ask your colleagues..)

Set `SESSION_SECRET_KEY`. To generate a key using python:

    $ import os
    $ print(os.urandom(24).encode('hex'))

### Install Grunt Tasks

After repository checkout, run to download dependencies:

    $ npm install . # download tools


Managing Dependencies
------------------------------------------

### Python Dependencies

Edit requirements.txt for reqular Python libraries, and dev-requirements.txt
for development tools. Use pip as per above to install.

### Updating Grunt Tasks

To add a grunt task, install it and update package.json by running:

    $ npm install --save-dev <package-name>

Then configure it in the Gruntfile.js

### Static Vendor Dependencies

These are the third-party client-side (JS and CSS) libraries.

Download and build minified versions:

    $ grunt vendor

Results end up in `static/vendor` and `static/build`.

To add a dependency:

    $ bower install --save <package-name>

Edit `exportsOverride` in `bower.json` to limit what is copied into
`static/vendor/`.


During Development
------------------------------------------

### Run Local Test Backend

Clone librisxl and run its mockserver:

    $ git clone git@github.com:libris/librisxl.git
    $ cd librisxl
    $ JAVA_OPTS="-Dfile.encoding=utf8" gradle jettyRun

### Run the Flask Webapp

Run webapp:

    $ ./kitin.py -d

(Use -h for help.)

### Automatic CSS and JS Compilation

Run:

    $ grunt watch

To compile  LESS and CoffeeScript, concatenate and minifiy.

### Running Python unit tests

Execute the following command to run all tests.

    $ nosetests

If for some reason nose fails to find the tests, tell it where to find them and
where to find required modules(.)

    $ PYTHONPATH=$PYTHONPATH:. nosetests -w test/python

### Running JS tests

Run the unit and end2end tests by executing any of these:

    $ testacular start test/js/config/testacular.conf.js
    $ testacular start test/js/config/testacular-e2e.conf.js

They assume Chrome but can use other browsers as well. Settings and
configuration options are located under test/js/config.


Design Principles
------------------------------------------

Why things are as they are in this application repository.

### What is actually under version control?

(See .gitignore for what is not.)

All vendor sources are kept, along with the minified versions, because:

- everything should work out of the box once the server code is in place
- it gives an overview of what's there directly at checkout
- some vendor assets, e.g. fonts, cannot easily be packed together
- source maps can be used for easier debugging


The Tools Used
------------------------------------------

Python-based:
* Flask, webapp framework
* [Nose](https://nose.readthedocs.org/en/latest/testing.html) for unit tests

Node-based:
* [Node](http://nodejs.org/) and [NPM](https://npmjs.org/)
* [Grunt](http://gruntjs.com/), build tool

Client-side:
* AngularJS
