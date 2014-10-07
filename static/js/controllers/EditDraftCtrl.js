kitin.controller('EditDraftCtrl', function($scope, $controller, recordService) {
  // Inherit edit base controller
  $controller('EditBaseCtrl', {$scope: $scope});

  recordService.draft.get($scope.recType + '/' + $scope.recId).then(function(data) { 
    $scope.record = data['recdata'];
    $scope.addRecordViewsToScope($scope.record);
    $scope.isDraft = true;
    if(data['recdata']['@id']) {
      $scope.record.type = data['recdata']['@id'].split("/").slice(-2)[0];
      $scope.record.id = data['recdata']['@id'].split("/").slice(-2)[1];
    }
    $scope.etag = data['recdata']['etag'];
  });


});