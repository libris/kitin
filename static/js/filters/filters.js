/**
 * Filters
 */

var kitin = angular.module('kitin.filters', []);

kitin.filter('ensureArray', function() {
  return function (obj) {
    return (obj === undefined || obj.length !== undefined)? obj : [obj];
  };
});

// May be generalized at will
kitin.filter('chop', function() {
  return function(victim) {
    if (!victim) {
      victim = "";
    }
    if (victim.length < 99) {
      return victim;
    } else {
      return String(victim).substring(0, 93) + " [...]";
    }
  };
});

kitin.filter('chunk', function() {
  return function(toChunk) {
    return String(toChunk).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };
});
