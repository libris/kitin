kitin.controller('ModalHoldingsCtrl', function($scope, $rootScope, $modal, $modalInstance, $location, $http, recordId, editService, recordService, userData) {

  $scope.recordId = recordId;

  $scope.modifications = {
    saved: true,
    published: true
  };

  $scope.alerts = [];
  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  // We are using these functions in several places,
  // maybe create a service?
  function onSaveState() {
    $scope.modifications.saved = true;
    $scope.modifications.published = true;
  }

  $scope.triggerModified = function () {
    $scope.modifications.saved = false;
    $scope.modifications.published = false;
  };

  $scope.close = function() {
    // On close (or on save?), update holding status in search results.
    $modalInstance.close();
  };

  // HOLDING
  // 2014-10-08: To avoid confusion, all references to holding_s_ have been removed. 
  // There can only be one holding per sigel. There can, however, be multiple offers per holding.
  // If no holding is found, we create a new one.
  recordService.holding.get(recordId, userData).then(function(holding) {
    if (!holding) {
      console.log('No holdings found, creating new.\n');
      recordService.holding.create().then(function(response) {
        holding = response;
        holding.data.about.holdingFor = {
          '@id': recordId
        };
        holding.data.about.offers[0].heldBy[0].notation = userData.userSigel;
        $scope.holding = holding;
      });
    } else {
      $scope.holding = holding;
    }
  });

  $scope.saveHolding = function(holding) {
    console.log('ABOUT TO SAVE HOLDING: ', holding);
    recordService.holding.save(holding).then(function success(holding) {
      console.log('SAVED HOLDING, ETAG SHOULD HAVE CHANGED: ', holding);
      $scope.holding = holding;
    }, function error(status) {
      var alert = {
        type: 'error',
        msg: 'Det gick inte att spara.'
      };
      switch(status) {
        case 0:
          alert.msg += ' Kontakta en administratör.';
          break;
        case 412:
          alert.msg += ' Någon har redigerat beståndet sedan du sparade senast.';
          break;
        default:
          alert.msg += ' Kontrollera din internetanslutning.';
      }
      $scope.alerts.push(alert);
    });
  };

  $scope.deleteHolding = function(holding) {
    var holdingId = holding.data['@id'];
    recordService.holding.del(holdingId).then(function(response) {
      console.log(response);
      delete $scope.holding;
      console.log('Holding removed successfully!');
    });
  };

  $scope.addOffer = function(holding) {
    var offers = holding.data.about.offers;
    recordService.holding.create().then(function(response) {
      var data = response;
      var offer = data.data.about.offers[0];
      offer.heldBy[0].notation = userData.userSigel;
      offers.push(offer);
    });
  };

  $scope.deleteOffer = function(holding, index) {
    var offers = holding.data.about.offers;
    console.log(offers, index);
    offers.splice(index, 1);
    console.log(offers);
    console.log('Offer removed successfully, form should now be considered dirty!');
  };

});