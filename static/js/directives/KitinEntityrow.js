/*

Creates entity

Params:
  model: (str)
  mutiple: (bool) allow multiple entries
  rich: (bool) sets this entity to rich (for advanced formatting)
  view: (str) view template snippet (detaults to generic)
*/

kitin.directive('kitinEntityrow', function(editService, $rootScope) {

  return {
    restrict: 'E',
    scope: true,
    require: '?^^kitinGroup',
    replace: true,
    transclude: true,
    link: function(scope, element, attrs, kitinGroupCtrl) {
      scope.options = kitinGroupCtrl ? kitinGroupCtrl.options : null;
    },

    template: '<div class="{{className}}" ng-hide="shouldHide(objects, options)">' + 
                '<kitin-title title="title"></kitin-title>' +
                '<div class="inp">' +
                  '<kitin-entity in-kitin-entity-row="true">' +
                    '<span ng-transclude></span>' +
                  '</kitin-entity>' +
                '</div>' +
              '</div>',

    controller: function($element, $scope, $attrs) {
      // Set non two way bound parameters
      if(!$attrs.hasOwnProperty('hideTitle')) {
        $scope.title = 'LABEL.' + $attrs.model;
      }

      // Since we want scope to be inherit from parent, to do lookups for controller scope variables like record.
      // The only found solution where to set a in-kitin-entity-row parameter and pass attributes through the shared scope.
      $scope.attributes = {};
      angular.extend($scope.attributes, $attrs);
      $scope.attributes.multiple = $attrs.hasOwnProperty('multiple');

      var hasValue = false;
      var savedOptionsHidden;

      $scope.shouldHide = function(objects, options) {

        // always show for single rows or non-grouped entities
        if ( !options || options.single ) {
          return false;
        }

        // reset hasValue if options.hidden has changed from false=>true
        if ( options.hidden && savedOptionsHidden === false ) {
          hasValue = false;
        }
        
        savedOptionsHidden = options.hidden;

        // never hide a field that has value, and save hasValue
        if ( objects && objects.length ) {
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