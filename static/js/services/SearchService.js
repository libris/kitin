/**
 * searchService
 *
 */
kitin.factory('searchService', function($http, $q, $rootScope, utilsService) {
  return {
    facetLabels: { 
     'about.@type': 'Typer',
     'about.hasFormat.@type': 'Format',
     'about.language.@id': 'Språk',
     'encLevel.@id': 'Beskrivningsnivå'
    },
    searchTypeIndex: {
      bib: {
        key: 'bib', 
        label: 'Libris',
        placeholder: 'Sök bland bibliografiskt material (på ISBN, titel, författare etc.)',
        facets: ["about.@type", "about.hasFormat.@type", "about.language.@id"]
      },
      auth: {
        key: 'auth', 
        label: 'Auktoriteter',
        placeholder: 'Sök bland auktoriteter (personer, ämnen, verk etc.)'
      },
      remote: {
        key: 'remote', 
        label: 'Remote',
        placeholder: 'Sök remote'
      }
    },
    sortables: [
      { text: 'Relevans',     value: 'relevans' },
      { text: 'Nyast först',  value: '-about.publication.providerDate' },
      { text: 'Äldst först',  value: 'about.publication.providerDate' }
    ],
    getPageSize: function(string) {
      if(string === 'detailed') {
        return 10;
      } else {
        return 50;
      }
    },
    setSearchType: function (key) {
      // FIXME: dont put to rootScope.
      $rootScope.state.searchType = this.searchTypeIndex[key];
    },
    search: function(url, params) {
      var deferred = $q.defer();
      // Make sure slashes are correctly escaped
      if (params.f) {
        params.f = params.f.replace(/\//g, '\\/');
      }
      $rootScope.loading = true;
      // $rootScope.promises is used by angular-busy to show and hide loading/saving indicators
      $rootScope.promises.search = $http.get(url, { params: params, headers: utilsService.noCacheHeaders }).success(function(data) {
        $rootScope.loading = false;
        deferred.resolve(data);
      }).error(function(data, status) {
        $rootScope.loading = false;
        deferred.reject(status);
      });
      return deferred.promise;
    }
  };
});
