kitin.directive('kitinHelp', function () {
    return {
        restrict: 'E',
        scope: {
          'help': '=',
          'positioned': '='
        },
        template: '<a class="{{classNames}}" data-ng-show="hasHelpText" data-ng-click="click()" kitin-popover-placement="{{popoverPlacement}}" kitin-popover="{{helpText}}">' + 
                    '<i class="fa fa-question-circle"></i>' +
                  '</a>',
        link: function(scope, element, attrs) {
          if (typeof attrs.positioned == 'undefined') {
            scope.classNames = 'help';
          } else {
              scope.classNames = 'help positioned ' + scope.$eval(attrs.positioned);
          }
          scope.popoverPlacement = (typeof attrs.popoverPlacement == 'undefined') ? 'right' : attrs.popoverPlacement;
        },
        controller: function($scope, $element, $filter, $timeout){
          $scope.hasHelpText = false;
          $scope.classNames = 'help';

          var help = $scope.help || false;
          var positioned = $scope.positioned || false;

          if (help && help.length > 0) {
            // This is mostly to keep it DRY, might change in the future
            var helpText = help.replace('LABEL.', 'HELP.');
            helpText = $filter('translate')(helpText);
            if (helpText) {
              $scope.helpText = helpText;
              $scope.hasHelpText = true;
            }
          }

          $scope.click = function() {
            // Find <a> inside <kitin-help> and emit event
            $timeout(function() {
              $element.find('a.help').triggerHandler('kitinPopEvent');
            });
          };
       }
    };
});