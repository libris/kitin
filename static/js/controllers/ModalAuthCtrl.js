kitin.controller('ModalAuthCtrl', function($scope, $modalInstance, recType, recId) {
  $scope.getRecType = function() {
    return recType;
  };
  $scope.getRecId = function() {
    return recId;
  };
  $scope.close = function() {
    $modalInstance.close();
  };
});