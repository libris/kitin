kitin.controller('EditCtrl', function($scope, $modal, $http, $routeParams, $timeout, $rootScope, $location, $anchorScroll, recordService, definitions, userData, editService, utilsService) {

  $scope.classes = {};

  $rootScope.modifications.bib = {
    saved:     ($scope.recType === editService.RECORD_TYPES.REMOTE || $scope.record.new) ? false : true, 
    published: ($scope.recType === editService.RECORD_TYPES.REMOTE || $scope.record.draft || $scope.record.new) ? false : true
  };

  // Some actions trigger location change, watch for these and give feedback accordingly
  var queryStrings = $location.search();
  if (queryStrings.saved || queryStrings.published) {
    var element;
    // TODO: Ugly, ugly timeout. Hopefully our buttons will be present at the end of it.
    $timeout(function() {
      if (queryStrings.saved) {
        $scope.classes.saveStatus = 'success';
        element = angular.element('#save-draft');
      } else if (queryStrings.published) {
        $scope.classes.publishStatus = 'success';
        element = angular.element('#publish-bib');
      }
      if (element.length) utilsService.showPopup(element).then(function() {
        $location.search({
          published: null,
          saved: null
        }); 
      });
    }, 1000);
  }

  function onSaveState() {
    $rootScope.modifications.bib.saved = true;
    $rootScope.modifications.bib.lastSaved = new Date();
  }
  
  function onPublishState() {
    $rootScope.modifications.bib.saved = true;
    $rootScope.modifications.bib.published = true;
    $rootScope.modifications.bib.lastPublished = new Date();
  }

  // Make sure the edit view holdings button stay updated
  function updateHolding() {
    var recordId = $scope.record.about['@id'];
    if(!$scope.record.new) {
      recordService.holding.find(recordId, userData, true).then(function success(holdings) {
        if (holdings.userHoldings) {
          $scope.hasHolding = true;  
        } else {
          $scope.hasHolding = false;
        }
      }, function error(status) {
        $scope.hasHolding = false;
      });
    } else {
      $scope.hasHolding = false;
    }
  }
  // Set a watcher on holding's dirty flag
  $scope.$watchCollection('modifications.holding',
    function(newValue, oldValue) {
      if (newValue.saved !== oldValue.saved && newValue.saved) {
        // Holding state _changed_ to 'saved'
        $scope.hasHolding = true;
      } else if (newValue.deleted) {
        // Holding deleted
        $scope.hasHolding = false;
      }
    }
  );
  // Set initial value for $scope.hasHolding
  updateHolding();

  $scope.isLinked = function (thing) {
    if(!thing) { return; }
    var id = thing['@id'] || (thing['describedBy'] ? thing['describedBy']['@id'] : null);
    return id && id.substring(0, 2) !== '_:';
  };

  $scope.isAuth = function(obj) {
    return (obj && !_.isEmpty(obj['@id']) && obj['@id'].substr(0,6) === '/auth/');
  };

  $scope.isInScheme = function(obj) {
    return (obj && !_.isEmpty(obj['inScheme']));
  };

  $scope.lastSavedLabel = function (tplt) {
    if (!$rootScope.modifications.bib.lastSaved)
      return "";
    return tplt.replace(/%s/, $rootScope.modifications.bib.lastSaved.toLocaleString());
  };

  $scope.lastPublishedLabel = function (tplt) {
    if (!$rootScope.modifications.bib.lastPublished)
      return "";
    return tplt.replace(/%s/, $rootScope.modifications.bib.lastPublished.toLocaleString());
  };

  $scope.promptConfirmDelete = function($event, type, id) {
    $scope.confirmDeleteDraft = {
      execute: function() {
        recordService.draft.delete(type, id).then(function(data) {
          $scope.confirmDeleteDraft = null;
        });
      },
      abort: function() {
        $scope.confirmDeleteDraft = null;
      }
    };
    $timeout(function() {
      openPrompt($event, "#confirmDeleteDraftDialog");
    });
  };

  $scope.publish = function() {
    var parsedRecType = $scope.recType === editService.RECORD_TYPES.REMOTE ? editService.RECORD_TYPES.BIB : $scope.recType;
    if(!$scope.record.new) {

      var ifMatchHeader = '';
      if($scope.etag) {
        ifMatchHeader = $scope.etag.replace(/["']/g, "");
      } else {
        console.warn('No ETag for this record. Where is it?');
      }

      recordService.libris.save(parsedRecType, $scope.recId, $scope.record, ifMatchHeader).then(function success(data) {
        if($scope.record.draft) {
          // If draft load libris record
          recordService.draft.delete(parsedRecType, $scope.recId);
          // Redirect with flag so we can show feedback on landing
          $location.url('/edit/libris' + data['recdata']['@id'] + '?published');
        } else {
          // Libris record, just update record
          $scope.addRecordViewsToScope(data['recdata']);
          $scope.etag = data['etag'];
          onPublishState();
          $scope.classes.publishStatus = 'success';
        }
      }, function error(status) {
        $scope.classes.publishStatus = 'error';
      }).finally(function() {
        var element = angular.element('#publish-bib');
        if (element.length) utilsService.showPopup(element).then(function() {
          // This would be a good place to do some cleanup if needed
          //console.log('Popup should now be hidden');
        });
      });
    } else {
      recordService.libris.create(parsedRecType, $scope.record).then(function(data) {
        if($scope.draft) {
          recordService.draft.delete(parsedRecType, $scope.recId);
        }
        $location.url('/edit/libris' + data['recdata']['@id'] + '?published');
      });
    }
  };

  $scope.saveDraft = function() {
    var parsedRecType = $scope.recType === editService.RECORD_TYPES.REMOTE ? editService.RECORD_TYPES.BIB : $scope.recType;
    if(!$scope.record.draft) {
      recordService.draft.create(parsedRecType, $scope.recId, $scope.record).then(function(data) {
        $location.url('/edit/draft' + data['recdata']['@id'] + '?saved');
      });
    } else {
      recordService.draft.save(parsedRecType, $scope.recId, $scope.record, $scope.etag).then(function success(data) {
        $scope.addRecordViewsToScope(data['recdata']);
        $scope.etag = data['etag'];
        onSaveState();
        $scope.classes.saveStatus = 'success';
      }, function failure (status) {

      });
    }
  };

  $scope.newObject = function(subj, rel, type) {
    var obj = subj[rel] = editService.createObject(type);
  };

  $scope.addObject = function(subj, rel, type, target, subCollection) {
    var isDefined = function(collection) {
      return typeof collection !== 'undefined' && collection !== 'undefined';
    };

    var collection = subj[rel];
    if (!isDefined(collection)) {
      collection = subj[rel] = isDefined(subCollection) ? {} : [];
    }
    //!TODO clean up, subCollections is needed when hasFormat and identifier is undefined
    if(isDefined(subCollection)) {
      collection = subj[rel][subCollection];
      if(!isDefined(collection)) {
        collection = subj[rel][subCollection] = [];
      }
    }
    var obj = editService.createObject(type);
    collection.push(obj);
    // Focus on added row
    if (target) {
      var $dataTable = angular.element('[data-ng-target='+target+']');
      $timeout(function() {
        $dataTable.find('tbody tr:last input:first').focus();
      });
    }
  };

  $scope.removeObject = function(subj, rel, index) {
    var obj = _.isArray(subj) && !rel ? subj : subj[rel];
    var removed = null;
    if (_.isArray(obj)) {
      removed = obj.splice(index,1)[0];
    } else {
      removed = subj[rel];
      subj[rel] = null;
    }
    if (typeof subj.onRemove === 'function') {
      subj.onRemove(rel, removed, index);
    }
    //$scope.triggerModified();
    $scope.$emit('changed');
  };

});
