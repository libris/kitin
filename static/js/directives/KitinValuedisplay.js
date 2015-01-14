/*

Creates a text row for displaying information

Usage:
  <kitin-valuedisplay model=""></kitin-textrow>

Params:
  model: (str)
  hide-label: (bool)
  label-prefix: (str)

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
      link: function(scope, element, attrs, kitinGroupCtrl) {
        scope.options = kitinGroupCtrl ? kitinGroupCtrl.options : null;
      },
      templateUrl: '/snippets/kitinvaluedisplay',
      controller: function($scope, $rootScope, $attrs) {
      }
  };
});