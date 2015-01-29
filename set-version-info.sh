#!/bin/bash
if [ -z $1 ]; then
    echo "Usage: $0 VERSION"
    exit 1
fi
echo "VERSION = '$1'" > version.cfg
