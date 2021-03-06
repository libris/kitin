/*

Creates a group with a label and functionality to toggle visibility of child elements 

Usage:
  <kitin-group label="">
    <kitin-entityrow> ..or.. <kitin-textrow> ..or.. <kitin-table>
  </kitin-group>

Params:
  label: (str)
  help: (str)
  initially-visible: (bool) visible at start
  single: (bool) single element aka disable toggling functionality of children
*/


kitin.directive('kitinGroup', function(){
  return {
      restrict: 'E',
      scope: true,
      transclude: true,
      template: '<div class="{{className}}">' +
                  '<div class="group-title label">' +
                    '<kitin-label label="label" ng-if="label"></kitin-label>' +
                    '<span class="inp"><button class="btn-link" ng-click="toggle()">' +
                      '<span><i class="{{classNames[hidden]}}"></i></span> {{hidden ? "LABEL.gui.general.showMore" : "LABEL.gui.general.hideEmpty" | translate }} {{ "LABEL.gui.general.fields" | translate }}</button>' +
                    '</span>'+
                    '<kitin-help model="help"></kitin-help>' +
                  '</div>' +
                  '<div class="group-contents" ng-transclude></div>' +
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
         
        if($attrs.hasOwnProperty('label')) {
          var label = null;
          // Set label from attribute, look-up if its a variable
          try {
            // If the label is a string and contains non variable characters like spaces
            // $eval will throw an unexpected token exception, then use label attribute 
            label = $scope.$eval($attrs.label);
          } catch(error) {
            label = $attrs.label;
          }
          $scope.label = label || $attrs.label;
        }
         
        
        if($attrs.hasOwnProperty('help')) {
          var help = null;
          // Set help from attribute, look-up if its a variable
          try {
            // If the help is a string and contains non variable characters like spaces
            // $eval will throw an unexpected token exception, then use help attribute 
            help = $scope.$eval($attrs.help);
          } catch(error) {
            help = $attrs.help;
          }
          $scope.help = help || $attrs.help;
        }

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