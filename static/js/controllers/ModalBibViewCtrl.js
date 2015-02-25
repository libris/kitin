kitin.controller('ModalBibViewCtrl', function($scope, $modalInstance, $rootScope, $location, $timeout, $q, record, recType, recordService, userData, utilsService) {

  $scope.userData = userData;
  $scope.utils = utilsService;
  $scope.record = record;
  $scope.recType = recType;

  if ($scope.recType === "remote") {
    $scope.isRemote = true;
    // Get full name
    $scope.remoteDatabase = _.where($rootScope.state.remoteDatabases, {database : record.database})[0].name;
    // reroute record variable
    $scope.record = $scope.record.data;
  }

  // TODO: Put this in better place for access from both result list and bib modal.
  $scope.importRecord = function(data) {
    if(data['@id'])
      delete data['@id'];
    if(data.about['@id'])
      delete data.about['@id'];

    recordService.draft.create('bib', null, data)
      .then(function success(response) {
        // send user to edit
        $location.url("edit/draft" + response.recdata['@id'] + "?imported");
        $scope.close();
      }, function error(status) {

      });
  };

  $scope.editPost = function(data) {
    $location.url("edit/libris" + record['@id']);
    $scope.close();
  };

  $scope.close = function() {
    var deferred = $q.defer();
    $modalInstance.close();
    deferred.resolve();
    return deferred.promise;
  };
});