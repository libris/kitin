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
                  controller: 'ModalOpenCtrl',
                  windowClass: 'modal-large auth-modal'
                });
    $scope.authModal = $modal.open(opts);
  };

  $scope.openReleaseModal = function() {
    var opts = angular.extend(
                defaultModalOptions,
                {
                  templateUrl: 'modal-release',
                  controller: 'ModalOpenCtrl',
                  windowClass: 'modal-large release-modal'
                });
    $scope.releaseModal = $modal.open(opts);
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

  $scope.openCreateNewModal = function() {
    var opts = angular.extend(
                  defaultModalOptions,
                  {
                  templateUrl: 'modal-create-new',
                  controller: 'ModalCreateNewCtrl',
                  scope: $scope,
                  windowClass: 'modal-large create-modal'
                  });
    $scope.remoteModal = $modal.open(opts);
  };

  $scope.openHoldingsModal = function(event, holdings) {
    event.preventDefault();
    event.stopPropagation();
    var opts = angular.extend(
                  defaultModalOptions,
                  {
                  templateUrl: 'modal-holdings',
                  controller: 'ModalHoldingsCtrl',
                  windowClass: 'modal-large holdings-modal'
                  });
    $scope.holdingsModal = $modal.open(opts);
  };

});
