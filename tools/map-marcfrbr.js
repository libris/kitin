var marcfrbr = require('../static/js/marcfrbr')

var marcMapPath = "/opt/work/kb/kitin/marcmap2.json"
var marcStructPath = "./examples/bib/7149593.json"

var submap = require(marcMapPath)['bib']
var struct = require(marcStructPath)

var out = marcfrbr.toFrbrStruct(submap, struct)

console.log(JSON.stringify(out, null, 2))

// | rdfpipe -ijson-ld:context=tools/marcfrbr-libris-context.json -
