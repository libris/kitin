/*

Creates a triggarable popover that listens to 'kitinPopEvent' to open and close.
Takes a subset of the as the Angular UI popover directive attributes:
    kitin-popover-title, kitin-popover-placement, kitin-popover-animation

Coloration is possible by setting classes on parent element:
    success, warning, failure, 

Usage:
  <div kitin-popover="Text top appear" kitin-popover-*=""></div>


*/

kitin.directive( 'kitinPopoverPopup', function () {
  return {
    restrict: 'EA',
    replace: true,
    scope: { title: '@', content: '@', placement: '@', animation: '&', isOpen: '&' },
    templateUrl: '/snippets/popover',
    controller: function($scope, $element, $timeout) {
      $scope.close = function() {
        // Find sibling <a> and emit event
        $timeout(function() {
          $element.siblings('a.help').triggerHandler('kitinPopEvent');
        });
      };
    }
  };
});

kitin.directive('kitinPopover', function kitinPopover ($tooltip, $timeout) {
  var tooltip = $tooltip('kitinPopover', 'kitinPopover', 'kitinPopEvent');
  return tooltip;
});
