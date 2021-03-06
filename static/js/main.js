
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
      if(typeof TESTING_SKIP_TRANSLATION === 'undefined') {
        $translateProvider
          .preferredLanguage('se')
          .useLoaderCache(true)
          .useLoader('labelLoader')
          .useInterpolation('labelTranslateInterpolator');
      }

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

kitin.run(function($rootScope, $location, $modalStack, $window, dialogs, userData) {
  $rootScope.API_PATH = API_PATH;
  $rootScope.WRITE_API_PATH = WHELK_WRITE_HOST;
  // Set current user, returned from back-end
  userData.set(CURRENT_USER);
  $rootScope.user = userData.get();

  $rootScope.$on('$locationChangeStart', function (event) {
    var closeModals = function(i) {
      i++; // Added for some false safety
      if($modalStack.getTop() && i <= 10) {
        var modalScope = $modalStack.getTop().value.modalScope;
        if(modalScope && modalScope.close) {
          modalScope.close().then(function() {
            // If modal are closed contiune and close next modal
            // Holdings modal isnt closed if edited and user clicks no in confirm dialog
            closeModals(i);
          });
        }
      } else {
        return;
      }
    };

    if($modalStack.getTop()) {
      closeModals(0);
      event.preventDefault();
    }
  });

  // Making sure we have no unsaved changes before loading a new page, will prompt the user
  $rootScope.$on("$locationChangeStart",function(event, next, current){
    if (
      $rootScope.modifications.bib.saved === false ||
      $rootScope.modifications.auth.saved === false
    ) {
      // Compare if the base location has really changed,
      // otherwise just return out of this function and let the redirect proceed.
      // For this we'll throw away any queries and hashes in the URL
      // In IE we've added #! before the interesting part so we'll have to check [1] instead of [0]
      if(current.indexOf('#!') !== -1) {
        if (next.split('#')[1].split('?')[0] === current.split('#')[1].split('?')[0]) // IE
          return;
      } else {
        if (next.split('#')[0].split('?')[0] === current.split('#')[0].split('?')[0])
          return;
      }
      // We are indeed trying to change page, let's prevent default and summon prompt
      event.preventDefault();
      var data = {
        message: 'LABEL.gui.dialogs.NAVIGATE_UNSAVED',
        icon: 'fa fa-exclamation-circle'
      };
      var confirm = dialogs.create('/dialogs/confirm', 'CustomConfirmCtrl', data, { windowClass: 'kitin-dialog' });
      confirm.result.then(function yes(answer) {
        // User has accepted redirect without saving.
        // Destroy modification status and redirect to the requested page.
        $rootScope.modifications.bib = {};
        $rootScope.modifications.auth = {};
        $window.location.href=next;
      }, function no(answer) {
        return;
      });
    }
  });

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

