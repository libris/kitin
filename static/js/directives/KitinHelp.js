/*

Creates a help element

Usage:
  <kitin-help help=""></kitin-help>

Params:
  help: (str)   (For now) A reference to a string in label_se.json. For convenience, 
                if string starts with 'LABEL.', this directive will replace that with 'HELP.''

*/

kitin.directive('kitinHelp', function (definitions) {
    return {
        restrict: 'E',
        scope: {
          'model': '=',
          'positioned': '='
        },
        template: '<a data-ng-class="classNames" data-ng-show="helpText" data-ng-click="click()" kitin-popover-placement="{{popoverPlacement}}" kitin-popover="{{helpText}}">' + 
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
          $scope.classNames = ['help', 'kitin-popover-trigger'];

          var model = $scope.model || false;
          var positioned = $scope.positioned || false;

          if (model && model.length > 0) {
            // This is mostly to keep it DRY, might change in the future
            definitions.terms.then(function(terms) {
              var modelParts = model.split('.');
              var lastModel = modelParts[modelParts.length-1]
              var comment = terms.getComment(lastModel);
              if(comment !== lastModel) {
                $scope.helpText = comment;
              } else {
                // Try to get helptext from labels json
                var translatedHelpText = $translate.instant(model);
                if(translatedHelpText !== model) {
                  $scope.helpText = translatedHelpText;
                }
              }
            });
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