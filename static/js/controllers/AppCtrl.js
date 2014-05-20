var kitin = angular.module('kitin.controllers', []);
kitin.controller('AppCtrl', function($scope, $rootScope, $modal, searchService) {
  $rootScope.API_PATH = '/whelk-webapi';
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


});