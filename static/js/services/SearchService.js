/**
 * searchService
 *
 */
kitin.factory('searchService', function($http, $q, $rootScope) {
  return {
    pageSize: 10,
    facetLabels: { 
     'about.@type': 'Typer',
     'about.language.@id': 'Språk',
     'encLevel.@id': 'Beskrivningsnivå'
    },
    searchTypeIndex: {
      bib: {
        key: 'bib', 
        label: 'Libris',
        placeholder: 'Sök bland bibliografiskt material (på ISBN, titel, författare etc.)'
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
    search: function(url, params) {
      var deferred = $q.defer();
      // Make sure slashes are correctly escaped
      if (params.f) {
        params.f = params.f.replace(/\//g, '\\/');
      }
      // $rootScope.promises is used by angular-busy to show and hide loading/saving indicators
      $rootScope.promises.search = $http.get(url, { params: params }).success(function(data) {
        deferred.resolve(data);
      }).error(function(data, status) {
        deferred.reject(status);
      });
      return deferred.promise;
    }
  };
});