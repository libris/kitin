kitin.controller('ModalHoldingsCtrl', function($scope, $rootScope, $modal, $modalInstance, $location, $http, $timeout, $q, record, editService, recordService, userData, utilsService, dialogs) {

  var recordId = record.about['@id'];

  $scope.record = record;
  $scope.userData = userData;
  $scope.panels = [];
  $scope.showOtherHoldings = false;
  $scope.otherHoldingsPredicate = 'about.heldBy.notation';
  $scope.utils = utilsService;
  $scope.classes = {};

  $rootScope.modifications.holding = {
    makeDirty: function() {
      this.saved = false;
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

  function getClassificationsFromOtherHoldings(holdingsList) {
    var classifications = [];
    var rankedClassifications = [];
    if(typeof holdingsList !== 'undefined') {
      for(var i = 0; i < holdingsList.length; i++) {
        var offers = holdingsList[i].about.offers;
        for(var x = 0; x < offers.length;x++) {
          if(offers[x].classificationPart)
            classifications.push(offers[x].classificationPart);
        }
      }
    }
    uniques = _.uniq(classifications);
    for(var u = 0; u < uniques.length; u++ ){
      rankedClassifications.push({ 'classification' : uniques[u], 'occurences' : utilsService.findOccurrences(classifications, uniques[u]) });
    }
    rankedClassifications = rankedClassifications.sort(function(a, b){
      return b.occurences - a.occurences;
    });
    return rankedClassifications;
  }

  $scope.getClassificationsFromBibPost = function (array) {
    /*
      Get classifications from bib post
      Returns array of matching classifications as objects
      Will try to match strings in array against scheme notation of classifications in about.classification
      Possible to match against different endings using * wildcard
    */
    var classificationsFrom = $scope.record.about.classification;
    if(typeof classificationsFrom === 'undefined') return;
    var classificationsTo = [];
    for(var i = 0; i < array.length;i++) {
      var schemeKey = array[i].toLowerCase();
      for(var y = 0; y < classificationsFrom.length;y++) {
        var match = false;
        var schemeNotation;
        if(typeof classificationsFrom[y].inScheme !== 'undefined') { // TODO: Do we need to handle classifications without scheme?
          schemeNotation = classificationsFrom[y].inScheme.notation.toLowerCase();
          var asteriskIndex = schemeKey.indexOf('*');
          if(asteriskIndex !== -1) {
            var tmpNotation = schemeNotation.substr(0, asteriskIndex);
            var tmpKey = schemeKey.substr(0, asteriskIndex);
            if(tmpNotation === tmpKey)
              match = true;
          } else if (schemeNotation === schemeKey)
            match = true;
          if(match) {
            classificationsTo.push(classificationsFrom[y]);
          }
        }
      }
    }
    classificationsTo = _.uniq(classificationsTo);
    return classificationsTo;
  };

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

  $scope.close = function(callback) {
    var deferred = $q.defer();
    
    // Make sure user doesn't close modal without saving
    if (!$rootScope.modifications.holding.saved) {
      // Post is not saved, and not newly created, ask user for confirm
      var data = {
        message: 'LABEL.gui.dialogs.CLOSE_HOLDINGS',
        icon: 'fa fa-exclamation-circle'
      };
      var confirm = dialogs.create('/dialogs/confirm', 'CustomConfirmCtrl', data, { windowClass: 'kitin-dialog holdings-dialog' });
      confirm.result.then(function yes(answer) {
        $modalInstance.close();
        $rootScope.modifications.holding = {};
        deferred.resolve();
      }, function no(answer) {
        deferred.reject();
      });
    } else {
      $modalInstance.close();
      $rootScope.modifications.holding = {};
      deferred.resolve();
    }
    return deferred.promise;
  };

  // On first run, we have no holding id. Use recordService.find to get all holdings.
  recordService.holding.find(recordId, userData).then(function(response) {
    var otherHoldings = response.otherHoldings;
    if (otherHoldings) {
      $scope.otherHoldings = otherHoldings;
      $scope.otherClassifications = getClassificationsFromOtherHoldings(otherHoldings);
    }
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
    $scope.bibClassifications = $scope.getClassificationsFromBibPost(['kssb*', 'DDC', 'UDC']);
  });

  $scope.saveHolding = function(holding) {
    recordService.holding.save(holding).then(function success(holding) {
      onSave(holding);
      $scope.holding = holding;
      $scope.classes.saveStatus = 'success';
    }, function error(status) {
      $scope.classes.saveStatus = 'error';
    }).finally(function() {
      var element = angular.element('#holdings-message-container .save-messages');
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
        var element = angular.element('#holdings-message-container .delete-messages');
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
      $rootScope.modifications.holding.makeDirty();
    });
  };

  $scope.deleteOffer = function(holding, index) {
    var offers = holding.about.offers;
    offers.splice(index, 1);
    $rootScope.modifications.holding.makeDirty();
  };

  $scope.addPrimaryTopicOf = function(holding) {
    var eDocuments = holding.about.isPrimaryTopicOf;
    recordService.holding.create().then(function(response) {
      var eDocument = response.about.isPrimaryTopicOf[0];
      eDocuments.push(eDocument);
      $rootScope.modifications.holding.makeDirty();
    });
  };

  $scope.deletePrimaryTopicOf = function(holding, index) {
    var eDocuments = holding.about.isPrimaryTopicOf;
    eDocuments.splice(index, 1);
    $rootScope.modifications.holding.makeDirty();
  };

  $scope.addWorkExample = function(holding, type) {
    // Get offers from existing holding
    var workExamples = holding.about.workExampleByType[type];
    recordService.holding.create(type).then(function(response) {
      var workExample = response.about.workExampleByType[type][0];
      workExamples.push(workExample);
      $rootScope.modifications.holding.makeDirty();
    });
  };

  $scope.deleteWorkExample = function(holding, type, index) {
    var workExample = holding.about.workExampleByType[type];
    workExample.splice(index, 1);
    $rootScope.modifications.holding.makeDirty();
  };

});