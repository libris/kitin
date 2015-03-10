/*

Creates a text row for displaying record type

Usage:
  <kitin-display-type model=""></kitin-display-type>

Params:
  model: (obj)

*/

kitin.directive('kitinDisplayType', function(editService, $rootScope){
  return {
      restrict: 'E',
      scope: {
        model: '=model'
      },
      replace: true,
      template: '<span class="record-type">' +
                  '{{ typeLabels }}' +
                  '<span data-ng-repeat="contentType in model.about.contentType">| {{ contentType.prefLabel }}</span>' +
                  '<span data-ng-if="formatLabels">, {{ formatLabels | translate }}</span>' +
                '</span>',
      controller: function($scope, $rootScope, $attrs) {
        function getFormatTypeLabel(obj) {
          var TYPE = '@type';
          if (typeof obj === "undefined") { 
            return; 
          }
          var formatTypeLabel = [];
          // Remove product
          var formats = _.filter(obj, function (format) { return format[TYPE] !== 'Product'; });
          // Get type for other formats
          if(formats.length === 1) {
            formatTypeLabel = formats[0][TYPE];
          }
          return formatTypeLabel.join(', ');
        }

        if($scope.model) {
          var isAukt = $scope.model['@id'] && $scope.model['@id'].indexOf('auth') !== -1 ? 'Aukt. ': '';

          $scope.typeLabels = isAukt + $rootScope.getTypeLabel($scope.model.about);
          $scope.formatLabels = getFormatTypeLabel($scope.model.about.hasFormat);
        }
      }
  };
});