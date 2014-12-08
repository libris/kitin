// Reference Configuration File
//
// This file shows all of the configuration options that may be passed
// to Protractor.

// https://raw.githubusercontent.com/angular/protractor/master/docs/referenceConf.js

exports.config = {
  // ---- 4. To connect directly to Drivers ------------------------------------
  // Boolean. If true, Protractor will connect directly to the browser Drivers
  // at the locations specified by chromeDriver and firefoxPath. Only Chrome
  // and Firefox are supported for direct connect.
  directConnect: true,
  // Path to the firefox application binary. If null, will attempt to find
  // firefox in the default locations.
  firefoxPath: null,

  // ---------------------------------------------------------------------------
  // ----- What tests to run ---------------------------------------------------
  // ---------------------------------------------------------------------------

  // Patterns to exclude.
  exclude: [],

  // Alternatively, suites may be used. When run without a command line
  // parameter, all suites will run. If run with --suite=smoke or
  // --suite=smoke,full only the patterns matched by the specified suites will
  // run.
  suites: {
    full: '../e2e/*.js'
  },

  capabilities: {
    browserName: 'chrome'
  },

  // ---------------------------------------------------------------------------
  // ----- Global test information ---------------------------------------------
  // ---------------------------------------------------------------------------
  //
  // A base URL for your application under test. Calls to protractor.get()
  // with relative paths will be prepended with this.
  baseUrl: 'http://localhost:5000',

  // CSS Selector for the element housing the angular app - this defaults to
  // body, but is necessary if ng-app is on a descendant of <body>.
  rootElement: 'body',

  // The timeout in milliseconds for each script run on the browser. This should
  // be longer than the maximum time your application needs to stabilize between
  // tasks.
  allScriptsTimeout: 11000,

  // How long to wait for a page to load.
  getPageTimeout: 10000,

  framework: 'jasmine'
};