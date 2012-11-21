var fs = require('fs');
var marcjson = require('../static/js/marcjson');

function loadJson(path) {
  var data = fs.readFileSync(path, 'utf-8');
  return JSON.parse(data);
}

if (!process.argv[2]) {
  console.log("USAGE: map-marcjson.js MARCMAP_FILE bib MARC_JSON_FILE [OVERLAY_FILE]")
  process.exit();
}
var marcMapPath = process.argv[2];
var recordType = process.argv[3];
var marcStructPath = process.argv[4];
var op = process.argv[5];

var marcmap = loadJson(marcMapPath)
if (recordType)
  marcmap = marcmap[recordType];
var struct = loadJson(marcStructPath);

var out;
if (op === '-n') {
  out = marcjson.rawToNamed(marcmap, struct);
} else if (op !== undefined) {
  var overlay = loadJson(op);
  out = marcjson.createEditMap(marcmap, overlay, struct);
} else {
  marcjson.expandFixedFields(marcmap, struct);
  out = struct;
}

console.log(JSON.stringify(out, null, 2));

