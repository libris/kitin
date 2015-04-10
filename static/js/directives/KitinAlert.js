/*

Creates an alert box

Usage:
  <kitin-alert level=""></kitin-alert>

Params:
  level: (str)
  header: (str)
*/

kitin.directive('kitinAlert', function($rootScope){
  return {
      restrict: 'E',
      scope: {
        level: '=level'
      },
      replace: true,
      transclude: true,
      templateUrl: '/snippets/alert',
      controller: function ($scope, $attrs) {
      },
      link: function(scope, element, attrs) {
      }
  };
});