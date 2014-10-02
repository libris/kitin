kitin.controller('ModalCtrl', function($scope, $modal, $rootScope, dataTransport) {
  var defaultModalOptions = {
    backdrop: 'static', // Shows backdrop but doesn't close dialog on click outside.
    keyboard: true,
    controller: 'OpenModalCtrl',
    backdropFade: false,
    dialogFade: false,
  };

  $scope.openAuthModal = function(id) {
    var params = id.split('/').splice(1);
    var recType = params[1];
    var recId = params[2];
    var opts = angular.extend(
                defaultModalOptions,
                {
                  templateUrl: 'modal-edit-auth',
                  controller: 'ModalAuthCtrl',
                  windowClass: 'modal-large auth-modal',
                  resolve: {
                    recType: function() { return recType; },
                    recId: function() { return recId; }
                  }
                });
    $scope.authModal = $modal.open(opts);
  };

  $scope.openReleaseModal = function() {
    var opts = angular.extend(
                defaultModalOptions,
                {
                  templateUrl: 'modal-release',
                  controller: 'ModalReleaseCtrl',
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

});
