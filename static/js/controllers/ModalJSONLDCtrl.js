kitin.controller('ModalJSONLDCtrl', function($scope, $modalInstance, $q, recordService, editService, record) {

  var recordDataCopy = angular.copy(record);
  editService.undecorate(recordDataCopy).then(function(undecoratedRecord) {
    $scope.record = undecoratedRecord;
  });

  $scope.close = function() {
    var deferred = $q.defer();
    $modalInstance.close();
    deferred.resolve();
    return deferred.promise;
  };

});
