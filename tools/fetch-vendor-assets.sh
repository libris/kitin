#!/bin/bash
fetch() {
    if [[ -f $1 ]]; then
        curl -z $1 -o $1 $2 -#
    else
        curl -o $1 $2 -#
    fi
}

DIR=$(dirname $(dirname $0))/static/vendor/
set -e -v

pushd $DIR

  fetch bootstrap.zip http://twitter.github.com/bootstrap/assets/bootstrap.zip
  unzip -u bootstrap.zip
  rm bootstrap.zip

  pushd jquery/

    fetch jquery.min.js http://code.jquery.com/jquery-1.7.2.min.js

    fetch jquery.autocomplete.min.js https://raw.github.com/dyve/jquery-autocomplete/master/src/jquery.autocomplete.min.js
    fetch jquery.autocomplete.css https://raw.github.com/dyve/jquery-autocomplete/master/src/jquery.autocomplete.css
    fetch indicator.gif https://github.com/dyve/jquery-autocomplete/raw/master/src/indicator.gif

    fetch jquery.jkey.js https://raw.github.com/OscarGodson/jKey/master/jquery.jkey.js

  popd

  fetch angular.min.js http://ajax.googleapis.com/ajax/libs/angularjs/1.0.2/angular.min.js

popd
