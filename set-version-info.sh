#!/bin/bash
[[ -z $1 ]] && echo "Usage: $0 VERSION" && exit 1
echo "VERSION = '$1'" > version.cfg
