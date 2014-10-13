kitin.controller('ModalBibCtrl', function($scope, $modalInstance, recType, recId) {
  $scope.recType = recType;
  $scope.recId = recId;
  $scope.close = function() {
    $modalInstance.close();
  };
});