kitin.controller('EditLibrisCtrl', function($scope, $controller, $location, recordService, editService) {
  // Inherit edit base controller
  $controller('EditBaseCtrl', {$scope: $scope});

  recordService.libris.get($scope.recType, $scope.recId).then(function(data) {
    var record = data['recdata'];
    $scope.record = record;
    $scope.etag = data['etag'];
    

    // BIB
    if ($scope.recType === editService.RECORD_TYPES.BIB) {
      $scope.addRecordViewsToScope(record, $scope);
    }
  });
});