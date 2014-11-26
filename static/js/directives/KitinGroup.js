/*

Wrapper for kitin-* elements.

Params:
  single: (bol) Creates a single element group (? TODO: Does it ?)
  initially-visible: (bol) When set, group is initially expanded

*/

kitin.directive('kitinGroup', function(){
  return {
      restrict: 'E',
      scope: true,
      transclude: true,
      template: '<div class="{{className}}">' +
                  '<div class="group-title label">' +
                    '<span class="lbl">{{title | translate}}</span>' +
                    '<span class="inp"><button class="btn-link" ng-click="toggle()">' +
                      '<span><i class="{{classNames[hidden]}}"></i></span> {{hidden ? "Visa fler" : "Göm tomma"}} fält</button>' +
                    '</span>'+
                  '</div>' +
                  '<div ng-transclude></div>' +
                '</div>',
      controller: function($element, $scope, $attrs) {
        var isSingle = $attrs.hasOwnProperty('single');
        $scope.className = isSingle ? 'group single' : 'group';
        var initiallyVisible = $attrs.hasOwnProperty('initiallyVisible');
        $scope.hidden = initiallyVisible ? false : true;
        this.options = {
          hidden: $scope.hidden,
          single: isSingle
        };
         
        // Set title from attribute, look-up if its a variable
        try {
          // If the title is a string and contains non variable characters like spaces
          // $eval will throw an unexpected token exception, then use title attribute 
          title = $scope.$eval($attrs.title);
        } catch(error) {
          title = $attrs.title;
        }
        $scope.title = title || $attrs.title;
         
        
        $scope.classNames = {
          true: 'fa fa-chevron-down',
          false: 'fa fa-chevron-up'
        };
        $scope.toggle = function() {
          this.options.hidden = $scope.hidden = !$scope.hidden;
        }.bind(this);
      }
  };
});