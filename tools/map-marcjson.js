var fs = require('fs');
var marcjson = require('../static/js/marcjson');

function loadJson(path) {
  var data = fs.readFileSync(path, 'utf-8');
  return JSON.parse(data);
}

var marcMapPath = process.argv[2];
var recordType = process.argv[3];
var marcStructPath = process.argv[4];

var marcmap = loadJson(marcMapPath)
if (recordType)
  marcmap = marcmap[recordType];
var struct = loadJson(marcStructPath);

var namedStruct = marcjson.rawToNamed(marcmap, struct);

console.log(JSON.stringify(namedStruct, null, 2));

