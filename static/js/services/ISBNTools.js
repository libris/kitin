/**
 * isbnTools
 *
 */
kitin.factory('isbnTools', function($http, $q) {
  function doCheck(isbn) {
    var deferred = $q.defer();
    var url = "/_isxntool?isbn=" + isbn;
    $http.get(url).success(function(data) {
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