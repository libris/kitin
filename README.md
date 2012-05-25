Kitin - README
========================================================================

## Getting started

1. Install requirements:

        $ mkvirtualenv kb-kitin
        $ pip install -r dev-requirements.txt
        $ cp config.py.in config.py
        $ fab prepare
        
## Managing web assets

		$ tools/fetch-vendor-assets.sh        

## Running js tests
        $ Install node *brew install node* on MacOSX _(also, make sure to install npm)_
        $ NODE_PATH=.:$PWD/static/js
        $ node test/js/test_marcjson.js
