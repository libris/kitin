kitin.controller('SearchFormCtrl', function($scope, $location, $routeParams, $rootScope, definitions, searchService, searchUtil) {

  $scope.searchTypes = searchService.searchTypeIndex;
  $scope.setSearchType = function(key) { searchService.setSearchType(key); };
  $scope.search = function(searchParams) {
    var selectRemoteDatabases = '';
    if($rootScope.state.searchType.key === searchService.searchTypeIndex.remote.key) {
      selectRemoteDatabases = searchUtil.parseSelected($rootScope.state.remoteDatabases);
      selectRemoteDatabases = selectRemoteDatabases.length > 0 ? '&databases=' + selectRemoteDatabases : '';
    }
    var searchParamString = '';
    if (searchParams) {
      searchParams = $rootScope.state.getSearchParams();
      if (searchParams.f) {
        searchParamString += '&f=' + searchParams.f;
      }
      if (searchParams.start) {
        searchParamString += '&start=' + searchParams.start;
      }
      if (searchParams.n) {
        searchParamString += '&n=' + searchParams.n;
      }
      if (searchParams.sort) {
        searchParamString += '&sort=' + searchParams.sort;
      }
    }
    $location.url("/search/" + $rootScope.state.searchType.key + "?q="+encodeURIComponent($rootScope.state.search.q) + selectRemoteDatabases + searchParamString);
  };
  $scope.$on('$routeChangeSuccess', function () {
    searchService.setSearchType($routeParams.recType || "bib");
  });
  $scope.$watch('state.searchType.key', function(newValue, oldValue) {
    $scope.isopen = false;
    if(newValue == 'remote') {
      // For remote search, load list of remote database definitions
      if(_.isEmpty($rootScope.state.remoteDatabases)) {
        definitions.remotedatabases.then(function(databases){
          var searchedDatabases = ['LC']; // Debug, set LC (Library of Congress) to default
          if($rootScope.state.search.database) {
            searchedDatabases = $rootScope.state.search.database.split(',');
          }
          _.forEach(searchedDatabases, function(dbName) {
            var i = _.findIndex(databases, { 'database': dbName });
            if(i > 0) {
              databases[i].selected = true;
            }
          });      

          $rootScope.state.remoteDatabases = databases;
        });
      }
    }
    
  });

});