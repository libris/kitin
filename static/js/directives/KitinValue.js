/*

Creates a value element

Usage:
  <kitin-label value=""></kitin-label>

Params:
  value: (str)

*/

kitin.directive('kitinValue', function(editService, $rootScope){
  return {
      restrict: 'E',
      scope: {
        value: '=value'
      },
      replace: true,
      template: '<span class="val">{{value}}</span>',
  };
});
