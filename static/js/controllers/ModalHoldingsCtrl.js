kitin.controller('ModalHoldingsCtrl', function($scope, $rootScope, $modal, $modalInstance, $location, $http, recordId, editService, recordService, userData) {

  $scope.recordId = recordId;

  $scope.modifications = {
    saved: true,
    published: true
  };

  $scope.triggerModified = function () {
    $scope.modifications.saved = false;
    $scope.modifications.published = false;
  };

  $scope.close = function() {
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
        holding._isNew = true; // TODO: don't do this when etag works
        $scope.holding = holding;
        console.log(holding);
      });
    } else {
      $scope.holding = holding;
    }
  });

  $scope.addOffer = function(holding) {
    var offers = holding.data.about.offers;
    recordService.holding.create().then(function(response) {
      var data = response;
      console.log(data);
      var offer = data.data.offers[0];
      offer.heldBy[0].notation = userData.userSigel;
      offers.push(offer);
    });
  };

  $scope.saveHolding = function(holding) {
    console.log('HOLDING: ', holding);
    recordService.holding.getEtag(holding['identifier']).then(function(response) {
      var etag = response['etag'];
      if (holding._isNew) { delete holding._isNew; }
      recordService.holding.save(holding, recordId, etag).then(function(holding) {
        $scope.holding = holding;
      });
    });
  };

  $scope.deleteHolding = function(holding) {
    var holdingId = holding['identifier']
    recordService.holding.del(holdingId).then(function(response) {
      console.log('Holding removed successfully!');
    });
  };

});