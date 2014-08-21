var kitin = angular.module('kitin.controllers', []);
kitin.controller('AppCtrl', function($scope, $rootScope, $modal, searchService, $timeout) {
  $rootScope.API_PATH = WHELK_HOST;
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

});