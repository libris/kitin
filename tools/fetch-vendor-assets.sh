#!/bin/bash
fetch() {
    if [[ -f $1 ]]; then
        curl -z $1 -o $1 $2 -#
    else
        curl -o $1 $2 -#
    fi
}

DIR=../static/vendor/
set -e -v

pushd $DIR

  fetch bootstrap.zip http://twitter.github.com/bootstrap/assets/bootstrap.zip
  unzip -u bootstrap.zip
  rm bootstrap.zip

  pushd jquery/

    fetch jquery.min.js http://code.jquery.com/jquery-1.9.1.min.js

    fetch jquery.autocomplete.min.js https://raw.github.com/dyve/jquery-autocomplete/0bb1a4edf23d9e3bd0d55bd78ec48623a5c19e85/src/jquery.autocomplete.min.js
    fetch jquery.autocomplete.css https://raw.github.com/dyve/jquery-autocomplete/0bb1a4edf23d9e3bd0d55bd78ec48623a5c19e85/src/jquery.autocomplete.css
    fetch indicator.gif https://github.com/dyve/jquery-autocomplete/raw/master/src/indicator.gif

    fetch jquery.jkey.js https://raw.github.com/OscarGodson/jKey/master/jquery.jkey.js
	fetch jquery.autosize.js https://github.com/jackmoore/autosize/blob/master/jquery.autosize.js
  popd

  fetch angular.min.js http://ajax.googleapis.com/ajax/libs/angularjs/1.0.4/angular.min.js
  fetch angular-mocks.js http://code.angularjs.org/1.0.2/angular-mocks.js

  fetch lodash.min.js https://raw.github.com/bestiejs/lodash/v1.3.1/dist/lodash.min.js

popd
