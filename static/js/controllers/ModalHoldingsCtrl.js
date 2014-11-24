kitin.controller('ModalHoldingsCtrl', function($scope, $rootScope, $modal, $modalInstance, $location, $http, recordId, editService, recordService, userData) {

  $scope.recordId = recordId;
  $scope.userData = userData;
  $scope.panels = [];
  $scope.showOtherHoldings = false;

  $rootScope.modifications.holding = {
    saved: false,
    deleted: false
  };

  var isNew = false;

  function getCurrentRecord() {
    // In search view, we need to know which record the user is editing holdings for.
    // If we're not in search view, return false
    if ($rootScope.state.search.result && $rootScope.state.search.result.items) {
      var records = $rootScope.state.search.result.items;
      return _.find(records, function(record) {
        return record.about['@id'] == recordId;
      });
    } else {
      return false;
    }
  }

  function onSave(holding) {    
    var currentRecord = getCurrentRecord();
    if (currentRecord) {
      currentRecord.holdings.holding = holding;
      if (isNew) {
        currentRecord.holdings.items += 1;
        isNew = false;
      }
    }
    $rootScope.modifications.holding.saved = true;
  }

  function onDelete(holding) {
    var currentRecord = getCurrentRecord();
    if (currentRecord) {
      currentRecord.holdings.holding = null;
      currentRecord.holdings.items -= 1;
    }
    $rootScope.modifications.holding.saved = true;
    $rootScope.modifications.holding.deleted = true;
  }

  $scope.close = function() {
    $modalInstance.close();
  };

  // On first run, we have no holding id. Use find to get holding
  recordService.holding.find(recordId, userData).then(function(response) {
    var allHoldings = response.allHoldings;
    if (allHoldings) $scope.allHoldings = allHoldings;
    holding = response.holding;
    if (!holding) {
      // If no holding is found, we create a new one.
      recordService.holding.create().then(function(response) {
        isNew = true;
        holding = response;
        holding.about.holdingFor = {
          '@id': recordId
        };
        holding.about.heldBy.notation = holding.about.offers[0].heldBy[0].notation = userData.userSigel;
        console.log(holding);
        $scope.holding = holding;
      });
    } else {
      $scope.holding = holding;
      $rootScope.modifications.holding.saved = true;
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
    recordService.holding.del(holding).then(function sucess(response) {
      onDelete(holding);
      delete $scope.holding;
    }, function error(status) {

    });
  };

  $scope.addOffer = function(holding) {
    // Get offers from existing holding
    var offers = holding.about.offers;
    // Create a new holding temporarily to get an empty offer
    recordService.holding.create().then(function(response) {
      var offer = response.about.offers[0];
      // Set hidden values and push to offers
      offer.heldBy[0].notation = userData.userSigel;
      offers.push(offer);
    });
  };

  $scope.deleteOffer = function(holding, index) {
    var offers = holding.about.offers;
    offers.splice(index, 1);
  };

});