/*

Creates a textarea

Usage:
  <kitin-textarea model=""></kitin-textarea>

Params:
  model: (str)
  change-model: (str)

*/

kitin.directive('kitinTextarea', function(editService, $rootScope){
  return {
      restrict: 'E',
      scope: {
        model: '=model',
        changeModel: '@changeModel'
      },
      replace: true,
      template: '<textarea data-track-change="{{changeModel}}" data-ui-jq="autosize" spellcheck="false" data-ng-model="model"></textarea>',
      controller: function($scope, $rootScope, $attrs) {

      }
  };
});