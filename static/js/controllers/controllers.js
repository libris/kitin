var kitin = angular.module('kitin.controllers', []);

kitin.controller('ModalCtrl', function($scope, $modal) {
  $scope.openModal = function() {
    var opts = {
      backdrop: 'static', // Shows backdrop but doesn't close dialog on click outside.
      keyboard: true,
      templateUrl: 'modal-edit-auth',
      controller: 'OpenModalCtrl',
      backdropFade: true,
      dialogFade:false,
      windowClass: 'wide'
    };
    var i = $modal.open(opts);
  };
});

kitin.controller('OpenModalCtrl', function($scope, $modal, $location) {
  $scope.closeModal = function() {
    $location.search('m',null);
    $scope.$close();
  };
});

kitin.controller('IndexCtrl', function($scope, $http) {
  document.body.className = 'index';



  $scope.drafts = $http.get("/drafts").success(function(data) {
    $scope.drafts = data.drafts;
  });

  $scope['delete'] = function(type, id) {
    $http.post("/record" + "/" + type + "/" + id + "/draft/delete").success(function(data, status) {
      $scope.drafts = data.drafts;
    });
  };
});

kitin.controller('SearchFormCtrl', function($scope, $location, $routeParams, definitions, searchUtil) {
  var searchTypeIndex = {
    bib: {key: "bib", label: "Bibliografiskt material"},
    auth: {key: "auth", label: "Auktoriteter"},
    remotesearch: {key: "remotesearch", label: "Remote"}
  };
  $scope.searchTypes = [searchTypeIndex.bib, searchTypeIndex.auth, searchTypeIndex.remotesearch];
  $scope.setSearchType = function (key) {
    $scope.searchType = searchTypeIndex[key];
    // For remote search, load list of remote database definitions
    if(key === searchTypeIndex.remotesearch.key) {
      definitions.remotedatabases.then(function(data){
        // Debug, set LC (Library of Congress) to default
        var i = _.findIndex(data, { 'database': 'LC' });
        if(i) {
          data[i].selected = true;
        }
        $scope.remoteDatabases = data;
      });
    }
  };

  $scope.placeholders = {
    bib: "Sök bland bibliografiskt material (på ISBN, titel, författare etc.)",
    auth: "Sök bland auktoriteter (personer, ämnen, verk etc.)",
    remotesearch: ""
  };
  $scope.search = function() {
    var selectRemoteDatabases = searchUtil.parseSelected($scope.remoteDatabases);
    selectRemoteDatabases = selectRemoteDatabases.length > 0 ? '&database=' + selectRemoteDatabases : '';
      
    $location.url("/search/" + $scope.searchType.key + "?q="+encodeURIComponent($scope.q) + selectRemoteDatabases);
  };
  $scope.$on('$routeChangeSuccess', function () {
    $scope.setSearchType($routeParams.recType || "bib");
  });
});

