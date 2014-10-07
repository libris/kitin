kitin.directive('customPopover', function() {
  return {
    restrict: 'A',
    link: function (scope, el, attrs) {
      console.log(scope);
      scope.yoyo = 'foo';
    }
  };
});