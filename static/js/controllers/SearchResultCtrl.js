kitin.controller('SearchResultCtrl', function($scope, $http, $timeout, $location, $routeParams, $rootScope, $anchorScroll, recordService, definitions, searchService, searchUtil, editService, userData, utilsService) {

  document.body.className = 'search';
  $scope.recType = $routeParams.recType;
  $scope.utils = utilsService;
  $scope.userSigel = userData.userSigel;

  function getSearchURL() {
    var url = $rootScope.API_PATH + '/' + $scope.recType + '/_search';
    if ($scope.recType === 'remote') {
      url = $rootScope.API_PATH + '/_remotesearch';
    }
    return url;
  }
  $scope.url = getSearchURL();

  definitions.terms.then(function(data) {
    $scope.terms = data.index;
  });

  definitions.languages.then(function(data) {
    $scope.languages = data;
  });

  definitions.enums.encLevel.then(function(data) {
    $scope.encLevels = data;
  });

  // TODO: localization
  $scope.facetLabels = searchService.facetLabels;

  $rootScope.state.search = $rootScope.state.search || {};
  $rootScope.state.search.q = $routeParams.q;
  $rootScope.state.search.f = $routeParams.f;
  $rootScope.state.search.database = $routeParams.database;
  $rootScope.state.search.page = {
    start: $routeParams.start || 0,
    n: searchService.pageSize
  };
  $scope.sortables = searchService.sortables;
  
  // Reset remote search hit count 
  _.map($rootScope.state.remoteDatabases, function(remoteDB) { delete remoteDB.hitCount; });

  $scope.queryString = '?' + utilsService.constructQueryString($rootScope.state.search);


  // Sort
  // ----------
  $scope.selectedSort = $routeParams.sort ? _.find(searchService.sortables, { 'value': $routeParams.sort }) : searchService.sortables[0];
  $rootScope.state.search.sort = $scope.selectedSort.value;
  $scope.sortChanged = function(item) {
    $rootScope.state.search.sort = item.value;
    $location.search('sort', item.value);
  };
  // ----------

  $scope.setView = function(view) {
    // Changing both state and URL seems a bit verbose, but It'll have to do for now.
    $rootScope.state.search.view = view;
    $location.search('view', view);
  };

  $scope.getLabel = function (term, termType) {
    var dfn = $rootScope.terms[term];
    
    if (dfn && dfn['label']) return dfn['label']; 

    // !TODO fix propper linking
    if (termType && termType.indexOf('language') > 0) {
      var lang = _.find($scope.languages.items, function(lang) {
        if (lang['@id'] === term) { return true; }
      });
      if (lang) {
        return lang.about['prefLabel'] || term;
      }
    }
    if(termType && termType.indexOf('encLevel') > -1) {
      var encLevel = _.find($scope.encLevels.items, function(encLevel) {
        if (encLevel['@id'] === term) { return true; }
      });
      if (encLevel) {
        return encLevel.about['prefLabel'] || term;
      }
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

  $scope.gotoTop = function() {
    $anchorScroll();
  };

  var prevFacetsStr = $routeParams.f || "";

  if (!$routeParams.q) {
    return;
  }

  var getHoldings = function () {
    var updateHoldings = function(response) {
      if (response.data && response.data.items) {
        response.config.record.holdings = {
          items: 0
        };
        if (response.data.items.length > 0) {
          // At the moment, we're only using userHoldings, but in the future, we might use
          // allHoldings to present the user with extra information on other organisations'
          // holdings.
          var holdings = utilsService.findDeep(response.data.items, 'about.heldBy.notation', userData.userSigel);
          var userHoldings = holdings.matches;
          var allHoldings = holdings.nonmatches;

          if (userHoldings) userHoldings = userHoldings[0];

          response.config.record.holdings = {
            items: response.data.items.length,
            holding: userHoldings,
            all: allHoldings
          };
        }
      }
    };

    for (var i = 0; i < $rootScope.state.search.result.items.length; i++) {
        var record = $rootScope.state.search.result.items[i];
        if (record.about && record.about['@id']) {
          recordService.holding.search(record.about['@id'], true, record).then(updateHoldings);
        }
    }
  };

  $scope.doSearch = function(url, params) {
    delete $rootScope.state.search.result;
    searchService.search(url, params).then(function(data) {
     
      $scope.facetGroups = searchUtil.makeLinkedFacetGroups($scope.recType, data.facets, $rootScope.state.search, prevFacetsStr);
      $scope.crumbs = searchUtil.bakeCrumbs($scope.recType, $rootScope.state.search, prevFacetsStr);

      if (data && data.items) {
        $rootScope.state.search.result = data;
        // Only update holdings for records of type 'bib'
        if ($scope.recType == 'bib') {
          getHoldings();
        }
        
        if(_.isObject(data.totalResults)) {
          _.forEach(data.totalResults, function(count, dbName) {
            var i = _.findIndex($rootScope.state.remoteDatabases, { database: dbName } );
            if(i > 0) {
              $rootScope.state.remoteDatabases[i].hitCount = count;
            }
          });
        }

        $rootScope.state.search.hitCount = data.totalResults;
        $rootScope.state.search.page.total = Math.ceil(data.totalResults / searchService.pageSize);
        // Everything we need is set, change paginator page
        var page = ($rootScope.state.search.page.start / $rootScope.state.search.page.n || 0) + 1;
        $scope.state.page = page;
      } else {
        $rootScope.state.search.result = { items: 0 };
      }
      // Create an static version of query 
      $scope.staticQ = angular.copy($rootScope.state.search.q);
    });
  };


  // TODO: Put this in better place for access from both result list and bib modal.
  $scope.importRecord = function(data) {
    if(data['@id'])
      delete data['@id'];
    if(data.about['@id'])
      delete data.about['@id'];

    recordService.draft.create('bib', null, data)
      .then(function success(response) {
        // send user to edit
        $location.url("edit/draft" + response.recdata['@id'] + "?imported");
      }, function error(status) {

      });
  };

  $scope.getStart = function() {
    var start = ($scope.state.page - 1) * $rootScope.state.search.page.n;
    return start;
  };

  $scope.pageChanged = function() {
    // User clicked paginator
    $scope.gotoTop();
    $location.search('start', $scope.getStart());
    $location.search('n', searchService.pageSize);
  };

  // Get first page
  $scope.doSearch($scope.url, $rootScope.state.getSearchParams());

});
