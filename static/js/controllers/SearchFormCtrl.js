kitin.controller('SearchFormCtrl', function($scope, $location, $routeParams, $rootScope, definitions, searchService, searchUtil) {

  $scope.searchTypes = [searchService.searchTypeIndex.bib, searchService.searchTypeIndex.auth, searchService.searchTypeIndex.remote];
  $scope.setSearchType = function (key) {
    $rootScope.state.searchType = searchService.searchTypeIndex[key];
  };

  $scope.search = function(searchParams) {
    var selectRemoteDatabases = '';
    if($rootScope.state.searchType.key === searchService.searchTypeIndex.remote.key) {
      selectRemoteDatabases = searchUtil.parseSelected($rootScope.state.remoteDatabases);
      selectRemoteDatabases = selectRemoteDatabases.length > 0 ? '&database=' + selectRemoteDatabases : '';
    }
    var searchParamString = '';
    if (searchParams) {
      searchParams = $rootScope.state.getSearchParams();
      if (searchParams.f) {
        searchParamString += '&f=' + searchParams.f;
      }
      if (searchParams.page) {
        searchParamString += '&page=' + searchParams.page;
      }
      if (searchParams.sort) {
        searchParamString += '&sort=' + searchParams.sort;
      }
    }
    $location.url("/search/" + $rootScope.state.searchType.key + "?q="+encodeURIComponent($rootScope.state.search.q) + selectRemoteDatabases + searchParamString);
  };
  $scope.$on('$routeChangeSuccess', function () {
    $scope.setSearchType($routeParams.recType || "bib");
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