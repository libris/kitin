Kitin - README
========================================================================

## Getting started

1. Install requirements (Mac OS X specific):

    $ sudo easy_install pip
    $ pip install virtualenvwrapper
    $ Add `export WORKON_HOME=$HOME/.virtualenvs` to your shell profile (zshrc, bashrc)
    $ Add `source /path/to/virtualenvwrapper.sh` to your shell profile (zshrc, bashrc)
    $ mkvirtualenv kb-kitin
    $ pip install -r dev-requirements.txt

    # During development, make sure you
    $ workon kb-kitin

## Generating the marcmap

1. Get Swedish legacy config files... (ask for directions)
2. Put them in folder ($CONFIG_DIR) and create folder for marcmap ($SOME_DIR)

    $ python tools/parse_legacy_config.py $CONFIG_DIR/TagTable/Marc21 sv > $SOME_DIR/marcmap.json

## Prepare a local database

    $ fab prepare

## Starting the client

1. Run ./kitin.py -h for help
2. Run webapp

    $ ./kitin.py -d --mockapi -m $SOME_DIR/marcmap.json

## Running js tests

    $ Install node *brew install node* on MacOSX _(also, make sure to install npm)_
    $ NODE_PATH=.:$PWD/static/js
    $ node test/js/test_marcjson.js

## Tool for applying the marcmap to a marc-json struct

    $ node tools/map-marcjson.js $SOME_DIR/marcmap.json bib examples/bib/7149593.json

## Downloading/updating third-party web assets

    $ tools/fetch-vendor-assets.sh

