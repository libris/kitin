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
      template: '<div class="label" ng-hide="shouldHide(model, options)">' + 
                  '<span class="lbl">{{title  | translate}}</span>' +
                  '<span class="inp"><textarea data-inplace data-ui-jq="autosize" spellcheck="false" data-ng-model="model"></textarea></span>' +
                '</div>',
      controller: function($scope, $rootScope, $attrs) {

        var hasValue = false;
        var savedOptionsHidden;

        $scope.shouldHide = function(model, options) {

          // reset hasValue if options.hidden has changed from false=>true
          if ( options.hidden && savedOptionsHidden === false ) {
            hasValue = false;
          }
          
          savedOptionsHidden = options.hidden;

          // never hide a field that has value, and save hasValue
          if ( !$rootScope.isEmpty(model) ) {
            hasValue = true;
            return false;
          }

          if ( !options.hidden || 
             ( options.hidden && hasValue )  ) { // don’t hide if the input has a value
            return false;
          }
          
          return true;
        };
        $scope.title = 'LABEL.' + $attrs.model;
        $scope.hideTitle = (typeof $attrs.hideTitle !== 'undefined');
      }
  };
});