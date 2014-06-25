kitin.directive('kitinDataTable', function() {

  return {
    restrict: 'A',

    scope: true,

    compile: function(element, attrs) {
      var type = (attrs.defaultType ? attrs.defaultType : attrs.ngSwitchWhen);

      // Create table template
      var template = '<table ng-if="' + attrs.tableModel + '.length > 0">' +
          '<thead>' +
            '<tr ng-include="tableHeaderRowTemplate"></tr>' +
          '</thead>' +
          '<tbody ng-init="objects = ' + attrs.tableModel + '">' +
            '<tr ng-repeat="object in objects track by $index" ng-include="tableRowTemplate">' +
            '</tr>' +
          '</tbody>' +
          '<tfoot ng-if="' + (typeof attrs.addable !== 'undefined') + '">' +
              '<tr>' +
                '<td>' +
                  '<button class="add-thing btn-link" data-ng-click="addObject(record.about, \'' +  attrs.linkMultiple + '\',\'' + type + '\',\'' + attrs.ngTarget + '\',\'' + attrs.ngSwitchWhen + '\')">Lägg till</button>' +
                '</td>' +
              '</tr>' +
            '</tfoot>' +
        '</table>';

      element.html(template);
    },
    controller: function($element, $scope, $attrs) {
      $scope.tableHeaderRowTemplate = $attrs.tableHeaderRowTemplate;
      $scope.tableRowTemplate = $attrs.tableRowTemplate;

      // Add first row
      if($scope.record && typeof $attrs.addFirst !== 'undefined') {
        var dataEntity = $scope.record.about[$attrs.linkMultiple];
        if(dataEntity) {
          var type = (typeof $attrs.defaultType !== 'undefined' ? $attrs.defaultType : $attrs.ngSwitchWhen);
          if(dataEntity.length === 0 || (dataEntity[type] && dataEntity[type].length === 0)) {
            $scope.addObject($scope.record.about, $attrs.linkMultiple, type, null, type);
          }
        }
      }

      $scope.removeTableRow = function(index) {
        $scope.removeObject($scope.$eval($attrs.tableModel), null, index);
      };

    }
  };
});     
