kitin.controller('IndexCtrl', function($scope, $http, dataService) {
  document.body.className = 'index';

  dataService.drafts.get().then(function(data) {
    $scope.drafts = data.drafts;
  });

  $scope['delete'] = function(type, id) {
    dataService.draft.delete(type, id).then(function(data) {
      $scope.drafts = data.drafts;
    });
  };
});