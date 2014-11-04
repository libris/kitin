kitin.controller('EditCtrl', function($scope, $modal, $http, $routeParams, $timeout, $rootScope, $location, $anchorScroll, recordService, definitions, userData, editService) {




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

  $rootScope.modifications.bib = {
    saved:     $scope.recType === editService.RECORD_TYPES.REMOTE ? false : true, 
    published: $scope.recType === editService.RECORD_TYPES.REMOTE ? false : $scope.record.draft ? false : true
  };

  function onSaveState() {
    $rootScope.modifications.bib.saved = true;
    $rootScope.modifications.bib.lastSaved = new Date();
  }
  function onPublishState() {
    $rootScope.modifications.bib.saved = true;
    $rootScope.modifications.bib.published = true;
    $rootScope.modifications.bib.lastPublished = new Date();
  }

  $scope.modifiedClasses = function () {
    var classes = [], mods = $rootScope.modifications.bib;
    if (mods.saved) classes.push('saved');
    if (mods.published) classes.push('published');
    return classes;
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

      recordService.libris.save(parsedRecType, $scope.recId, $scope.record, ifMatchHeader).then(function(data) {

        if($scope.record.draft) {
          // If draft load libris record
          recordService.draft.delete(parsedRecType, $scope.recId);
          $location.url('/edit/libris' + data['recdata']['@id']);
        } else {
          // Libris rexord, just update record
          $scope.addRecordViewsToScope(data['recdata']);
          $scope.etag = data['etag'];
          onPublishState();
        }
      });
    } else {
      recordService.libris.create(parsedRecType, $scope.record).then(function(data) {
        if($scope.draft) {
          recordService.draft.delete(parsedRecType, $scope.recId);
        }
        $location.url('/edit/libris' + data['recdata']['@id']);
      });
    }
  };
  

  $scope.saveDraft = function() {
    var parsedRecType = $scope.recType === editService.RECORD_TYPES.REMOTE ? editService.RECORD_TYPES.BIB : $scope.recType;
    if(!$scope.record.draft) {
      recordService.draft.create(parsedRecType, $scope.recId, $scope.record).then(function(data) {
        $location.url('/edit/draft' + data['recdata']['@id']);
      });
    } else {
      recordService.draft.save(parsedRecType, $scope.recId, $scope.record, $scope.etag).then(function(data) {
        $scope.addRecordViewsToScope(data['recdata']);
        $scope.etag = data['etag'];
        onSaveState();
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


  // /** debugRecord
  // * Function for debug purposes, !TODO REMOVE

  // */
  // function debugRecord() {

  //   var updatePrinted = function(suffix, remove) {

  //     var updateValue = function(value, suffix, remove) {
  //       // remove or add suffix
  //       if(remove === true) {
  //         v = typeof value !== 'undefined' ? value.replace(suffix,'') : value;
  //       } else {
  //         v = typeof value !== 'undefined' && value.indexOf(suffix) !== -1 ? value : (value + '' + suffix);
  //       }
  //       return v === 'undefined' ? null : v;
  //     };

  //     var iterateObject = function(obj, suffix, remove) {
  //       for(var i in obj) {
  //         if(_.isObject(obj[i])){
  //           iterateObject(obj[i], suffix, remove);
  //         } else {
  //           obj[i] = updateValue(obj[i], suffix, remove);
  //         }
  //       }
  //     };

  //     // Select all mapped elements
  //     var cssSelector = '[data-ng-model],[ng-model],input,textarea,[data-kitin-link-entity],[data-kitin-data-table]';
  //     $(cssSelector).each(function() {
  //       var dataRef = $(this).data();
  //       if(dataRef) {
  //         if(dataRef.$ngModelController) {
  //           dataRefCtrl = dataRef.$ngModelController;
  //           if(_.isString(dataRefCtrl.$viewValue)) {
  //             dataRefCtrl.$setViewValue(updateValue(dataRefCtrl.$viewValue, suffix, remove));  
  //             if(remove) {
  //               // Set binding to non dirty and pristine, aka user has not interacted with the control.
  //               dataRefCtrl.dirty = false;
  //               dataRefCtrl.$setPristine();
  //             }
  //           }
  //         } else if(dataRef.$scope) {
  //           // Special handle data-kitin-link-entity
            
  //           // Multiple links
  //           if(dataRef.$scope['objects']) {
  //             iterateObject(dataRef.$scope['objects'], suffix, remove);
  //           // Single link
  //           } else if(dataRef.$scope['object']) {
  //             obj = dataRef.$scope['object'];
  //             for(var objkey in obj) {
  //               if(_.isObject(obj[objkey])) {
  //                 iterateObject(obj[objkey], suffix, remove);
  //               } else {
  //                 obj[objkey] = updateValue(obj[objkey], suffix, remove);
  //               }
  //             }
  //           }
  //         }
  //       }
  //     });
  //   };

  //   var suffix = ' ***EDITABLE';
  //   // Add suffix
  //   updatePrinted(suffix);
  //   var recordCopy = angular.copy($scope.record);
  //   // Remove suffix
  //   updatePrinted(suffix, true);
  //   // Remove editable parts
  //   function removeEditables(obj) {
  //     for (var key in obj) {
  //       var child = obj[key];
  //       if (_.isObject(child)) {
  //           removeEditables(child);
  //           if ((_.isObject(child) && _.isEmpty(child)) ||
  //               (_.isArray(child) && child[0] === undefined)) {
  //             delete obj[key];
  //           }
  //       } else if (child && child.indexOf && child.indexOf(suffix) > -1) {
  //         delete obj[key];
  //       }
  //     }
  //   }
  //   if(typeof $routeParams.showEditables === 'undefined') {
  //     removeEditables(recordCopy);
  //   }
  //   // Print
  //   $scope.debugRecord = JSON.stringify(recordCopy, null, 4);
  // }
  // // Could not get $viewContentLoading to work. Using timeout as a temporary solution
  // if($scope.debug && $scope.recType === 'bib') {
  //   $timeout(function() {
  //     debugRecord();
      
  //     // Experimental file drop 
  //     // ------------------------------------------------
  //     var $dropTarget = $('body');
  //     $dropTarget.on('dragenter dragover', function (e) {
  //       e.stopPropagation();
  //       e.preventDefault();
  //       $(this).css('border', '6px dotted #0B85A1');
  //     });
  //     $dropTarget.on('drop', function (e) 
  //     {
  //       var that = this;
  //       $(that).css('border', '6px solid #0B85A1');
  //       e.preventDefault();
  //       var files = e.originalEvent.dataTransfer.files;
  //       var reader = new FileReader();

  //       reader.onloadend = function(e) {
  //         var result = JSON.parse(this.result);
  //         editService.decorate(result).then(function(decoratedRecord) {
  //           $timeout(function(){
  //             $scope.record = decoratedRecord;
  //           }).then(function() {
  //             $timeout(function() {
  //               debugRecord();
  //             },1000);
  //             $(that).css('border', '0');
  //           });
  //         });
  //       };

  //       reader.readAsText(files[0]);  
  //     });

  //     $(document).on('dragenter dragover drop', function (e) {
  //         e.stopPropagation();
  //         e.preventDefault();
  //     });
  //     // ------------------------------------------------

  //   }, 1000);
  // }
});
