kitin.controller('EditCtrl', function($scope, $modal, $http, $routeParams, $timeout, $rootScope, $location, $anchorScroll, recordService, definitions, userData, editService, searchService, utilsService) {

  $scope.classes = {};

  // Some actions trigger location change, watch for these and give feedback accordingly
  var queryStrings = $location.search();

  if (queryStrings.imported) {
    // Since the routing to bib form puts searchType to "bib"
    // we need to put it back to "remote" if it's an imported record.
    searchService.setSearchType("remote");
  }

  if (queryStrings.saved || queryStrings.published || queryStrings.imported) {
    var element;
    // TODO: Avoid this timeout if possible:
    // Ugly, ugly timeout. Hopefully our buttons will be present at the end of it.
    $timeout(function() {
      if (queryStrings.saved) {
        if(queryStrings.saved === 'error') {
          $scope.classes.saveStatus = 'error';
        } else {
          $scope.classes.saveStatus = 'success';
          $rootScope.modifications.bib.onSave();
        }
        element = angular.element('#message-container .save-messages');
      } else if (queryStrings.published) {
        $scope.classes.publishStatus = queryStrings.published == 'error' ? 'error' : 'success';
        element = angular.element('#message-container .publish-messages');
      } else if (queryStrings.imported) {
        $rootScope.modifications.bib.imported = true;
        $scope.classes.importStatus = queryStrings.imported == 'error' ? 'error' : 'success';
        element = angular.element('#message-container .import-messages');
      }

      if (element.length) utilsService.showPopup(element).then(function() {
        // Remove querystring when popover disappears
        $location.search({
          published: null,
          saved: null,
          imported: null
        }); 
      });
    }, 1000);
  }

  // Make sure the edit view holdings button stay updated
  function updateHolding() {
    var recordId = $scope.record['@id'] || $scope.record.about['@id'];
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
          $rootScope.modifications.bib.onSave(); // Faking save so that we're allowed to leave page without prompt
          $location.url('/edit/libris' + data['recdata']['@id'] + '?published');
        } else {
          // Libris record, just update record
          $scope.addRecordViewsToScope(data['recdata']);
          $scope.etag = data['etag'];
          $rootScope.modifications.bib.onPublish();
          $scope.classes.publishStatus = 'success';
        }
      }, function error(status) {
        $scope.classes.publishStatus = 'error';
      }).finally(function() {
        var element = angular.element('#message-container .publish-messages');
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
        $rootScope.modifications.bib.onSave();
        $location.url('/edit/draft' + data['recdata']['@id'] + '?saved');
      });
    } else {
      recordService.draft.save(parsedRecType, $scope.recId, $scope.record, $scope.etag).then(function success(data) {
        $scope.addRecordViewsToScope(data['recdata']);
        $scope.etag = data['etag'];
        $rootScope.modifications.bib.onSave();
        $scope.classes.saveStatus = 'success';
      }, function failure (status) {
        $rootScope.modifications.bib.saved = false;
        $scope.classes.saveStatus = 'error';
      });
      var element = angular.element('#message-container .save-messages');
      if (element.length) utilsService.showPopup(element);
    }
  };

});
