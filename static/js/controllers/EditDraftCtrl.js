kitin.controller('EditDraftCtrl', function($scope, $controller, $location, recordService) {
  // Inherit edit base controller
  $controller('EditBaseCtrl', {$scope: $scope});


  if ($location.$$search.type && $location.$$search.aggregateLevel) {
    // New record
    recordService.libris.get(null, null, $location.$$search.type, $location.$$search.aggregateLevel)
      .then(function(data) {
        $scope.addRecordViewsToScope(data['recdata']);
        $scope.etag = data['etag'];
    });
  } else {
    // Draft
    recordService.draft.get($scope.recType + '/' + $scope.recId)
      .then(function(data) { 
        $scope.addRecordViewsToScope(data['recdata']);
        if(data['recdata']['@id']) {
          $scope.record.type = data['recdata']['@id'].split("/").slice(-2)[0];
          $scope.record.id = data['recdata']['@id'].split("/").slice(-2)[1];
        }
        $scope.etag = data['recdata']['etag'];
    });
  }


});