#!/bin/bash
BIBID=$1
MARCPATH=/tmp/$BIBID.iso2709
JSONPATH=/tmp/$BIBID.json
curl -s http://libris.kb.se/data/bib/$BIBID?format=ISO2709 -o $MARCPATH
java -cp ../../librisxl/src/whelks-core/build/classes/main/:../../librisxl/src/whelks-core/build/libs/whelks-core.jar se.kb.libris.conch.converter.MarcJSONConverter $MARCPATH > $JSONPATH
curl -XPUT -H "Content-Type:application/json" "http://devlab.libris.kb.se/whelks-core/bib/$BIBID" --data-binary @$JSONPATH