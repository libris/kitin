kitin.controller('ModalHoldingsCtrl', function($scope, $rootScope, $modal, $modalInstance, $location, $http, $timeout, record, editService, recordService, userData, utilsService, dialogs) {

  var recordId = record.about['@id'];

  $scope.record = record;
  $scope.userData = userData;
  $scope.panels = [];
  $scope.showOtherHoldings = false;
  $scope.utils = utilsService;
  $scope.classes = {};

  $rootScope.modifications.holding = {
    makeDirty: function() {
      this.saved = false;
      this.isNew = false;
    },
    saved: false,
    deleted: false,
    isNew: false
  };

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
      if ($rootScope.modifications.holding.isNew) {
        currentRecord.holdings.items += 1;
      }
    }
    $rootScope.modifications.holding.isNew = false;
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
    // Make sure user doesn't close modal without saving
    if (!$rootScope.modifications.holding.saved && !$rootScope.modifications.holding.isNew) {
      // Post is not saved, and not newly created, ask user for confirm
      var data = {
        message: 'LABEL.gui.dialogs.CLOSE_HOLDINGS',
        icon: 'fa fa-exclamation-circle'
      };
      var confirm = dialogs.create('/dialogs/confirm', 'CustomConfirmCtrl', data, { windowClass: 'kitin-dialog holdings-dialog' });
      confirm.result.then(function yes(answer) {
        $modalInstance.close();
      });
    } else {
      $modalInstance.close();
    }
  };

  // On first run, we have no holding id. Use recordService.find to get all holdings.
  recordService.holding.find(recordId, userData).then(function(response) {
    var otherHoldings = response.otherHoldings;
    if (otherHoldings) $scope.otherHoldings = otherHoldings;
    holding = response.userHoldings;
    if (!holding) {
      // If no holding is found, we create a new one.
      recordService.holding.create().then(function(response) {
        $rootScope.modifications.holding.isNew = true;
        holding = response;
        holding.about.holdingFor = {
          '@id': recordId
        };
        holding.about.heldBy.notation = holding.about.offers[0].heldBy[0].notation = userData.userSigel;
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
      $scope.classes.saveStatus = 'success';
    }, function error(status) {
      $scope.classes.saveStatus = 'error';
    }).finally(function() {
      var element = angular.element('#save-hld');
      if (element.length) utilsService.showPopup(element).then(function() {
        //console.log('Popup should now be hidden');
      });
    });
  };

  $scope.deleteHolding = function(holding) {
    var data = {
      message: 'LABEL.gui.dialogs.REMOVE_HOLDING',
      yes: 'Ja, radera beståndet',
      no: 'Nej, avbryt',
      icon: 'fa fa-exclamation-circle'
    };
    var confirm = dialogs.create('/dialogs/confirm', 'CustomConfirmCtrl', data, { windowClass: 'kitin-dialog holdings-dialog' });
    confirm.result.then(function yes(answer) {
      recordService.holding.del(holding).then(function sucess(response) {
        onDelete(holding);
        delete $scope.holding;
      }, function error(status) {
        $scope.classes.deleteStatus = 'error';
        var element = angular.element('#delete-hld');
        if (element.length) utilsService.showPopup(element).then(function() {
          //console.log('Popup should now be hidden');
        });
      });
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

  $scope.addPrimaryTopicOf = function(holding) {
    // Get offers from existing holding
    var eDocuments = holding.about.isPrimaryTopicOf;
    recordService.holding.create().then(function(response) {
      var eDocument = response.about.isPrimaryTopicOf[0];
      eDocuments.push(eDocument);
    });
  };

  $scope.deletePrimaryTopicOf = function(holding, index) {
    var eDocuments = holding.about.isPrimaryTopicOf;
    eDocuments.splice(index, 1);
  };

  $scope.addWorkExample = function(holding, type) {
    // Get offers from existing holding
    var workExamples = holding.about.workExampleByType[type];
    recordService.holding.create(type).then(function(response) {
      var workExample = response.about.workExampleByType[type][0];
      workExamples.push(workExample);
    });
  };

  $scope.deleteWorkExample = function(holding, index, type) {
    var workExample = holding.about.workExampleByType[type];
    workExample.splice(index, 1);
  };

});