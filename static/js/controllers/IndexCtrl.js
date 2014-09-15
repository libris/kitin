kitin.controller('IndexCtrl', function($scope, $http, recordService) {
  document.body.className = 'index';

  recordService.drafts.get().then(function(data) {
    $scope.drafts = data.drafts;
  });

  $scope['delete'] = function(type, id) {
    recordService.draft.delete(type, id).then(function(data) {
      $scope.drafts = data.drafts;
    });
  };
});