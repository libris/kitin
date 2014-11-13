kitin.directive('kitinTextarea', function(editService, $rootScope){
  return {
      restrict: 'E',
      scope: {
        model: '=model'
      },
      replace: true,
      template: '<span class="inp"><textarea data-track-change data-ui-jq="autosize" spellcheck="false" data-ng-model="model"></textarea></span>',
      controller: function($scope, $rootScope, $attrs) {

      }
  };
});