kitin.controller('ModalBibViewCtrl', function($scope, $modalInstance, $rootScope, $location, record, isRemote, recordService, userData, utilsService) {

  $scope.userData = userData;
  $scope.utils = utilsService;
  $scope.record = record;

  $scope.isRemote = isRemote;
  if ($scope.isRemote) {
    // Get full name
    $scope.remoteDatabase = _.where($rootScope.state.remoteDatabases, {database : record.database})[0].name;
    // reroute record variable
    $scope.record = $scope.record.data;
  }

  // TODO: Put this in better place for access from both result list and bib modal.
  $scope.importRecord = function(data) {
    recordService.draft.create('bib', null, data)
      .then(function success(response) {
        // send user to edit
        $location.url("edit/draft" + response.recdata['@id']);
        $scope.close();
      }, function error(status) {

      });
  };

  $scope.close = function() {
    $modalInstance.close();
  };
});