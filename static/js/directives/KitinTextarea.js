kitin.directive('kitinTextarea', function(editService, $rootScope){
  return {
      restrict: 'E',
      scope: {
            model: '=model'
      },
      require:  'model',
      replace: true,
      //TODO, move into snippet?
      template: '<div class="label">' + 
                  '<span ng-show="!$parent.viewmode || !isEmpty(model)" class="lbl">{{title  | translate}}</span>' +
                  '<textarea ng-show="!$parent.viewmode || !isEmpty(model)" data-inplace data-ui-jq="autosize" spellcheck="false" data-ng-model="model"></textarea>' +
                '</div>',
      controller: function($scope, $rootScope, $attrs){
        $scope.isEmpty = $rootScope.isEmpty;
        $scope.title = 'LABEL.' + $attrs.model;
        $scope.hideTitle = (typeof $attrs.hideTitle !== 'undefined');
      }
  };
});