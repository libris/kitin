var kitin = angular.module('kitin.controllers', []);
kitin.controller('AppCtrl', function($scope, $rootScope, $modal, $timeout, $location, $document, $modalStack, $http, definitions, searchService, dialogs) {

  // Core Utilities
  $rootScope.lodash = _;
  $rootScope.isEmpty = function(obj) { return _.isEmpty(obj); };
  $rootScope.typeOf = function (o) { return o === null? 'null' : typeof o; };
  $rootScope.exists = function(o) { return typeof o !== 'undefined'; };

  // App State
  $rootScope.debug = (debug === true) || false;
  $rootScope.allowEdit = false; // To be controlled by permissions

  // Container for dirty flags
  $rootScope.modifications = {
    bib: {},
    holding: {},
    auth: {}
  };
  
  // Container for busy indicators
  $rootScope.promises = {
    bib: {},
    holding: {},
    draft: {},
    marc: {},
    auth: {},
    jsonld: {}
  };

  $rootScope.MESSAGES = MESSAGES;
  $rootScope.globalAlert = {
    msg: MESSAGES['main_status_msg'],
    read : true,
    markRead : function () {
      localStorage.setItem('MAIN_STATUS_MSG', $rootScope.globalAlert.msg);
      $rootScope.globalAlert.read = true;
    }
  };
  if(localStorage.getItem('MAIN_STATUS_MSG') !== $rootScope.globalAlert.msg)
  {
    $rootScope.globalAlert.read = false;
  }

  window.toggleEdit = function () {
    $rootScope.allowEdit = !$rootScope.allowEdit;
    return $rootScope.allowEdit;
  };

  window.onbeforeunload = function() {
    if (
      $rootScope.modifications.holding.saved === false ||
      $rootScope.modifications.bib.saved === false ||
      $rootScope.modifications.auth.saved === false
    ) {
      return 'Du har osparande ändringar.';
    }
  };

  if ( debug === true ) {
    $rootScope.log = function(variables,event) {
      if ( event ) {
        event.preventDefault();
        event.stopPropagation();
      }
      if ( typeof variables == 'Array') {
        variables.forEach(function() {

        });
      } else{

      }
    };
    // Log stuff
    $(document).on('keydown', function(e) {
      if ( e.which == 192 && e.ctrlKey ) {
        console.log($rootScope);
      }
    });
  }

  var searchParams = $location.search();

  $rootScope.state = {
    searchType: {},
    remoteDatabases: [],
    search: {
      q: searchParams.q || null,
      n: searchParams.n || null,
      page: {
        start: searchParams.start || null
      },
      sort: searchParams.sort || null,
      database: searchParams.database || null,
      f: searchParams.f || null,
      view: searchParams.view || 'detailed'
    },

    getSearchParams : function() {
      var params = {
        q: $rootScope.state.search.q,
        start: $rootScope.state.search.page.start,
        facets: searchService.searchTypeIndex.bib.facets,
        n: $rootScope.state.search.n || searchService.getPageSize($rootScope.state.search.view),
        sort: $rootScope.state.search.sort,
        database: $rootScope.state.searchType.key === searchService.searchTypeIndex.remote.key ? $rootScope.state.search.database : undefined
      };
      if ($rootScope.state.search.f !== undefined && $rootScope.state.search.f !== 'none') {
        params.f = $rootScope.state.search.f;
      }
      return params;
    }
  };

  // Custom Modal controls ------------

  // Create our own ESC keydown event so we can use
  // .close() instead of .dismiss() (this checks dirty flags)
  $document.bind('keydown', function (evt) {
    var modal = $modalStack.getTop();
    if (evt.which === 27 && typeof modal !== 'undefined' && typeof modal.value.modalScope.close !== 'undefined') {
      modal.value.modalScope.close();
    }
  });
  // Create our own backdrop click event so we can use
  // .close() instead of .dismiss() (this checks dirty flags)
  document.addEventListener('click', function (event) {
    var target = angular.element(event.target);
    if (target.hasClass('modal')) {
      var modal = $modalStack.getTop();
      if (typeof modal !== 'undefined' && typeof modal.value.modalScope.close !== 'undefined') {
        modal.value.modalScope.close();
      }
    }
  });

  // System Messages
  // TODO Remove these?
  $rootScope.systemMessages = [];

  $rootScope.addSystemMessage = function(msgObj) {
    function makeHash(string) {
      var response = 0;
      var len = string.length;
      for (var i = 0; i < len; i++) {
        response = response * 31 + string.charCodeAt(i);
        response = response & response;
      }
      return response;
    }
    // Create a hash based on message and status (if applicable)
    var hashString = msgObj.msg;
    if (msgObj.status) hashString += msgObj.status;
    hashString = makeHash(hashString);
    // Pull out if this combination of message and status is already present in systemMessages
    for (var i = 0; i < $rootScope.systemMessages.length; i++) {
      if ($rootScope.systemMessages[i].hash == hashString) return;
    }
    msgObj.hash = hashString;

    $rootScope.systemMessages.push(msgObj);
    if(msgObj.timeout) {
      $timeout(function() {
        $rootScope.closeSystemMessage($rootScope.systemMessages.length-1);
      }, msgObj.timeout);
    }
  };

  $rootScope.closeSystemMessage = function(index) {
    $rootScope.systemMessages.splice(index, 1);
  };

  // Data Model Utilities

 
  if($rootScope.API_PATH !== '' && !_.isEmpty(CURRENT_USER)) {
    definitions.terms.then(function(termsObj) {
      angular.extend($rootScope, termsObj);
    });

    definitions.recordSkeletonTypeMap.then(function(skeletonTypeMap) {
      $rootScope.getSkeletonTypeMap = function() {
        return skeletonTypeMap;
      };
    });
  }

});
