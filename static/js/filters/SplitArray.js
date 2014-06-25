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