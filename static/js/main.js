
/**
 * app.js
 */

var kitin = angular.module('kitin', [
    'ngRoute',
    'ui', 'ui.bootstrap',
    'kitin.controllers', 'kitin.filters', 'kitin.services', 'kitin.directives']);

kitin.config(
  ['$locationProvider', '$routeProvider',
    function($locationProvider, $routeProvider) {
      $locationProvider.html5Mode(true).hashPrefix('!');
      $routeProvider
        .when('/',
              {templateUrl: '/partials/index'})
        .when('/search/:recType',
              {templateUrl: '/partials/search'})
        // .when('/edit/auth/:recId',
        //       {templateUrl: '/partials/edit_auth'}) 
        .when('/edit/:recType/:recId',
              {templateUrl: '/partials/edit'})  
        .when('/jsonld/:recType/:recId',
              {templateUrl: '/partials/jsonld'})
        
        ;//.otherwise({redirectTo: '/'});

    }]
);

// TODO: window.onunload or $routeProvider / $locationChangeStart
//if (ajaxInProgress)
//  confirm('ajaxInProgress; break and leave?')

/**
 * Global scope functions
 */
kitin.run(function($rootScope) {

  $rootScope.lodash = _;

  $rootScope.isEmpty = function(obj) { return angular.equals({},obj); };
  $rootScope.typeOf = function (o) { return o === null? 'null' : typeof o; };

});

// Davids preloads
['top-small.png', 'bg.png'].forEach(function(img) {
    new Image().src = '/static/img/'+img;
});

// Davids patch for positioning the completer downwards
$.Autocompleter.prototype.position = function() {
  var offset = this.dom.$elem.offset();
  this.dom.$results.css({
    top: offset.top + this.dom.$elem.outerHeight(),
    left: offset.left
  });
};

// TODO: turn into promptService?
function openPrompt($event, promptSelect, innerMenuSelect) {
  var tgt = $($event.target),
    off = tgt.offset(), width = tgt.width();
  var prompt = $(promptSelect);
  // NOTE: picking width from .dropdown-menu which has absolute pos
  var menuWidth = (innerMenuSelect? $(innerMenuSelect, prompt) : prompt).width();
  var topPos = off.top;
  var leftPos = off.left + width - menuWidth;
  if (leftPos < 0)
    leftPos = 0;
  prompt.css({position: 'absolute',
              top: topPos + 'px', left: leftPos + 'px'});
  prompt.find('select').focus();
}

// TODO only if debug=true
$(document).on("click", function (evt) {
  if (!evt.altKey)
    return;
  console.log($(evt.target).scope());
  evt.stopPropagation();
}).on('keydown', function(e) {
  if ( e.which == 192 ) {
    $('#grid').toggle();
  }
});
