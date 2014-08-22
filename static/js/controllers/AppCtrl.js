var kitin = angular.module('kitin.controllers', []);
kitin.controller('AppCtrl', function($scope, $rootScope, $modal, $timeout, definitions, searchService) {

  // Core Utilities
  $rootScope.lodash = _;
  $rootScope.isEmpty = function(obj) { return angular.equals({},obj); };
  $rootScope.typeOf = function (o) { return o === null? 'null' : typeof o; };
  $rootScope.exists = function(o) { return typeof o !== 'undefined'; };

  // App State
  $rootScope.debug = (debug === true) || false;

  $rootScope.loading = false;
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

  definitions.terms.then(function(data) {
    $rootScope.ID = '@id';
    $rootScope.TYPE = '@type';
    $rootScope.TERMS = 'http://libris.kb.se/def/terms#';

    var terms = data.index;
    var items = []; for (var key in data.index) items.push(data.index[key]);
    $rootScope.termIndex = Gild.buildIndex(items);

    $rootScope.getTermToken = function (obj) {
      var id = obj['@id'];
      if (typeof id !== 'string')
        return null;
      return id.substring(id.indexOf('#') + 1);
    };

    $rootScope.getTypeDef = function (obj) {
      if (typeof obj === "undefined")
        return;
      return terms[obj['@type']];
    };
    // TODO: merge with getLabel (defined in SearchCtrl)
    $rootScope.getTypeLabel = function (obj) {
      if (typeof obj === "undefined")
        return;
      var dfn = $rootScope.getTypeDef(obj);
      var typeLabel = (dfn) ? dfn['label_sv'] : obj['@type'];
      return _.isArray(typeLabel) ? typeLabel.join(', ') : typeLabel;
    };
  });


});
