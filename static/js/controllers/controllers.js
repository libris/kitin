var kitin = angular.module('kitin.controllers', []);

kitin.controller('AppCtrl', function($scope, $rootScope, $modal, searchService) {
  $rootScope.state = {
    searchType: {},
    remoteDatabases: [],
    search: {},

    getSearchParams : function() {
      var params = {
        q: $rootScope.state.search.q,
        start: $rootScope.state.search.page.start,
        n: $rootScope.state.search.page.n,
        sort: $rootScope.state.search.sort,
        database: $rootScope.state.searchType.key === searchService.searchTypeIndex.remote.key ? $rootScope.state.search.database : undefined
      };
      if ($rootScope.state.search.f !== undefined) {
        params.f = $rootScope.state.search.f;
      }
      return params;
    }
  };

});

kitin.controller('ModalCtrl', function($scope, $modal) {
  var defaultModalOptions = {
    backdrop: 'static', // Shows backdrop but doesn't close dialog on click outside.
    keyboard: true,
    controller: 'OpenModalCtrl',
    backdropFade: true,
    dialogFade: false,

  };

  $scope.openAuthModal = function() {
    var opts = angular.extend(
                defaultModalOptions,
                {
                  templateUrl: 'modal-edit-auth',
                  controller: 'AuthModalCtrl',
                  windowClass: 'modal-large auth-modal'
                });
    $scope.authModal = $modal.open(opts);
  };

  $scope.openRemoteModal = function() {
    var opts = angular.extend(
                  defaultModalOptions,
                  {
                  templateUrl: 'modal-remote',
                  controller: 'RemoteModalCtrl',
                  scope: $scope,
                  windowClass: 'modal-large remote-modal'
                  });
    console.log(opts);
    $scope.remoteModal = $modal.open(opts);
  };

});

kitin.controller('AuthModalCtrl', function($scope, $modalInstance, $location) {
  $scope.close = function() {
    $location.search('m',null);
    $modalInstance.close();
  };
});

kitin.controller('RemoteModalCtrl', function($scope, $rootScope, $modalInstance, definitions, searchService) {
  // For remote search, load list of remote database definitions
  if(_.isEmpty($rootScope.state.remoteDatabases)) {
    definitions.remotedatabases.then(function(databases){
      // Debug, set LC (Library of Congress) to default        
      var searchedDatabases = ['LC'];
      if($rootScope.state.search.database) {
        searchedDatabases = $rootScope.state.search.database.split(',');
      }
      _.forEach(searchedDatabases, function(dbName) {
        var i = _.findIndex(databases, { 'database': dbName });
        if(i > 0) {
          databases[i].selected = true;
        }
      });      

      $rootScope.state.remoteDatabases = databases;
    });
  }

  $scope.close = function() {
    $modalInstance.close();
  };
});

kitin.controller('IndexCtrl', function($scope, $http, dataService) {
  document.body.className = 'index';

  dataService.drafts.get().then(function(data) {
    $scope.drafts = data.drafts;
  });

  $scope['delete'] = function(type, id) {
    dataService.draft.delete(type, id).then(function(data) {
      $scope.drafts = data.drafts;
    });
  };
});

kitin.controller('SearchFormCtrl', function($scope, $location, $routeParams, $rootScope, definitions, searchService, searchUtil) {

  $scope.searchTypes = [searchService.searchTypeIndex.bib, searchService.searchTypeIndex.auth, searchService.searchTypeIndex.remote];
  $scope.setSearchType = function (key) {
    $rootScope.state.searchType = searchService.searchTypeIndex[key];
  };
  
  $scope.search = function() {
    var selectRemoteDatabases = '';
    if($rootScope.state.searchType.key === searchService.searchTypeIndex.remote.key) {
      selectRemoteDatabases = searchUtil.parseSelected($rootScope.state.remoteDatabases);
      selectRemoteDatabases = selectRemoteDatabases.length > 0 ? '&database=' + selectRemoteDatabases : '';
    }
    
    $location.url("/search/" + $rootScope.state.searchType.key + "?q="+encodeURIComponent($rootScope.state.search.q) + selectRemoteDatabases);
  };
  $scope.$on('$routeChangeSuccess', function () {
    $scope.setSearchType($routeParams.recType || "bib");
  });
});



