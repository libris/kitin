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
        $ fab prepare
        
## Managing web assets

		$ tools/fetch-vendor-assets.sh        

## Running js tests
        $ Install node *brew install node* on MacOSX _(also, make sure to install npm)_
        $ NODE_PATH=.:$PWD/static/js
        $ node test/js/test_marcjson.js
