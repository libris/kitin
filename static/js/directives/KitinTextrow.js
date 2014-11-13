kitin.directive('kitinTextrow', function(editService, $rootScope){
  return {
      restrict: 'E',
      scope: {
        model: '=model'
      },
      require:  '?^^kitinGroup',
      replace: true,
      link: function(scope, element, attrs, kitinGroupCtrl) {
        scope.options = kitinGroupCtrl ? kitinGroupCtrl.options : null;
      },
      //TODO, move into snippet?
      template: '<div class="label" ng-hide="shouldHide(model, options)">' + 
                  '<kitin-title title="title"></kitin-title>' +
                  '<span class="inp"><kitin-textarea model="model"></kitin-textarea></span>' +
                '</div>',
      controller: function($scope, $rootScope, $attrs) {

        if(!$attrs.hasOwnProperty('hideTitle')) {
          $scope.title = 'LABEL.' + $attrs.model;
        }

        var hasValue = false;
        var savedOptionsHidden;

        $scope.shouldHide = function(model, options) {

          // always show for single rows
          if ( !options || options.single ) {
            return false;
          }

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

      }
  };
});