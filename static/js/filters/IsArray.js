kitin.filter("isArray", function() {
  return function(input) {
    return angular.isArray(input);
  };
});