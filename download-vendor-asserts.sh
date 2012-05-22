#!/bin/bash
pushd $(dirname $0)
    curl https://raw.github.com/OscarGodson/jKey/master/jquery.jkey.js -o static/js/jquery.jkey.js
popd
