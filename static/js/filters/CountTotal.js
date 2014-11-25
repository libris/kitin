kitin.filter('countTotal', function() {
  return function (totals) {
    if(_.isObject(totals)) {
        return _.reduce(totals, function(sum, num) {
          return sum + num;
        });
      } else {
        return totals;
      }
  };
});