#!/bin/bash
pushd $(dirname $0)

    curl https://raw.github.com/OscarGodson/jKey/master/jquery.jkey.js -o static/js/jquery.jkey.js

    curl https://raw.github.com/dyve/jquery-autocomplete/master/src/jquery.autocomplete.min.js -o static/js/jquery.autocomplete.min.js
    curl https://raw.github.com/dyve/jquery-autocomplete/master/src/jquery.autocomplete.css -o static/css/jquery.autocomplete.css
    curl https://github.com/dyve/jquery-autocomplete/raw/master/src/indicator.gif -o static/css/indicator.gif

popd
