kitin.controller('ModalCtrl', function($scope, $modal) {
  var defaultModalOptions = {
    backdrop: 'static', // Shows backdrop but doesn't close dialog on click outside.
    keyboard: true,
    controller: 'OpenModalCtrl',
    backdropFade: true,
    dialogFade: false,

  };

  $scope.openAuthModal = function() {
    var opts = angular.extend(
                defaultModalOptions,
                {
                  templateUrl: 'modal-edit-auth',
                  controller: 'ModalAuthCtrl',
                  windowClass: 'modal-large auth-modal'
                });
    $scope.authModal = $modal.open(opts);
  };

  $scope.openRemoteModal = function() {
    var opts = angular.extend(
                  defaultModalOptions,
                  {
                  templateUrl: 'modal-remote',
                  controller: 'ModalRemoteCtrl',
                  scope: $scope,
                  windowClass: 'modal-large remote-modal'
                  });
    $scope.remoteModal = $modal.open(opts);
  };

});