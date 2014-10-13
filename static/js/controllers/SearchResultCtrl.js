kitin.controller('SearchResultCtrl', function($scope, $http, $location, $routeParams, $rootScope, $anchorScroll, definitions, searchService, searchUtil, editService, recordService, userData) {

  $scope.recType = $routeParams.recType;

  function getSearchURL() {
    var url = $rootScope.API_PATH + '/' + $scope.recType + '/_search';
    if($scope.recType === 'remote') {
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

  // TODO: localization
  $scope.facetLabels = searchService.facetLabels;

  document.body.className = 'search';
  $rootScope.state.search = {};
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
      editService.setRecord(record);
    }
    return false;
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
    var dfn = $scope.terms[term];
    
    if (dfn && dfn['label']) return dfn['label']; 

    // !TODO fix propper linking
    if(termType && termType.indexOf('language') > 0) {
      var lang = _.find($scope.languages.list, function(lang) { 
        if(lang.identifier === term) { 
        return true; 
      }});
      if(lang) {
        return lang.data.about['prefLabel'];
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

  $scope.gotoTop = function() {
    $anchorScroll();
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

  $rootScope.$watch('state.search.result.list.length', function(newLength, oldLength) {
    var findDeep = function(items, attrs) {
      function match(value) {
        for (var key in attrs) {
          if (attrs[key] !== value[key]) {
            return false;
          }
        }
        return true;
      }
      function traverse(value) {
        var result;
        _.forEach(value, function (val) {
          if (match(val)) {
            result = val;
            return false;
          }
          if (_.isObject(val) || _.isArray(val)) {
            result = traverse(val);
          }
          if (result) {
            return false;
          }
        });
        return result;
      }
      return traverse(items);
    };

    var updateHoldings = function(data, status, headers, config) {
      if (data && data.list) {
        config.record.holdings = {
          hits: 0
        };
        if (data.list.length > 0) {
          var userHolding = findDeep(data.list, { notation: userData.userSigel });
          config.record.holdings = {
            hits: data.list.length,
            holding: userHolding
          };
        }
      }
    };

    for (var i = oldLength ? oldLength: 0; i < newLength; i++) {
        var record = $rootScope.state.search.result.list[i];
        if (record.identifier) {
          $http.get($rootScope.API_PATH + '/hold/_search?q=*+about.holdingFor.@id:' + record.data.about['@id'].replace(/\//g, '\\/'), {record: record}).success(updateHoldings);
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
