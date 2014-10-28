kitin.directive('kitinGroup', function(editService){
  return {
      restrict: 'E',
      scope: true,
      compile: function(element, attrs) {
        element.html(
          '<div ng-click="edit()">' +
            element.html() +
          '</div>' +
          '<button ng-show="!viewmode" class="btn btn-dark ng-scope" ng-click="view()">ok</button>'
        );
      },
      controller: function($element, $scope, $attrs) {
        $scope.viewmode = true;
        $scope.edit =  function() {
          if($scope.viewmode) { $scope.viewmode = false; }
        };
        $scope.view =  function() {
          if(!$scope.viewmode) { $scope.viewmode = true; }
        };
      }
  };
});