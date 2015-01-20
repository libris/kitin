// Karma configuration
// Generated on Sun Dec 07 2014 18:59:50 GMT+0100 (CET)

module.exports = function(config) {
  config.set({

    basePath: '../../../',
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    // See main.js for what to include:    
    // 'ngRoute', 'pascalprecht.translate',
    // 'ui.utils', 'ui.bootstrap', 'ngAnimate', 'cgBusy',
    // 'kitin.controllers', 'kitin.filters', 'kitin.services', 'kitin.directives'
    files: [
      'static/vendor/angular/angular.js',
      'static/vendor/angular-route/angular-route.js',
      'static/vendor/angular-translate/angular-translate.js',
      'static/vendor/angular-translate-loader-url/angular-translate-loader-url.js',
      'static/vendor/angular-ui-utils/ui-utils.js',
      'static/vendor/angular-bootstrap/ui-bootstrap-tpls.js',
      'static/vendor/angular-animate/angular-animate.js',
      'static/vendor/angular-busy/angular-busy.js',
      'static/vendor/angular-sanitize/angular-sanitize.js',
      'static/vendor/angular-dialog-service/dialogs.min.js',
      'static/vendor/jquery/jquery.js',
      'static/vendor/dyve-jquery-autocomplete/jquery.autocomplete.js',
      'node_modules/angular-mocks/angular-mocks.js',
      // Global variables
      'test/js/config/globals.js',
      // App files
      'static/js/**/*.js',
      // Test files
      'test/js/unit/*Spec.js',
    ],

    // list of files to exclude
    exclude: [
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging: possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers. available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],

    singleRun: false
  });
};
