kitin.controller('ModalRemoteCtrl', function($scope, $rootScope, $modalInstance, definitions, searchService) {
  // For remote search, load list of remote database definitions
  if(_.isEmpty($rootScope.state.remoteDatabases)) {
    definitions.remotedatabases.then(function(databases){
      
      var searchedDatabases = [];
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

  $scope.close = function() {
    $modalInstance.close();
  };
});