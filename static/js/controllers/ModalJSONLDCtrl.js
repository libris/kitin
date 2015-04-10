kitin.controller('ModalJSONLDCtrl', function($scope, $modalInstance, $q, recordService, record) {

  $scope.record = record;

  $scope.close = function() {
    var deferred = $q.defer();
    $modalInstance.close();
    deferred.resolve();
    return deferred.promise;
  };
});