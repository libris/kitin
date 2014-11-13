kitin.directive('kitinTextarea', function(editService, $rootScope){
  return {
      restrict: 'E',
      scope: {
        model: '=model'
      },
      replace: true,
      template: '<textarea data-track-change data-ui-jq="autosize" spellcheck="false" data-ng-model="model"></textarea>',
      controller: function($scope, $rootScope, $attrs) {

      }
  };
});