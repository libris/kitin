kitin.directive('collapseButton', function(editUtil) {
  return {
    template: '<a ng-click="toggleCollapse()">{{buttonlinkText}} <i class="icon fa fa-caret-{{doCollapse?\'down\':\'up\'}}"></i></a>',
    link: function($scope, elm, attrs, controller) {
      // !TODO fix count update
      var count =  $scope.objects ? '(' + $scope.objects.length + ' st)' : '';
      var hideText = 'Dölj ' + count;
      var showText = 'Visa ' + count;
      $scope.$watch('doCollapse',function(newValue, oldValue) {
        $scope.buttonlinkText = newValue ? showText : hideText;
      });

      $scope.toggleCollapse = function() {
        $scope.doCollapse = !$scope.doCollapse;
      };

      $scope.collapse = function() {
        $scope.doCollapse = true;
      };

      $scope.expand = function() {
          $scope.doCollapse = false;
      };   
    }
  };
});