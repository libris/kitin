kitin.controller('ModalHoldingsCtrl', function($scope, $modalInstance, $location) {
  console.log('In ModalHoldingsCtrl');
  $scope.close = function() {
    console.log('Pressed close');
    $location.search('m',null);
    $modalInstance.close();
  };
});