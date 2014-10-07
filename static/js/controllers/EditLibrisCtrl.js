kitin.controller('EditLibrisCtrl', function($scope, $controller, $location, recordService, editService) {
  // Inherit edit base controller
  $controller('EditBaseCtrl', {$scope: $scope});

  recordService.record.get($scope.recType, $scope.recId).then(function(data) {
    var record = data['recdata'];
    // MARC
    // !TODO create a cleaner way to detect data format and sperate from bib
    if($location.$$path.indexOf('/marc/') !== -1) {
      delete record.about.publicationCountry;
      recordService.record.convertToMarc(record).then(function(data) {
        $scope.record = data;
      });
    }

    $scope.record = record;
    $scope.etag = data['etag'];
    

    // BIB
    if ($scope.recType === editService.RECORD_TYPES.BIB) {
      $scope.addRecordViewsToScope(record, $scope);
    }
  });
});