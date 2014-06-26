kitin.directive('elementAdder', function(editUtil) {
  return {
    restrict: 'A',
    require: 'editCtrl',
    scope: true,
    template: '<li class="dropdown">' +
                '<a class="btn btn-grey btn-sm dropdown-toggle" title="Lägg till fält">' +
                  'Lägg till fält' +
                  '<i class="icon fa fa-caret-down"></i>' +
                '</a>' +
                '<ul class="dropdown-menu pull-right">' +
                  '<li ng-repeat="element in addableElements">' +
                    '<a ng-click="change(element)" href="">{{getElementLabel(element)}}</a>' +
                  '</li>' +
                '</ul>' +
              '</li>',
    //<select class="form-control" ng-model="elementToAdd" ng-change="change()" ng-options="getElementLabel(element) for element in addableElements"><option value="" selected>Lägg till</option></select>',
    controller: function($element, $scope, $attrs, $translate) {
      $scope.addableElements = $attrs.elementAdder !== '' ? editUtil.addableElements[$attrs.elementAdder] : editUtil.addableElements;
      $scope.change = function(element) {
        var type = (element.defaultType ? element.defaultType : element.ngSwitchWhen);
        $scope.$parent.addObject($scope.$parent.record.about, element.linkMultiple, type, element.ngTarget, element.ngSwitchWhen);
        $scope.elementToAdd = null;
      };

      $scope.getElementLabel = function(element) {
        var label = element.linkMultiple + ' ' || '';
        // Translated header
        if(element.tableHeaderTranslatePrefix) {
          var translation = $translate.instant(element.tableHeaderTranslatePrefix);
          if(translation !== element.tableHeaderTranslatePrefix) {
            return label + translation;
          }
        } 
        // Ng switch value
        if(element.ngSwitchWhen){
          return label + element.ngSwitchWhen;
        }
        // Default type
        if(element.defaultType) {
          return label + element.defaultType;
        } 
        return label;
      };
    }
  };
});