/*

Creates a text row for displaying an auth

Usage:
  <kitin-display-auth model=""></kitin-display-auth>

Params:
  model: (obj)

*/

kitin.directive('kitinDisplayAuth', function(editService, $rootScope){
  return {
      restrict: 'E',
      scope: {
        model: '=model'
      },
      replace: true,
      link: function(scope, element, attrs, kitinGroupCtrl) {
        scope.options = kitinGroupCtrl ? kitinGroupCtrl.options : null;
      },
      templateUrl: '/snippets/display-auth',
      controller: function($scope, $rootScope, $attrs) {
        
      }
  };
});