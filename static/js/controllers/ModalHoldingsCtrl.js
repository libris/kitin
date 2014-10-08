kitin.controller('ModalHoldingsCtrl', function($scope, $rootScope, $modal, $modalInstance, $location, $http, recordId, editService, recordService, userData, definitions) {

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

  console.log(definitions);

  // HOLDINGS
  recordService.holding.get(recordId, userData).then(function(response) {
    var data = response.data;
    var holdings = data.list;
    var holdingEtags = {};
    $scope.holdings = holdings;

    if (holdings <= 0) {
      console.log('No holdings found, creating new.\n');
      recordService.holding.create().then(function(response) {
        var data = response.data;
        console.log(data);
        data.data.about.holdingFor['@id'] = recordId;
        data.data.about.offers[0].heldBy[0].notation = userData.userSigel;
        $scope.holding = data;
        data._isNew = true; // TODO: don't do this when etag works
      });
    } else {
      console.log('Found', holdings.length, 'holdings, picking the first.\n', holdings);
      $scope.holding = holdings[0];
    }

  });

  $scope.addHolding = function(holdings) {
    holdings.push({shelvingControlNumber: '', location: constants['user_sigel']});
  };

  $scope.saveHolding = function(holding) {
    console.log('HOLDING: ', holding);
    recordService.holding.getEtag(holding['@id']).then(function(response) {
      var etag = response['etag'];
      if (holding._isNew) { delete holding._isNew; }
      recordService.holding.save(holding, etag).then(function(response) {
        console.log(response);
      });
    });
  };

  $scope.deleteHolding = function(holding) {
    var holdingId = holding['@id']
    recordService.holding.del(holdingId).then(function(response) {
      console.log('great success!');
      // $http.get('/record/' + recType + '/' + recordId + '/holdings').success(function(data) {
      //   $scope.holdings = patchHoldings(data.list);
      // });
    });
  };

});