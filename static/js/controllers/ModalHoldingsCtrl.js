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
    var items = data.list;
    var holdingEtags = {};
    $scope.holdings = items;
    var myHoldings = _.filter(items, function(i) {
      var offers = i.data.about.offers;
      for ( var j = 0; j < offers.length; j++ ) {
        var heldBy = offers[j].heldBy;
        for ( var k = 0; k < heldBy.length; k++ ) {
          if ( heldBy[k].notation == userData.userSigel || heldBy[k].notation == 'KVIN' ) return true; // TODO: Don't compare to U, that's just for dev purposes
        }
      }
    });
    
    if (myHoldings <= 0) {
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
    // TODO: Remove this by end of week. 
    // items.forEach(function (item) {
    //   if (item.identifier) {
    //     recordService.holding.getEtag(item.identifier).then(function(response) {
    //       console.log(response);
    //       holdingEtags[data['@id']] = response['etag'];
    //     });
    //   }
    // });
    // $scope.holdingEtags = holdingEtags;
  });

  $scope.addHolding = function(holdings) {
    holdings.push({shelvingControlNumber: '', location: constants['user_sigel']});
  };

  $scope.saveHolding = function(holding) {
    console.log('HOLDING: ', holding);
    recordService.holding.getEtag(holding['@id']).then(function(response) {
      var etag = response['etag'];
      //holding['annotates'] = { '@id': '/' + recType + '/' + recordId };
      // TODO: only use etag (but it's not present yet..)
      if(!holding._isNew && (etag || holding.location === $scope.userSigel)) {
        $http.put('/holding/' + holding['@id'].split('/').slice(-2)[1], holding, {headers: {'If-match':etag}}).success(function(data, status, headers) {
          $scope.holdingEtags[data['@id']] = headers('etag');
        }).error(function(data, status, headers) {
          console.log('ohh crap!');
        });
      } else {
        if (holding._isNew) { delete holding._isNew; }
        console.log('we wants to post a new holding');
        $http.post('/holding', holding).success(function(data, status, headers) {
          $scope.holdingEtags[data['@id']] = headers('etag');
        }).error(function(data, status, headers) {
          console.log('ohh crap!');
        });
      }
    });
  };

  $scope.deleteHolding = function(holdingId) {
    $http['delete']('/holding/' + holdingId).success(function(data, success) {
      console.log('great success!');
      $http.get('/record/' + recType + '/' + recordId + '/holdings').success(function(data) {
        $scope.holdings = patchHoldings(data.list);
      });
    }).error(function() {
      console.log('oh crap!');
    });
  };

});