kitin.directive('kitinGroup', function(editService){
  return {
      restrict: 'E',
      scope: true,
      transclude: true,
      template: '<div class="{{className}}">' +
                  '<div class="group-title label">' +
                    '<span class="lbl">{{title}}</span>' +
                    '<span class="inp"><button class="btn-link" ng-click="toggle()">' +
                      '<span>{{hidden ? "+":"–"}}</span> {{hidden ? "Visa alla" : "Göm tomma"}} fält</button>' +
                    '</span>'+
                  '</div>' +
                  '<div ng-transclude></div>' +
                '</div>',
      controller: function($element, $scope, $attrs) {
        var isSingle = $attrs.hasOwnProperty('single');
        $scope.className = isSingle ? 'group single' : 'group';
        $scope.hidden = true;
        this.options = {
          hidden: $scope.hidden,
          single: isSingle
        };
        $scope.title = $attrs.title;
        $scope.toggle = function() {
          this.options.hidden = $scope.hidden = !$scope.hidden;
        }.bind(this);
      }
  };
});