kitin.controller('SearchCtrl', function($scope, $http, $location, $routeParams, definitions, searchService, searchUtil, editUtil) {

  var recType = $routeParams.recType;

  $scope.recType = recType;

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
  
  // TODO: localization
  $scope.facetLabels = [ 
    { 'about.@type': 'Typer' },
    { 'about.dateOfPublication': 'Datum' },
    { 'about.instanceOf.language': 'Språk' }
  ];

  var facetLabels = []; // TODO: localization
  facetLabels['about.@type'] = "Typer";
  facetLabels['about.dateOfPublication'] = "Datum";
  $scope.facetLabels = facetLabels;

  document.body.className = 'search';

  $scope.q = $routeParams.q;
  $scope.f = $routeParams.f;
  $scope.database = $routeParams.database;
  $scope.pageSize = 10;
  $scope.page = {
    start: -$scope.pageSize,
    n: $scope.pageSize
  };

  // TODO - remove
  $scope.editPost = function(recType, record) {
    if(recType === 'remotesearch') {
      editUtil.setRecord(record);
    }
    $location.url('/edit' + record.identifier)
  }


  // Sort
  // ----------
  $scope.sortables = [
    { text: 'Relevans',     value: 'relevans' },
    { text: 'Nyast först',  value: '-about.publication.providerDate' },
    { text: 'Äldst först',  value: 'about.publication.providerDate' }
  ];
  $scope.selectedSort = $routeParams.sort ? $scope.sortables[_.findIndex($scope.sortables, { 'value': $routeParams.sort })] : $scope.sortables[0];

  $scope.sortChanged = function(item) {
    $location.search('sort', item.value);
  };
  // ----------

  $scope.search = function() {
    $location.url(url);
  };

  $scope.getLabel = function (term) {
    var dfn = $scope.typeDefs[term];
    if (!dfn) return term;
    return dfn['label_sv'] || term;
  };

  $scope.firstPerson = function (work) {
    var candidate = work.attributedTo || work.influencedBy;
    return _.isArray(candidate)? candidate[0] : candidate;
  };

  $scope.getScrollStart = function() {
    var start = $scope.page.start + $scope.page.n;
    return (start > $scope.hitCount) ? $scope.page.start : start;
  };

  $scope.onScroll = function() {
    // Get current scroll start
    var start = $scope.getScrollStart();
    // Skip load if already scrolling or if page end is reached
    if($scope.scrolled || start === $scope.page.start) return;

    $scope.scrolled = true;
    // Set page start
    $scope.page.start = start; 
    // Do search request
    $scope.doSearch($scope.url, $scope.getSearchParams());
  };

  var prevFacetsStr = $routeParams.f || "";

  if (!$routeParams.q) {
    return;
  }


  $scope.getSearchParams = function() {
    var params = {
      q: this.q,
      start: this.page.start,
      n: this.page.n,
      sort: this.selectedSort.value,
      database: this.database
    };
    if (this.f !== undefined) {
      params.f = this.f;
    }
    return params;
  };

  $scope.$watch('result.list.length', function(newLength, oldLength) {
    var updateHoldings = function(data, status, headers, config) {
    if(data) {
          config.record.holdings = data;
        }
    };
    for (var i = oldLength ? oldLength: 0; i < newLength; i++) {
        var record = $scope.result.list[i];
        if(record.identifier) {
          $http.get("/record"  + record.identifier + "/holdings", {record: record}).success(updateHoldings);
        }

    }
  });

  $scope.loading = true;
  $scope.doSearch = function(url, params) {

    searchService.search(url, params).then(function(data) {
      $scope.facetGroups = searchUtil.makeLinkedFacetGroups(recType, data.facets, $scope.q, prevFacetsStr);
      $scope.crumbs = searchUtil.bakeCrumbs(recType, $scope.q, prevFacetsStr);

      if($scope.result) {
        data.list.forEach(function(element) {
          $scope.result.list.push(element);
        });
      } else {
        $scope.result = data;
        if (data.hits == 1) {
            $location.url("/edit" + data.list[0].identifier);
            $location.replace();
        }
        $scope.hitCount = data.hits.toString();
      }
      $scope.scrolled = false;
      $scope.loading = false;
    });
  };
});


kitin.controller('EditCtrl', function($scope, $modal, $http, $routeParams, $timeout, $rootScope, $location, records, definitions, userData, editUtil) {

  var modalRecord = $rootScope.modalRecord;
  var recType = modalRecord? modalRecord.recType : $routeParams.recType;
  var recId = modalRecord? modalRecord.recId : $routeParams.recId;

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

  var isNew = (recId === 'new');
  var newType = $routeParams.type;

  $scope.recType = recType;

  document.body.className = isNew? 'edit new' : 'edit';

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
          record.about.instanceOf, defaultSchemes);
    });
  }

  if (isNew) {
    $http.get('/record/bib/new?type' + newType).success(function(data) {
      var record = $scope.record = data;
      addRecordViewsToScope(record, $scope);
    });
  } else {
    var record = editUtil.getRecord();
    if(recType === 'external' && record) {
      record = $scope.record = record.data;
      editUtil.patchBibRecord(record);
      addRecordViewsToScope(record, $scope);
    } else {
    records.get(recType, recId).then(function(data) {
      var record = $scope.record = data['recdata'];

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

  $scope.modifications = {saved: true, published: true};

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
        $http.post("/record" + "/" + type + "/" + id + "/draft/delete").success(function(data, status) {
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

  if (isNew) {
    $scope.save = function() {
      records.create(recType, $scope.record).then(function(data) {
        $location.url('/edit/bib/' + data['document_id']);
      });
    };
  } else
  $scope.save = function() {
    var ifMatchHeader = $scope.etag.replace(/["']/g, "");
    records.save(recType, recId, $scope.record, ifMatchHeader).then(function(data) {
      $scope.record = data['recdata'];
      $scope.etag = data['etag'];
            onPublishState();
    });
  };

  $scope.saveDraft = function() {
    $http.post("/record/"+ $routeParams.recType +"/"+ $routeParams.recId +"/draft",
      $scope.record,
      {headers: {"If-match":$scope.etag}}
    ).success(function(data, status) {
      $scope.draft = data;
      $scope.draft.type = data['@id'].split("/").slice(-2)[0];
      $scope.draft.id = data['@id'].split("/").slice(-2)[1];
      onSaveState();
      //$('.flash_message').text("Utkast sparat!");
    });
  };

  $http.get("/draft/"+recType+"/"+recId).success(function(data, status, headers) {
    $scope.draft = data;
    $scope.draft.type = data['@id'].split("/").slice(-2)[0];
    $scope.draft.id = data['@id'].split("/").slice(-2)[1];
    $scope.etag = headers('etag');
  }).error(function(data, status) {
    //console.log(status);
  });

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
