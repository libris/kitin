kitin.controller('EditCtrl', function($scope, $modal, $http, $routeParams, $timeout, $rootScope, $location, $anchorScroll, dataService, definitions, userData, editUtil) {

  $anchorScroll();

  var modalRecord = $rootScope.modalRecord;
  var recType = modalRecord? modalRecord.recType : $routeParams.recType;
  var recId = modalRecord? modalRecord.recId : $routeParams.recId;
  var isNew = (recId === 'new');
  $scope.recType = recType;

  document.body.className = isNew ? 'edit new' : 'edit';

  $scope.$on('$routeUpdate', function() {
    var modalParams = $location.$$search.m;
    if(modalParams) {
      var params = modalParams.split('/').splice(1);
      $rootScope.modalRecord = {
        recType: recType = params[1],
        recId: recId = params[2],
      };
    } else {
      $rootScope.modalRecord = null;
    }
  });


  // Fetch definitions
  // TODO:
  // - load cached aggregate, or lookup part on demand from backend?
  // - Do not load just to set in scope; use where needed in services instead.
  //$scope.enums = {};
  //definitions.enums.bibLevel.then(function(data) {
  //  $scope.enums.bibLevel = data;
  //});
  //definitions.enums.encLevel.then(function(data) {
  //  $scope.enums.encLevel = data;
  //});
  //definitions.enums.catForm.then(function(data) {
  //  $scope.enums.catForm = data;
  //});

  definitions.typedefs.then(function(data) {
    var typedefs = data.types;
    $scope.getTypeDef = function (obj) {
      if (typeof obj === "undefined")
        return;
      return typedefs[obj['@type']];
    };
    // TODO: merge with getLabel (defined in SearchCtrl)
    $scope.getTypeLabel = function (obj) {
      if (typeof obj === "undefined")
        return;
      var dfn = $scope.getTypeDef(obj);
      var typeLabel = (dfn) ? dfn['label_sv'] : obj['@type'];
      return _.isArray(typeLabel) ? typeLabel.join(', ') : typeLabel;
    };
  });

  $scope.isLinked = function (thing) {
    var id = thing['@id'];
    return id && id.substring(0, 2) !== '_:';
  };

  function addRecordViewsToScope(record, scope) {
    // FIXME: this is just a view object - add/remove must operate on source and refresh this
    // (or else this must be converted back into source form before save)
    definitions.relators.then(function (relators) {
      var roleMap = {};
      editUtil.populatePersonRoleMap(roleMap, record, relators);
      scope.personRoleMap = roleMap;
    });

    scope.unifiedClassifications = editUtil.getUnifiedClassifications(record);
    var defaultSchemes = ['sao', 'saogf'];
    definitions.conceptSchemes.then(function(data) {
      scope.conceptSchemes = data;
      scope.schemeContainer = new editUtil.SchemeContainer(
          record.about, defaultSchemes);
    });
  }

  if (isNew && recType !== 'remote') {
    $http.get('/record/' + recType).success(function(data) {
      var record = $scope.record = data;
      addRecordViewsToScope(record, $scope);
    });
  } else {
    record = editUtil.getRecord();
    if(recType === 'remote' && record) {
      record = record.data;
      $scope.record = record.data;
      editUtil.patchBibRecord(record);
      addRecordViewsToScope(record, $scope);
    } else {
      if(recId.indexOf('draft') > -1) {
        dataService.draft.get(recType + '/' + recId).then(function(data) {
          $scope.record = data['recdata']['document'];
          $scope.isDraft = true;
          if(data['recdata']['document']['@id']) {
            $scope.record.type = data['recdata']['document']['@id'].split("/").slice(-2)[0];
            $scope.record.id = data['recdata']['document']['@id'].split("/").slice(-2)[1];
          }
          $scope.etag = data['recdata']['etag'];
        });
      } else {
        dataService.record.get(recType, recId).then(function(data) {
          var record = data['recdata'];
          $scope.record = record;

          if (recType === 'bib') {
            editUtil.patchBibRecord(record);
            addRecordViewsToScope(record, $scope);
          }
          
          $scope.etag = data['etag'];
          $scope.userSigel = userData.userSigel;

          $http.get("/record/" + recType + "/" + recId + "/holdings").success(function(data) {
            var holdingEtags = {};
            var items = editUtil.patchHoldings(data.list);
            $scope.holdings = items;
            var myHoldings = _.filter(items, function(i) { return i['location'] == userData.userSigel; });
            if (myHoldings <= 0) {
              $http.get("/holding/bib/new").success(function(data, status, headers) {
                data.location = $scope.userSigel;
                $scope.holding = data;
                data._isNew = true; // TODO: don't do this when etag works
              });
            } else {
              $scope.holding = myHoldings[0];
            }
            items.forEach(function (item) {
              if (item['@id']) {
                $http.get("/holding/"+ item['@id'].split("/").slice(-2)[1]).success(function (data, status, headers) {
                  holdingEtags[data['@id']] = headers('etag');
                });
              }
            });
            $scope.holdingEtags = holdingEtags;
          });

        });
      }
    }
  }

  $scope.modifications = {
    saved:     recType === 'remote' ? false : true, 
    published: recType === 'remote' ? false : true
  };

  function onSaveState() {
    $scope.modifications.saved = true;
    $scope.modifications.lastSaved = new Date();
  }
  function onPublishState() {
    $scope.modifications.saved = true;
    $scope.modifications.published = true;
    $scope.modifications.lastPublished = new Date();
  }

  $scope.triggerModified = function () {
    $scope.modifications.saved = false;
    $scope.modifications.published = false;
  };

  $scope.modifiedClasses = function () {
    var classes = [], mods = $scope.modifications;
    if (mods.saved) classes.push('saved');
    if (mods.published) classes.push('published');
    return classes;
  };

  $scope.lastSavedLabel = function (tplt) {
    if (!$scope.modifications.lastSaved)
      return "";
    return tplt.replace(/%s/, $scope.modifications.lastSaved.toLocaleString());
  };

  $scope.lastPublishedLabel = function (tplt) {
    if (!$scope.modifications.lastPublished)
      return "";
    return tplt.replace(/%s/, $scope.modifications.lastPublished.toLocaleString());
  };

  $scope.promptConfirmDelete = function($event, type, id) {
    $scope.confirmDeleteDraft = {
      execute: function() {
        dataService.draft.delete(type, id).then(function(data) {
          $scope.draft = null;
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
  
  $scope.save = function() {
    var recType = $routeParams.recType === 'remote' ? 'bib' : $routeParams.recType;
    if(!$scope.isDraft && !isNew) {
      var ifMatchHeader = $scope.etag.replace(/["']/g, "");
      dataService.record.save(recType, recId, $scope.record, ifMatchHeader).then(function(data) {
        $scope.record = data['recdata'];
        $scope.etag = data['etag'];
        onPublishState();
      });
    } else {
      dataService.record.create(recType, $scope.record).then(function(data) {
        if($scope.isDraft) {
          dataService.draft.delete(recType, recId);
        }
        $location.url('/edit/' + recType + '/' + data['document_id']);
      });
    }
  };
  

  $scope.saveDraft = function() {
    var recType = $routeParams.recType === 'remote' ? 'bib' : $routeParams.recType;

    if(!$scope.isDraft) {
      dataService.draft.create(recType, $scope.record).then(function(data) {
        $location.url('/edit/' + data['draft_id']);
      });
    } else {
      dataService.draft.save(recType, recId, $scope.record, $scope.etag).then(function(data) {
        $scope.draft = data['recdata'];
        $scope.draft.type = data['recdata']['@id'].split("/").slice(-2)[0];
        $scope.draft.id = data['recdata']['@id'].split("/").slice(-2)[1];
        onSaveState();
        //$('.flash_message').text("Utkast sparat!");
      });
    }
  };
/*
  dataService.draft.get(recId).then(function(data, status, headers) {
    $scope.draft = data['recdata'];
    $scope.isDraft = true;
    if(data['recdata']['@id']) {
      $scope.draft.type = data['recdata']['@id'].split("/").slice(-2)[0];
      $scope.draft.id = data['recdata']['@id'].split("/").slice(-2)[1];
    }
    $scope.etag = data['etag'];
  });
*/
  $scope.newObject = function(subj, rel, type) {
    var obj = subj[rel] = editUtil.createObject(type);
  };

  $scope.addObject = function(subj, rel, type) {
    var collection = subj[rel];
    if (typeof collection === 'undefined') {
      collection = subj[rel] = [];
    }
    var obj = editUtil.createObject(type);
    collection.push(obj);
  };

  $scope.addObject = function(subj, rel, type, target) {
    var collection = subj[rel];
    if (typeof collection === 'undefined') {
      collection = subj[rel] = [];
    }
    var obj = editUtil.createObject(type);
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
    var obj = subj[rel];
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
    $scope.triggerModified();
  };

  $scope.addHolding = function(holdings) {
    holdings.push({shelvingControlNumber: "", location: constants['user_sigel']});
  };

  $scope.saveHolding = function(holding) {
    var etag = $scope.holdingEtags[holding['@id']];
    holding['annotates'] = { '@id': "/"+recType+"/"+recId };
    // TODO: only use etag (but it's not present yet..)
    if(!holding._isNew && (etag || holding.location === $scope.userSigel)) {
      $http.put("/holding/" + holding['@id'].split("/").slice(-2)[1], holding, {headers: {"If-match":etag}}).success(function(data, status, headers) {
        $scope.holdingEtags[data['@id']] = headers('etag');
      }).error(function(data, status, headers) {
        console.log("ohh crap!");
      });
    } else {
      if (holding._isNew) { delete holding._isNew; }
      console.log("we wants to post a new holding");
      $http.post("/holding", holding).success(function(data, status, headers) {
        $scope.holdingEtags[data['@id']] = headers('etag');
      }).error(function(data, status, headers) {
        console.log("ohh crap!");
      });
    }
  };

  $scope.deleteHolding = function(holdingId) {
    $http['delete']("/holding/" + holdingId).success(function(data, success) {
      console.log("great success!");
      $http.get("/record/" + recType + "/" + recId + "/holdings").success(function(data) {
        $scope.holdings = patchHoldings(data.list);
      });
    }).error(function() {
      console.log("oh crap!");
    });
  };

  var typeCycle = ['Book', 'EBook', 'Audiobook', 'Serial', 'ESerial'], typeIndex = 0;
  $scope.cycleType = function (evt, obj) {
    if (!obj || !evt.altKey) return;
    if (typeIndex++ >= typeCycle.length - 1) typeIndex = 0;
    obj['@type'] = typeCycle[typeIndex];
  };

  $scope.toJsonLdLink = function (id) {
    return id.replace(/^\/(resource\/)?/, '/jsonld/');
  };


  $scope.jsonLdKeys = function(obj) {
    if (angular.isArray(obj))
      return _.keys(obj);
    var result = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && key[0] !== '$') {
        result.push({key: key, value: obj[key]});
      }
    }
    result.sort(function (one, other) {
      var a1 = jsonLdObjectWeight(one.value),
          a2 = jsonLdObjectWeight(other.value);
      if (a1 === a2 && _.isObject(one.value)) {
        a1 = _.size(one.value);
        a2 = _.size(other.value);
      }
      var b1 = one.key,
          b2 = other.key;
      return 2 * (a1 > a2 ? 1 : a1 < a2 ? -1 : 0) +
        1 * (b1 > b2 ? 1 : b1 < b2 ? -1 : 0);
    });
    return _.collect(result, 'key');
  };

  function jsonLdObjectWeight(o) {
    if (_.isArray(o)) {
      return 3;
    } else if (_.isObject(o)) {
      if (!_.isUndefined(o['@id']))
        return 2;
      else
        return 1;
    } else {
      return 0;
    }
  }

  /** debugRecord
  * Function for debug purposes, !TODO REMOVE
  * Finds data bindings and prints record to console.log
  */
  function debugRecord() {

    var updatePrinted = function(suffix, remove) {

      var updateValue = function(value, suffix, remove) {
        // remove or add suffix
        v = (remove === true) ? value.replace(suffix,'') : value + '' + suffix;
        return v === 'undefined' ? null : v;
      };

      var iterateObject = function(obj, suffix, remove) {
        for(var i in obj) {
          if(_.isObject(obj[i])){
            iterateObject(obj[i], suffix, remove);
          } else {
            obj[i] = updateValue(obj[i], suffix, remove);
          }
        }
      };

      // Select all mapped elements
      $('[data-ng-model],[ng-model],input,textarea,[data-kitin-link-entity]').each(function() {
        var dataRef = $(this).data();
        if(dataRef) {
          if(dataRef.$ngModelController) {
            dataRefCtrl = dataRef.$ngModelController;
            dataRefCtrl.$setViewValue(updateValue(dataRefCtrl.$viewValue, suffix, remove));  
          } else if(dataRef.$scope) {
            // Special handle data-kitin-link-entity
            
            // Multiple links
            if(dataRef.$scope['objects']) {
              iterateObject(dataRef.$scope['objects'], suffix, remove);
            // Single link
            } else if(dataRef.$scope['object']) {
              obj = dataRef.$scope['object'];
              for(var objkey in obj) {
                obj[objkey] = updateValue(obj[objkey], suffix, remove);
              }
            }
          }
        }
      });
    };

    var suffix = ' ***EDITABLE';
    // Add suffix
    updatePrinted(suffix);
    // Print
    $scope.debugRecord = JSON.stringify(angular.copy($scope.record), null, 4);
    // Remove suffix
    updatePrinted(suffix, true);
  }
  // Could not get $viewContentLoading to work. Using timeout as a temporary solution
  $timeout(function() {
    debugRecord();
  }, 1000);
    
});