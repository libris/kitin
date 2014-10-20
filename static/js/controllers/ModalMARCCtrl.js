kitin.controller('ModalMARCCtrl', function($scope, $modalInstance, recordService, record) {

  var flattenMARC = function(marcRecord) {

  };

  // POST record to Whelk and get it in MARC
  recordService.libris.convertToMarc(record).then(function(marcRecord) {
    $scope.record = flattenMARC(marcRecord);
  });

  $scope.close = function() {
    $modalInstance.close();
  };
});