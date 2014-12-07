kitin.controller('ModalCtrl', function($scope, $modal, $rootScope, editService) {
  var defaultModalOptions = {
    backdrop: true, // This should make modals closable on backdrop click.
    keyboard: true,
    controller: 'OpenModalCtrl',
    backdropFade: false,
    dialogFade: false,
  };

  $scope.openAuthModal = function(id) {
    id = id.replace('/resource',''); // TODO, should be the record id
    $scope.authModal = editService.getRecordTypeId(id).then(function(record) {
    var opts = angular.extend( 
                defaultModalOptions, 
                {
                  templateUrl: '/snippets/modal-edit-auth',
                  controller: 'ModalAuthCtrl',
                  windowClass: 'modal-large auth-modal',
                  resolve: {
                    recType: function() { return record.type; },
                    recId: function() { return record.id; }
                  }
                });
      $modal.open(opts);
    });
  };

  $scope.openBibModal = function(id) {
    $scope.bibModal = editService.getRecordTypeId(id).then(function(record) {
    var opts = angular.extend(
                defaultModalOptions, 
                {
                  templateUrl: '/snippets/modal-edit-bib',
                  controller: 'ModalBibCtrl',
                  windowClass: 'modal-large bib-modal',
                  resolve: {
                    recType: function() { return record.type; },
                    recId: function() { return record.id; }
                  }
                });
      $modal.open(opts);
    });
  };

  $scope.openReleaseModal = function() {
    var opts = angular.extend(
                defaultModalOptions,
                {
                  templateUrl: '/snippets/modal-release',
                  controller: 'ModalReleaseCtrl',
                  windowClass: 'modal-large release-modal'
                });
    $scope.releaseModal = $modal.open(opts);
  };

  $scope.openRemoteModal = function() {
    var opts = angular.extend(
                  defaultModalOptions,
                  {
                    templateUrl: '/snippets/modal-remote',
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
                  templateUrl: '/snippets/modal-create-new',
                  controller: 'ModalCreateNewCtrl',
                  scope: $scope,
                  windowClass: 'modal-large create-modal'
                });
    $scope.remoteModal = $modal.open(opts);
  };

  $scope.openHoldingsModal = function(event, record) {
    event.preventDefault();
    event.stopPropagation();
    var opts = angular.extend(
                defaultModalOptions,
                {
                  templateUrl: '/snippets/modal-holdings',
                  controller: 'ModalHoldingsCtrl',
                  windowClass: 'modal-large holdings-modal',
                  scope: $scope,
                  resolve: {
                    record: function() {
                      return record;
                    }
                  }
                });
    $scope.holdingsModal = $modal.open(opts);
  };

  $scope.openMARCModal = function(event, record) {
    var opts = angular.extend( 
                defaultModalOptions, 
                {
                  templateUrl: '/snippets/modal-marc',
                  controller: 'ModalMARCCtrl',
                  windowClass: 'modal-large marc-modal',
                  resolve: {
                    record: function() { return record; }
                  }
              });
    $scope.marcModal = $modal.open(opts);
  };

});
