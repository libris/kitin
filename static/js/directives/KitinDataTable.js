kitin.directive('kitinDataTable', function() {

  return {
    restrict: 'A',

    scope: true,

    compile: function(element, attrs) {
      var type = (attrs.defaultType ? attrs.defaultType : attrs.ngSwitchWhen);
      var collapsable = !!(attrs.collapsable);

      var collapseButton = collapsable ? '<div collapse-button ng-init="objects=objects"></div>' : '';
      var collapse = collapsable ? ' collapse="doCollapse && $index !== 0" ' : '';

      // Create table template
      var template = 
      '<div ng-init="objects = ' + attrs.tableModel + '">' +
      collapseButton +
      '<table ng-if="' + attrs.tableModel + '.length > 0">' +
          '<thead>' +
            '<tr ng-include="tableHeaderRowTemplate"></tr>' +
          '</thead>' +
          '<tbody>' +
            '<tr ' + collapse + 'ng-repeat="object in objects track by $index" ng-include="tableRowTemplate">' +
            '</tr>' +
            '<tr collapse="!doCollapse"><td>... Ytterligare {{objects.length-1}}</td></tr>' +
          '</tbody>' +
          '<tfoot ng-if="' + (typeof attrs.addable !== 'undefined') + '">' +
              '<tr>' +
                '<td>' +
                  '<button class="add-thing btn-link" data-ng-click="addObject(record.about, \'' +  attrs.linkMultiple + '\',\'' + type + '\',\'' + attrs.ngTarget + '\',\'' + attrs.ngSwitchWhen + '\')">Lägg till</button>' +
                '</td>' +
              '</tr>' +
            '</tfoot>' +
        '</table>' + 
        '</div>';

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
