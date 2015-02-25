/*

Creates a help element

Usage:
  <kitin-help help=""></kitin-help>

Params:
  help: (str)   (For now) A reference to a string in label_se.json. For convenience, 
                if string starts with 'LABEL.', this directive will replace that with 'HELP.''

*/

kitin.directive('kitinHelp', function () {
    return {
        restrict: 'E',
        scope: {
          'help': '=',
          'positioned': '='
        },
        template: '<a data-ng-class="classNames" data-ng-show="hasHelpText" data-ng-click="click()" kitin-popover-placement="{{popoverPlacement}}" kitin-popover="{{helpText}}">' + 
                    '<i class="fa fa-question-circle"></i>' +
                  '</a>',
        link: function(scope, element, attrs) {
          if (angular.isDefined(attrs.positioned)) {
              scope.classNames.push('positioned');
              if (scope.$eval(attrs.positioned)) scope.classNames.push(scope.$eval(attrs.positioned));
          }
          scope.popoverPlacement = (angular.isDefined(attrs.popoverPlacement)) ? attrs.popoverPlacement : 'right';
        },
        controller: function($scope, $element, $translate, $timeout){
          $scope.hasHelpText = false;
          $scope.classNames = ['help', 'kitin-popover-trigger'];

          var help = $scope.help || false;
          var positioned = $scope.positioned || false;

          if (help && help.length > 0) {
            // This is mostly to keep it DRY, might change in the future
            var helpText = help.replace(/^LABEL\./, 'HELP.');
            helpText = $translate.instant(helpText);
            if (helpText) {
              $scope.helpText = helpText;
              $scope.hasHelpText = true;
            }
          }

          $scope.click = function() {
            // Find closest trigger and emit event
            $timeout(function() {
              $element.children('.kitin-popover-trigger').triggerHandler('kitinPopEvent');
            });
          };
       }
    };
});