/*

Creates an alert box

Usage:
  <kitin-alert level="" header="" message=""></kitin-alert>

Params:
  level: (str)
  header: (str)
  message: (str)
*/

kitin.directive('kitinAlert', function($rootScope){
  return {
      restrict: 'E',
      scope: {
        level: '=level',
        header: '=header',
        message: '=message'
      },
      replace: true,
      templateUrl: '/snippets/alert',
      controller: function ($scope, $attrs) {
      },
      link: function(scope, element, attrs) {
      }
  };
});