kitin.controller('SearchResultCtrl', function($scope, $http, $location, $routeParams, $rootScope, $anchorScroll, definitions, searchService, searchUtil, editUtil) {

  

  $scope.recType = $routeParams.recType;

  $scope.url = '/search/' + $scope.recType + '.json';

  definitions.typedefs.then(function(data) {
    $scope.typeDefs = data.types;
  });

  $scope.enums = {};

  definitions.enums.bibLevel.then(function(data) {
    $scope.enums.bibLevel = data;
  });

  definitions.enums.encLevel.then(function(data) {
    $scope.enums.encLevel = data;
  });
  
  definitions.languages.then(function(data) {
    $scope.languages = data;
  });
  

  // TODO: localization
  $scope.facetLabels = searchService.facetLabels;

  document.body.className = 'search';

  $rootScope.state.search.q = $routeParams.q;
  $rootScope.state.search.f = $routeParams.f;
  $rootScope.state.search.database = $routeParams.database;
  $rootScope.state.search.page = {
    start: -searchService.pageSize,
    n: searchService.pageSize
  };
  $scope.sortables = searchService.sortables;
  
  // Reset remote search hit count 
  _.map($rootScope.state.remoteDatabases, function(remoteDB) { delete remoteDB.hitCount; });

  // TODO - remove
  $scope.editPost = function(recType, record) {
    if(recType === 'remote') {
      record.identifier = '/remote/new';
      editUtil.setRecord(record);
    }
    $location.url('/edit' + record.identifier);
  };


  // Sort
  // ----------
  $scope.selectedSort = $routeParams.sort ? _.find(searchService.sortables, { 'value': $routeParams.sort }) : searchService.sortables[0];
  $rootScope.state.search.sort = $scope.selectedSort.value;
  $scope.sortChanged = function(item) {
    $location.search('sort', item.value);
  };
  // ----------

  $scope.search = function() {
    $location.url(url);
  };

  $scope.getLabel = function (term, termType) {
    var dfn = $scope.typeDefs[term];
    
    if (dfn && dfn['label_sv']) return dfn['label_sv']; 

    // !TODO fix propper linking
    if(termType && termType.indexOf('language') > 0) {
      var lang = _.find($scope.languages['byCode'],{'@id': term});
      if(lang) {
        return lang['prefLabel'];
      }
    }
    if(termType && termType.indexOf('encLevel') > -1) {
      return $scope.parseEncLevel(term);
    }
    
    return term;
  };

  $scope.parseEncLevel = function(encLevel) {
    switch(encLevel) {
      case 'trec:MinimalLevel':
        return 'Miniminivå';
      case 'trec:AbbreviatedLevel':
        return 'Biblioteksnivå';
      case 'trec:PrepublicationLevel':
        return 'Förhandspost';
      case null:
      case 'null':
        return 'NB-nivå';
      case 'trec:FullLevelInputByOclcParticipantsLocal':
        return 'Full-level input by OCLC participants (LOCAL)';
      case 'n':
      case 'N':
        return 'Ny post';
      case 'c':
      case 'C':
        return 'Rättad/Reviderad';
      default:
        return encLevel;
    }
  };

  $scope.firstPerson = function (work) {
    var candidate = work.attributedTo || work.influencedBy;
    return _.isArray(candidate)? candidate[0] : candidate;
  };

  $scope.getScrollStart = function() {
    var start = $rootScope.state.search.page.start + $rootScope.state.search.page.n;
    return (start > $rootScope.state.search.hitCount) ? $rootScope.state.search.page.start : start;
  };

  $scope.onScroll = function() {
    // Get current scroll start
    var start = $scope.getScrollStart();
    // Skip load if already scrolling or if page end is reached
    if($scope.scrolled || start === $rootScope.state.search.page.start) return;

    $scope.scrolled = true;
    // Set page start
    $rootScope.state.search.page.start = start; 
    // Do search request
    $scope.doSearch($scope.url, $rootScope.state.getSearchParams());
  };

  var prevFacetsStr = $routeParams.f || "";

  if (!$routeParams.q) {
    return;
  }

  $scope.$watch('state.search.result.list.length', function(newLength, oldLength) {
    var updateHoldings = function(data, status, headers, config) {
    if(data) {
          config.record.holdings = data;
        }
    };
    for (var i = oldLength ? oldLength: 0; i < newLength; i++) {
        var record = $rootScope.state.search.result.list[i];
        if(record.identifier) {
          $http.get("/record"  + record.identifier + "/holdings", {record: record}).success(updateHoldings);
        }

    }
  });

  $scope.loading = true;
  $scope.doSearch = function(url, params) {

    searchService.search(url, params).then(function(data) {
      $scope.facetGroups = searchUtil.makeLinkedFacetGroups($scope.recType, data.facets, $rootScope.state.search.q, prevFacetsStr);
      $scope.crumbs = searchUtil.bakeCrumbs($scope.recType, $rootScope.state.search.q, prevFacetsStr);
      if(data && data.hits) {
        // New page load
        if($rootScope.state.search.result) {
          data.list.forEach(function(element) {
            $rootScope.state.search.result.list.push(element);
          });

        // Initial load
        } else {
          $rootScope.state.search.result = data;
          
          var hitCount = searchUtil.countTotalHits(data.hits);
          if(_.isObject(data.hits)) {
            _.forEach(data.hits, function(count, dbName) {

              var i = _.findIndex($rootScope.state.remoteDatabases, { database: dbName } );
              if(i > 0) {
                $rootScope.state.remoteDatabases[i].hitCount = count;
              }
            });
          }  

          $rootScope.state.search.hitCount = hitCount.toString();       
        }
      } else {
        $rootScope.state.search.result = { hits: 0 };
      }
      $scope.scrolled = false;
      $scope.loading = false;
    });
  };
});


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
      return (dfn)? dfn['label_sv'] : obj['@type'];
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
});
