kitin.directive('kitinGroup', function(editService){
  return {
      restrict: 'E',
      scope: true,
      transclude: true,
      template: '<div class="group">' +
                  '<div class="group-title label">' +
                    '<span class="lbl">{{title}}</span>' +
                    '<span class="inp"><button class="btn-link" ng-click="showAll()">Visa alla fält</button></span>' +
                  '</div>' +
                  '<div ng-transclude></div>' +
                '</div>',
      controller: function($element, $scope, $attrs) {
        $scope.title = $attrs.title;
        this.options = {
          hidden: true
        };
        $scope.showAll = function() {
          this.options.hidden = false;
        }.bind(this);
      }
  };
});