kitin.controller('SearchFormCtrl', function($scope, $location, $routeParams, $rootScope, definitions, searchService, searchUtil) {

  $scope.searchTypes = [searchService.searchTypeIndex.bib, searchService.searchTypeIndex.auth, searchService.searchTypeIndex.remote];
  $scope.setSearchType = function (key) {
    $rootScope.state.searchType = searchService.searchTypeIndex[key];
  };
  
  $scope.search = function() {
    var selectRemoteDatabases = '';
    if($rootScope.state.searchType.key === searchService.searchTypeIndex.remote.key) {
      selectRemoteDatabases = searchUtil.parseSelected($rootScope.state.remoteDatabases);
      selectRemoteDatabases = selectRemoteDatabases.length > 0 ? '&database=' + selectRemoteDatabases : '';
    }
    
    $location.url("/search/" + $rootScope.state.searchType.key + "?q="+encodeURIComponent($rootScope.state.search.q) + selectRemoteDatabases);
  };
  $scope.$on('$routeChangeSuccess', function () {
    $scope.setSearchType($routeParams.recType || "bib");
  });
});