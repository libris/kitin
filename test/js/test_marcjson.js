var fs = require('fs');
var marcjson = require('../../static/js/marcjson');

function loadJson(path) {
  var data = fs.readFileSync(path, 'utf-8');
  return JSON.parse(data);
}

var marcmap = loadJson("marcmap.json");
var struct = loadJson("examples/bib/7149593.json");

var namedStruct = marcjson.rawToNamed(marcmap, struct);

console.log(JSON.stringify(namedStruct, null, 2));

