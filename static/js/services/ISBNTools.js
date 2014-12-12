/**
 * isbnTools
 *
 */
kitin.factory('isbnTools', function($http, $q, $rootScope, utilsService) {
  function doCheck(isbn) {
    var deferred = $q.defer();
    var url = $rootScope.API_PATH + "/_isxntool?isbn=" + isbn;
    $http.get(url, {headers: utilsService.noCacheHeaders}).success(function(data) {
      deferred.resolve(data);
    });
    return deferred.promise;
  }

  return {
    checkIsbn: function(isbn) {
      return doCheck(isbn);
    }
  };
});