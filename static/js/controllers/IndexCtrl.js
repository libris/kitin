kitin.controller('IndexCtrl', function($scope, $http, recordService, editService, utilsService) {
  document.body.className = 'index';
  $scope.utils = utilsService;

  recordService.drafts.get().then(function(data) {
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