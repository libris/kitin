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
