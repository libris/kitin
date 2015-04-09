/*

Creates a language icon

Usage:
  <kitin-language-icon model=""></kitin-language-icon>

Params:
  model: (language obj)

*/

kitin.directive('kitinLanguageIcon', function(editService, $rootScope){
  return {
      restrict: 'E',
      scope: {
        model: '=model'
      },
      replace: true,
      template: '<span title="{{model.prefLabel}}" class="langIcon">' +
                '<strong>{{ iconTag }}</strong></span> ',
      controller: function($scope, $rootScope, $attrs) {
        $scope.iconTag = '';

        if($scope.model.langCode) {
          $scope.iconTag = $scope.model.langCode;
        }
        else if ($scope.model.langCode === 'und')
          // Language is undefined
          $scope.iconTag = '?';
        else if ($scope.model.langCode === 'mul')
          // Multiple languages
          $scope.iconTag = '*';
        else {
          $scope.iconTag = '+';
        }

      }
  };
});