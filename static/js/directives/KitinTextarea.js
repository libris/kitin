kitin.directive('kitinTextarea', function(editService, $rootScope){
  return {
      restrict: 'E',
      scope: {
        model: '=model'
      },
      require:  '^kitinGroup',
      replace: true,
      link: function(scope, element, attrs, kitinGroupCtrl) {
        scope.options = kitinGroupCtrl.options;
      },
      //TODO, move into snippet?
      template: '<div class="label" ng-hide="isEmpty(model) && options.hidden">' + 
                  '<span class="lbl">{{title  | translate}}</span>' +
                  '<span class="inp"><textarea data-inplace data-ui-jq="autosize" spellcheck="false" data-ng-model="model"></textarea></span>' +
                '</div>',
      controller: function($scope, $rootScope, $attrs) {
        $scope.isEmpty = $rootScope.isEmpty;
        $scope.title = 'LABEL.' + $attrs.model;
        $scope.hideTitle = (typeof $attrs.hideTitle !== 'undefined');
      }
  };
});