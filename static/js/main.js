
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
//if (ajaxInProgress)
//  confirm('ajaxInProgress; break and leave?')

/**
 * Global Constants
 * (TODO: move to service and depend on in required places instead)
 */
kitin.run(function($rootScope, $location) {
  $rootScope.API_PATH = WHELK_HOST;
  $rootScope.WRITE_API_PATH = '/whelk-webapi';
  
  var params;
  var queryString;

  $rootScope.$on("$routeChangeStart", function (e, current) {
    params = $rootScope.state.search;
    queryString = $location.search();
  });

  $rootScope.$on("$routeChangeSuccess", function (e, current) {
    var persistentQS = {
      q: params.q || null,
      n: params.n || null,
      start: (params.page) ? params.page.start || null : null,
      sort: params.sort || null,
      database: params.database || null,
      f: params.f || null
    };

    var compactObject = _.partialRight(_.pick, _.identity);

    _.extend(queryString, compactObject(persistentQS));

    $location.search(queryString);
  });

  // var locationChangeOff = $rootScope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
  //   // Prevent default action, we need to handle all location changes 
  //   // For example, to prompt user when navigation occurs and form is dirty
  //   event.preventDefault();

  //   console.log(newUrl);

  //   //var searchParams = $location.search();
  //   var destination;
  //   var go = function() {
  //     locationChangeOff();
  //     console.log('going');
  //     $location.url('/' + destination);
  //     //newUrl = destination;
  //     return;
  //   };

  //   destination = newUrl.split('/');
  //   destination.splice(0,3);
  //   destination = destination.join('/');
    
  //   // Make sure query string persists
  //   if (oldUrl.indexOf('?') >= 0) {
  //     //console.log(oldUrl.split('?'));
  //     //destination += '?' +
  //     console.log('splitting');
  //     var oldQS = oldUrl.split('?')[1];
  //     var newPath = destination.split('?')[0];
  //     newUrl = newPath + oldQS;
  //   } else {
  //     newUrl = destination;
  //   }
  //   console.log(destination);

  //   // Make sure we have no unsaved forms
  //   var forms = $rootScope.modifications;
  //   if (angular.isDefined(forms)) {
  //     if ( (forms.bib.isDirty && forms.bib.isDirty()) || (forms.bib.isDirty && forms.bib.isDirty()) || (forms.bib.isDirty && forms.bib.isDirty()) ) {
        
  //       console.log('dirty form detected');
  //     }
  //   }

  //   go();

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

