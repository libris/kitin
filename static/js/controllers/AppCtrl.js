var kitin = angular.module('kitin.controllers', []);
kitin.controller('AppCtrl', function($scope, $rootScope, $modal, $timeout, definitions, searchService) {

  // Core Utilities
  $rootScope.lodash = _;
  $rootScope.isEmpty = function(obj) { return _.isEmpty(obj); };
  $rootScope.typeOf = function (o) { return o === null? 'null' : typeof o; };
  $rootScope.exists = function(o) { return typeof o !== 'undefined'; };

  // App State
  $rootScope.debug = (debug === true) || false;

  // Container for dirty flags
  $rootScope.modifications = {
    bib: {},
    holding: {}
  };
  // Container for busy indicators
  $rootScope.promises = {
    bib: {},
    holding: {},
    draft: {},
    marc: {}
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

  $rootScope.state = {
    searchType: {},
    remoteDatabases: [],
    search: {},

    getSearchParams : function() {
      var params = {
        q: $rootScope.state.search.q,
        start: $rootScope.state.search.page.start,
        n: $rootScope.state.search.page.n,
        sort: $rootScope.state.search.sort,
        database: $rootScope.state.searchType.key === searchService.searchTypeIndex.remote.key ? $rootScope.state.search.database : undefined
      };
      if ($rootScope.state.search.f !== undefined) {
        params.f = $rootScope.state.search.f;
      }
      return params;
    }
  };

  // System Messages

  $rootScope.systemMessages = [];

  $rootScope.addSystemMessage = function(msgObj) {
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

  var ID = '@id';
  var TYPE = '@type';
  var TERMS = 'http://libris.kb.se/def/terms#';

  definitions.terms.then(function(data) {
    var terms = data.index;
    var items = []; for (var key in data.index) items.push(data.index[key]);
    var termIndex = Gild.buildIndex(items);

    $rootScope.ID = ID;
    $rootScope.TYPE = TYPE;
    $rootScope.TERMS = TERMS;
    $rootScope.termIndex = termIndex;

    $rootScope.getTermToken = function (obj) {
      var id = obj[ID];
      if (typeof id !== 'string')
        return null;
      return id.substring(id.indexOf('#') + 1);
    };

    $rootScope.getTypeDef = function (obj) {
      if (typeof obj === "undefined")
        return;
      return terms[obj[TYPE]];
    };

    // TODO: merge with getLabel (defined in SearchCtrl)
    $rootScope.getTypeLabel = function (obj) {
      if (typeof obj === "undefined")
        return;
      var typeLabels = [];
      var typeKeys = obj[TYPE];
      if (!_.isArray(typeKeys)) {
        typeKeys= [typeKeys];
      }
      typeKeys.forEach(function (typeKey) {
        var dfn = terms[typeKey];
        typeLabels.push(dfn? dfn.label : typeKey);
      });
      return typeLabels.join(', ');
    };
  });


});
