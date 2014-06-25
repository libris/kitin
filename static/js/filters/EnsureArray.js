kitin.filter('ensureArray', function() {
  return function (obj) {
    return (obj === undefined || obj.length !== undefined)? obj : [obj];
  };
});