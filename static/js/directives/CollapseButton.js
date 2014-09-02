kitin.directive('collapseButton', function(editUtil) {
  return {
    template: '<a ng-show="objects && objects.length>1" ng-click="toggleCollapse()">{{buttonlinkText}} <span>({{objects.length}}) st</span><i class="icon fa fa-caret-{{doCollapse?\'down\':\'up\'}}"></i></a>',
    link: function($scope, elm, attrs, controller) {

      var hideText = 'Dölj ';
      var showText = 'Visa ';
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