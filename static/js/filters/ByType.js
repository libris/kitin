kitin.filter('byType', function() {
  return function (obj, type) {
    if (angular.isDefined(obj)) {
      for (var i in obj) {
        if (i === type) return obj[i];
      }
    }
  };
});