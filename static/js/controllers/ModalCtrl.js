kitin.controller('ModalCtrl', function($scope, $modal, $rootScope, editService) {
  var defaultModalOptions = {
    // Disallow .dismiss() on backdrop click and ESC-keydown.
    // AppCtrl will handle this and call .close() on the top modal instead (makes it possible to check dirty flags)
    backdrop: 'static', // Should be static
    keyboard: false,    // Should be false
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

  $scope.openBibViewModal = function(record, recType) {
    var opts = angular.extend( 
                defaultModalOptions, 
                {
                  templateUrl: '/snippets/modal-bibview',
                  controller: 'ModalBibViewCtrl',
                  windowClass: 'modal-large bib-modal',
                  resolve: {
                    record: function() { return record; },
                    recType: function() { return recType; }
                  }
              });
    $modal.open(opts);
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

  $scope.openCookiesModal = function() {
    var opts = angular.extend(
                defaultModalOptions,
                {
                  templateUrl: '/snippets/modal-cookies',
                  controller: 'ModalCookiesCtrl',
                  windowClass: 'modal-large cookies-modal'
                });
    $scope.releaseModal = $modal.open(opts);
  };

  $scope.openContactModal = function() {
    var opts = angular.extend(
                defaultModalOptions,
                {
                  templateUrl: '/snippets/modal-contact',
                  controller: 'ModalContactCtrl',
                  windowClass: 'modal-large contact-modal'
                });
    $scope.releaseModal = $modal.open(opts);
  };

  $scope.openRemoteModal = function() {
    var opts = angular.extend(
                  defaultModalOptions,
                  {
                    templateUrl: '/snippets/modal-remote',
                    controller: 'ModalRemoteCtrl',
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

  $scope.openJSONLDModal = function(event, record) {
    var opts = angular.extend( 
                defaultModalOptions, 
                {
                  templateUrl: '/snippets/modal-jsonld',
                  controller: 'ModalJSONLDCtrl',
                  windowClass: 'modal-large jsonld-modal',
                  resolve: {
                    record: function() { return record; }
                  }
              });
    $scope.jsonldModal = $modal.open(opts);
  };

});
