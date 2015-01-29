
/**
 * app.js
 */

var kitin = angular.module('kitin', [
    'ngRoute', 'pascalprecht.translate',
    'ui.utils', 'ui.bootstrap', 'ngAnimate', 'cgBusy', 'dialogs.main',
    'kitin.controllers', 'kitin.filters', 'kitin.services', 'kitin.directives']);

kitin.config(function($locationProvider, $routeProvider, $translateProvider, $httpProvider, dialogsProvider) {
  
      $locationProvider.html5Mode(true).hashPrefix('!');

       // add translation table
      $translateProvider
        .useUrlLoader('/resource/translation')
        .preferredLanguage('se');

      $routeProvider
        .when('/',                                  { templateUrl: '/partials/index' })
        .when('/search/:recType',                   { templateUrl: '/partials/search' })
        .when('/edit/:editSource/:recType/:recId',  { templateUrl: '/partials/edit_base', reloadOnSearch: false })
        .when('/marc/:recType/:recId',              { templateUrl: '/partials/marc', isMarc: true });

      $httpProvider.interceptors.push('HttpInterceptor');

      // This is used by confirm prompts created with dialogs.create
      dialogsProvider.useBackdrop(false);
      dialogsProvider.useEscClose(false);
      dialogsProvider.useClass('kitin-dialog');
      dialogsProvider.useFontAwesome(true);
      dialogsProvider.setSize('md');

});

// default popover options
kitin.config(function($tooltipProvider) {
  $tooltipProvider.options({
    placement: "right"
  });
});

kitin.value('cgBusyDefaults',{
  templateUrl: '/dialogs/busy'
});

// unsafe filter for html
kitin.filter('unsafe', ['$sce', function ($sce) {
    return function (val) {
        return $sce.trustAsHtml(val);
    };
}]);

// TODO: window.onunload or $routeProvider / $locationChangeStart
// See kitin.run below
//if (ajaxInProgress)
//  confirm('ajaxInProgress; break and leave?')

/**
 * Global Constants
 * (TODO: move to service and depend on in required places instead)
 */
kitin.run(function($rootScope, $location) {
  $rootScope.API_PATH = WHELK_HOST;
  $rootScope.WRITE_API_PATH = WHELK_WRITE_HOST;

  // Make sure we have no unsaved forms
  // var locationChangeOff = $rootScope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
  //   var forms = $rootScope.modifications;
  //   if (angular.isDefined(forms)) {
  //     if ( (forms.bib.isDirty && forms.bib.isDirty()) || (forms.bib.isDirty && forms.bib.isDirty()) || (forms.bib.isDirty && forms.bib.isDirty()) ) {
  //       event.preventDefault();        
  //       console.log('dirty form detected');
  //     }
  //   }
  // });
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

// Enabling CORS support in jQuery to make jquery autocompleter work in IE
jQuery.support.cors = true;

if(debug) {
  // Get click event log and layout grid toggle
  $(document).on("click", function (evt) {
    if (!evt.altKey)
      return;

    evt.stopPropagation();
  }).on('keydown', function(e) {
    if ( e.which == 192 ) {
      $('#grid').toggle();
    }
  });
}


var rand = function(min, max) {
  return min + Math.floor(Math.random()*(max-min));
};

$(function() {
  $.easing.libris = function (x, t, b, c, d) {
    return -c * ((t=t/d-1)*t*t*t - 1) + b;
  };
  var c = function() {
    return $('<i>').text('❄').css({
      fontStyle: 'normal',
      zIndex: 100,
      position: 'fixed',
      top:-100,
      left: rand(0, $(window).width()),
      fontSize: rand(20,40)+'px',
      fontFamily: 'sans-serif',
      color:'rgb(' + [rand(100,200), rand(100,200), rand(0,200)].join(',') + ')'
    }).animate({
      top: $(window).height()+100
    }, rand(4000,12000), 'libris', function() {
      $(this).remove();
    }).appendTo(document.body);
  };
  $(document).on('keyup', function snow(e) {
    if ( e.ctrlKey && e.which == 83 ) {
      setInterval(c, 100);
      $(document).off('keyup', snow);
    }
  });
});


var kitin = angular.module('kitin.directives', []);
var kitin = angular.module('kitin.filters', []);
var kitin = angular.module('kitin.services', []);

