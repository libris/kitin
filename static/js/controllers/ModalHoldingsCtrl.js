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
        $scope.holding = data.data;
        data._isNew = true; // TODO: don't do this when etag works
      });
    } else {
      console.log('Found', holdings.length, 'holdings, picking the first.\n', holdings);
      $scope.holding = holdings[0].data;
    }

  });

  $scope.addHolding = function(holdings) {
    holdings.push({shelvingControlNumber: '', location: constants['user_sigel']});
  };

  $scope.saveHolding = function(holding) {
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