kitin.controller('ModalHoldingsCtrl', function($scope, $rootScope, $modal, $modalInstance, $location, $http, recordId, editService, recordService, userData) {

  $scope.recordId = recordId;
  $scope.userData = userData;

   $rootScope.modifications.holding = {
    saved: true,
    published: true,
    deleted: false
  };

  var isNew = false;

  function getCurrentRecord() {
    var currentRecord;
    if ($rootScope.state.search.result) {
      var records = $rootScope.state.search.result.list;
      currentRecord = _.find(records, function(record) {
        return record.data.about['@id'] == recordId;
      });
    } else if ($scope.recordId) {
      // Do we need to update record in edit view? 
      // Perhaps if we want to update the fixed footer holdings button.
      // Return false for now
      currentRecord = false;
    } else {
      currentRecord = false;
    }
    return currentRecord;

  }

  function onSave(holding) {
    $rootScope.modifications.holding.saved = true;
    $rootScope.modifications.holding.published = true;
    
    var currentRecord = getCurrentRecord();
    if (currentRecord) {
      currentRecord.holdings.holding = holding;
      if (isNew) {
        currentRecord.holdings.hits += 1;
        isNew = false;
      }
    }
  }

  function onDelete(holding) {
    $rootScope.modifications.holding.saved = true;
    $rootScope.modifications.holding.published = true;
    $rootScope.modifications.holding.deleted = true;

    var currentRecord = getCurrentRecord();
    if (currentRecord) {
      currentRecord.holdings.holding = null;
      currentRecord.holdings.hits -= 1;
    }
  }

  $scope.close = function() {
    $modalInstance.close();
  };

  // HOLDING
  // 2014-10-08: To avoid confusion, all references to holding_s_ have been removed. 
  // There can only be one holding per sigel. There can, however, be multiple offers per holding.
  recordService.holding.get(recordId, userData).then(function(holding) {
    if (!holding) {
      // If no holding is found, we create a new one.
      recordService.holding.create().then(function(response) {
        isNew = true;
        holding = response;
        holding.data.about['@id'] = recordId;
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
    recordService.holding.save(holding).then(function success(holding) {
      onSave(holding);
      $scope.holding = holding;
    }, function error(status) {

    });
  };

  $scope.deleteHolding = function(holding) {
    recordService.holding.del(holding).then(function(response) {
      onDelete(holding);
      delete $scope.holding;
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
    offers.splice(index, 1);
  };

});