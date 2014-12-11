kitin.controller('CustomConfirmCtrl', function ($scope, $modalInstance, data) {

  $scope.classes = {
    yes: '',
    no: 'btn-purple'
  };
  
  var headerIcon = 'fa ';
  if (data.header) {
    $scope.header = data.header;
    headerIcon += 'fa-check';
  } else {
    $scope.classes.header = 'centered-icon';
    headerIcon += 'fa-check-circle';
  }
  $scope.classes.icon = data.icon || headerIcon;

  $scope.message = data.message || 'Är du säker?';
  $scope.yesText = data.yes || 'Ja';
  $scope.noText = data.no || 'Nej';

  $scope.no = function(){
    $modalInstance.dismiss('no');
  };
  
  $scope.yes = function(){
    $modalInstance.close('yes');
  };
});