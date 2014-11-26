/*

Creates entity row

Usage:
  <kitin-entityrow model="">
    <kitin-select> ..or.. <kitin-search>
  </kitin-entityrow>

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

    template: '<div class="{{className}}" ng-hide="shouldHide(options, objects)">' + 
                '<kitin-title title="title" ng-if="title"></kitin-title>' +
                '<div class="inp">' +
                  '<kitin-entity in-kitin-entity-row="true">' +
                    '<span ng-transclude></span>' +
                  '</kitin-entity>' +
                '</div>' +
              '</div>',

    controller: function($element, $scope, $attrs) {
      // Set non two way bound parameters
      $scope.title = !$attrs.hasOwnProperty('hideTitle') ? 'LABEL.' + $attrs.model : false;

      // Since we want scope to be inherit from parent, to do lookups for controller scope variables like record.
      // The only solution found where to set a in-kitin-entity-row parameter and pass attributes through the shared scope.
      $scope.attributes = angular.extend({}, {
        model: $attrs.model,
        multiple: $attrs.hasOwnProperty('multiple'),
        rich: $attrs.hasOwnProperty('rich'),
        view: $attrs.view
      });

      var hasValue = false;
      var savedOptionsHidden;

      var classNames = ['label entity'];
      if ( $attrs.hasOwnProperty('rich') ) {
        classNames.push('rich');
      } else {
        classNames.push('tags');
      }
      if ( $scope.multiple ) {
        classNames.push('multiple');
      }

      $scope.className = classNames.join(' ');

      var childObjects = null;

      // listen for objects and changes
      this.passObjects = function(response) {
        childObjects = response;
        $scope.shouldHide($scope.options, response);
      };

      $scope.$on('entity', function(e, response) {
        this.passObjects(response);
      }.bind(this));

      $scope.shouldHide = function(options, objects) {

        // always show for single rows or non-grouped entities
        if ( !options || options.single ) {
          return false;
        }

        // reset hasValue if options.hidden has changed from false=>true
        if ( options.hidden && savedOptionsHidden === false ) {
          hasValue = false;
        }
        
        savedOptionsHidden = options.hidden;

        objects = objects || childObjects || null;

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