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


kitin.filter('splitArray', function() {
  return function(arr, lengthofsublist) {
    if (!angular.isUndefined(arr) && arr.length > 0) {
      var arrayToReturn = [];  
      var subArray=[]; 
      var pushed=true;      
      for (var i=0; i<arr.length; i++){
        if ((i+1)%lengthofsublist===0) {
          subArray.push(arr[i]);
          arrayToReturn.push(subArray);
          subArray=[];
          pushed=true;
        } else {
          subArray.push(arr[i]);
          pushed=false;
        }
      }
      if (!pushed)
        arrayToReturn.push(subArray);
      return arrayToReturn; 
    }
  };
}); 