/*

Creates a text row for displaying information

Usage:
  <kitin-valuedisplay label="" record=""></kitin-textrow>

Params:
  label: (str)
  record: (obj)

*/

kitin.directive('kitinValuedisplay', function(editService, $rootScope){
  return {
      restrict: 'E',
      transclude: true,
      scope: {
        label: '=label',
        record: '=record'
      },
      replace: true,
      templateUrl: '/snippets/valuedisplay',
      controller: function($scope, $rootScope, $attrs) {

      }
  };
});