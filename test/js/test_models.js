var fs = require('fs');
var vm = require('vm');

var sandbox = {$: function () {
  return {html: function () { return ""; }};
}};
var context = vm.createContext(sandbox);

var sources = ['static/vendor/backbone/underscore-min.js',
  'static/vendor/backbone/backbone-min.js',
  'static/js/main.js'
];
var recordPath = 'examples/bib/7149593.json';

sources.forEach(function (fpath) {
  var source = fs.readFileSync(fpath, 'utf-8');
  vm.runInContext(source, context, fpath);
});

var data = JSON.parse(fs.readFileSync(recordPath, 'utf-8'));
var record = new context.Record(data);
var result = record.toJSON();

console.log(JSON.stringify(data) === JSON.stringify(result));

