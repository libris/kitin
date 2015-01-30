kitin.controller('ModalMARCCtrl', function($scope, $modalInstance, $q, recordService, record) {

  // POST record to Whelk and get it in MARC
  recordService.libris.convertToMarc(record).then(function(marcRecord) {
    $scope.record = marcRecord;
  });

  $scope.close = function() {
    var deferred = $q.defer();
    $modalInstance.close();
    deferred.resolve();
    return deferred.promise;
  };
});