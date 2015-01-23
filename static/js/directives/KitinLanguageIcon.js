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
      template: '<span ng-hide="model.langCode===\'zxx\'" title="{{model.prefLabel}}" class="fa-stack langIcon"><i class="fa fa-stack-2x fa-square-o"></i>' +
                '<strong class="fa-stack-1x">{{ iconTag }}</strong></span>',
      controller: function($scope, $rootScope, $attrs) {
        $scope.iconTag = '';

        if($scope.model.langTag) {
          $scope.iconTag = $scope.model.langTag;
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