/*

Creates kitin row

Params:
  title: optional title of the row
*/

kitin.directive('kitinRow', function(editService, $rootScope, $parse) {

  return {
    restrict: 'E',
    require: ['?^^kitinGroup'],
    replace: true,
    transclude: true,

    link: function(scope, element, attrs, kitinGroupCtrl) {
      scope.options = kitinGroupCtrl ? kitinGroupCtrl.options : null;
    },

    template: '<div class="label" ng-hide="shouldHide(objects, options)">' + 
                '<span class="lbl">{{title  | translate}}</span>' +
                '<div class="inp">' +
                  '<span ng-transclude></span>' +
                '</div>' +
              '</div>',
    controller: function($element, $scope, $attrs) {
      var hasValue = false;
      var savedOptionsHidden;
      $scope.title = $attrs.title;

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
          if ( !$rootScope.isEmpty($scope.model) ) {
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