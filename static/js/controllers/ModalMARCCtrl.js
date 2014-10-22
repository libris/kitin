kitin.controller('ModalMARCCtrl', function($scope, $modalInstance, recordService, record) {

  // POST record to Whelk and get it in MARC
  recordService.libris.convertToMarc(record).then(function(marcRecord) {
    $scope.record = marcRecord;
  });

  $scope.close = function() {
    $modalInstance.close();
  };
});