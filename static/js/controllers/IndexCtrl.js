kitin.controller('IndexCtrl', function($scope, $http, recordService, editService) {
  document.body.className = 'index';

  recordService.drafts.get().then(function(data) {
    console.log(data);
    $scope.drafts = data.drafts;
  });

  $scope['delete'] = function(id) {
    editService.getRecordTypeId(id).then(function(recTypeId) {
      recordService.draft.delete(recTypeId.type, recTypeId.id).then(function(data) {
        $scope.drafts = data.drafts;
      });
    });
  };
});