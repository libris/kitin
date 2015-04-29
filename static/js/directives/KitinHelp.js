/*

Creates a help element

Usage:
  <kitin-help model=""></kitin-help>

Params:
  model: (str)   (For now) A reference to a string in label_se.json. For convenience, 
                if string starts with 'LABEL.', this directive will replace that with 'HELP.''

*/

kitin.directive('kitinHelp', function (definitions) {
    return {
        restrict: 'E',
        scope: {
          'model': '=',
          'positioned': '='
        },
        replace: true,
        template: '<span class="kitin-help">' + 
                    '<a data-ng-class="classNames" href="#" data-ng-show="helpText" data-ng-click="click()" kitin-popover-placement="{{popoverPlacement}}" kitin-popover="{{helpText}}">' + 
                      '<i class="fa fa-question-circle"></i>' +
                    '</a>' +
                  '</span>',
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
            // Try to get helptext from labels json
            var helpModel = model.replace('LABEL','HELP');
            if(helpModel.indexOf('HELP') !== -1) {
              var translatedHelpText = $translate.instant(helpModel);
              if(translatedHelpText !== helpModel) {
                $scope.helpText = translatedHelpText;
              }
            }
            if(typeof $scope.helpText == 'undefined') {
              definitions.terms.then(function(terms) {
                var modelParts = model.split('.');
                var lastModel = modelParts[modelParts.length-1];
                var comment = terms.getComment(lastModel);
                if(comment && comment !== lastModel && comment !== '') {
                  $scope.helpText = comment;
                } else {
  
                  }
              });
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