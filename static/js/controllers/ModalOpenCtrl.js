kitin.controller('ModalOpenCtrl', function($scope, $modalInstance, $location) {
  $scope.close = function() {
    $location.search('m',null);
    $modalInstance.close();
  };
});