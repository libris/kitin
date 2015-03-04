// Reference Configuration File:
// https://raw.githubusercontent.com/angular/protractor/master/docs/referenceConf.js

var conf = {
  // Use Chrome directly. 
  capabilities: {
    browserName: 'chrome'
  },
  directConnect: true,

  // ---------------------------------------------------------------------------
  // ----- What tests to run ---------------------------------------------------
  // ---------------------------------------------------------------------------
  // We might want to create different scenarios, use suites rather than specs
  suites: {
    search: [
      '../e2e/search.bib.js',
      // '../e2e/search.auth.js',
      // '../e2e/search.remote.js',
    ],
    full: '../e2e/**/*.js'
  },
  // Patterns to exclude.
  exclude: ['../e2e/*PageObject.js'],

  // ---------------------------------------------------------------------------
  // ----- Global test information ---------------------------------------------
  // ---------------------------------------------------------------------------
  //
  // A base URL for your application under test. Calls to protractor.get()
  // with relative paths will be prepended with this.
  baseUrl: 'http://localhost:5000',

  // The timeout in milliseconds for each script run on the browser. This should
  // be longer than the maximum time your application needs to stabilize between
  // tasks.
  allScriptsTimeout: 11000,

  // How long to wait for a page to load.
  getPageTimeout: 10000,

  framework: 'jasmine',


  // A callback function called once protractor is ready and available, and
  // before the specs are executed.
  // If multiple capabilities are being run, this will run once per
  // capability.
  // You can specify a file containing code to run by setting onPrepare to
  // the filename string.
  onPrepare: function() {
    describe('Log in test user', function() {
      var findByName = function (name) {
          return element(by.name(name));
      };

      it('should log in', function() {
        browser.get(conf.baseUrl + '/login');
        findByName('username').sendKeys('test');
        findByName('password').sendKeys('test');
        findByName('login').click();
      });

      it('should redirect to /', function() {
        expect(browser.getCurrentUrl()).toBe(conf.baseUrl + '/');
      });
    });
  }
};

exports.config = conf;