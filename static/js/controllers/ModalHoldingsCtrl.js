kitin.controller('ModalHoldingsCtrl', function($scope, $rootScope, $modal, $modalInstance, $location, $http, recordId, editService, recordService, userData) {

  $scope.recordId = recordId;

  $scope.modifications = {
    saved: true,
    published: true
  };

  var isNew = false;

  // Went back to systemMessages. Better?
  // $scope.alerts = [];
  // $scope.closeAlert = function(index) {
  //   $scope.alerts.splice(index, 1);
  // };

  function getCurrentRecord() {
    var records = $rootScope.state.search.result.list;
    var currentRecord = _.find(records, function(record) {
      return record.data.about['@id'] == recordId;
    });

    return currentRecord;
  }

  // We are using these functions in several places,
  // maybe create a service?
  function onSave(holding) {
    $scope.modifications.saved = true;
    $scope.modifications.published = true;
    
    var currentRecord = getCurrentRecord();
    currentRecord.holdings.holding = holding;
    if (isNew) {
      currentRecord.holdings.hits += 1;
      isNew = false;
    }
  }


  // We are using these functions in several places,
  // maybe create a service?
  function onDelete(holding) {
    $scope.modifications.saved = true;
    $scope.modifications.published = true;

    var currentRecord = getCurrentRecord();
    currentRecord.holdings.holding = null;
    currentRecord.holdings.hits -= 1;
  }


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