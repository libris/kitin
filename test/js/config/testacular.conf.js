// Testacular configuration
// Generated on Sat Jan 26 2013 19:02:54 GMT+0100 (CET)


// base path, that will be used to resolve files and exclude
basePath = '../../../';


// list of files / patterns to load in the browser
files = [
  JASMINE,
  JASMINE_ADAPTER,
  'static/vendor/angular.min.js',
  'static/vendor/angular-mocks.js',
  'static/vendor/jquery/jquery.min.js',
  'static/vendor/jquery/jquery.autocomplete.min.js',

  'static/js/main.js',
  'test/js/unit/ctrlSpec.js',
  'test/js/unit/srvSpec.js'
  //'marcmap-overlay.json'
  //'test/e2e/*.js'
];


// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
//reporters = ['progress'];


// web server port
port = 8080;


// cli runner port
//runnerPort = 9100;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;


// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = ['Chrome'];


// If browser does not capture in given timeout [ms], kill it
captureTimeout = 5000;


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;
