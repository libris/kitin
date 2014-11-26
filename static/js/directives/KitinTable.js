/*

Creates a table, with functionality to add new rows

Usage:
  <kitin-table titles="[]">
    <kitin-td>
      <kitin-textarea> ..or.. <kitin-entity> ..or.. any html
    </kitin-td>
  </kitin-table>

Params:
  model: (str)
  title: (str)
  titles: (string array) Titles to add to table columns 

*/

kitin.directive('kitinTable', function(editService){
  return {
   restrict: 'E',
      scope: {
        model: '=model'
      },
      require:  '^kitinGroup',
      replace: true,
      transclude: true,
      link: function(scope, element, attrs, kitinGroupCtrl) {
          scope.options = kitinGroupCtrl.options;
      },
      template: '<div class="label" ng-hide="shouldHideTable(model, options)">' + 
                  '<span class="lbl">{{title | translate}}</span>' +
                  '<div class="inp">' +
                    '<div class="datatable">' +
                      '<table>' +
                        '<thead>' +
                          '<tr class="thead" ng-if="titles.length">' +
                            '<th ng-repeat="title in titles">{{title | translate}}</th>' +
                          '</tr>' +
                        '</thead>' +
                        '<tbody>' +
                          '<tr kitin-tr-controls ng-transclude ng-repeat="(key, item) in model track by $index">' +
                          '</tr>' +
                        '</tbody>' +
                      '</table>'+
                      '<div class="adder">' +
                        '<a class="add" href="#" ng-click="addRow()"><i class="fa fa-plus-circle"></i> Lägg till rad</a>' +
                      '</div>' +
                    '</div>' + 
                  '</div>' + 
                '</div>',

      controller: function($scope, $rootScope, $attrs) {

        var hasValue = false;
        var savedOptionsHidden;

        $scope.shouldHideTable = function(model, options) {
          // always show for single rows
          if ( options.single ) {
            return false;
          }

          // reset hasValue if options.hidden has changed from false=>true
          if ( options.hidden && savedOptionsHidden === false ) {
            hasValue = false;
          }
          
          savedOptionsHidden = options.hidden;

          // never hide a field that has value, and save hasValue
          if ( _.isArray(model) && model.length > 0 && (!$rootScope.isEmpty(model[0]) || model[0] !== '' )) {
            hasValue = true;
            return false;
          }

          if ( !options.hidden || 
             ( options.hidden && hasValue )  ) { // don’t hide if the input has a value
            return false;
          }
          
          return true;
        };
       
        // TODO! Create object for each model. Use editService.createObject?
        var createObject = function(model) {
          return ['']; 
        };

        $scope.addRow = function(index) {
          return $scope.model.push(createObject());
        };

        $scope.removeRow = function(index) {
          return $scope.model.splice(index,1);
        };

        $scope.title = 'LABEL.' + $attrs.model;
        $scope.model = _.isArray($scope.model) && $scope.model.length > 0 ? $scope.model : createObject($attrs.model);
        if($attrs.titles) {
          $scope.titles = $scope.$eval($attrs.titles);
        }

      }
  };
});

/*
Adds ui controls to a table row, only used inside kitin-table

Usage:
  ...
    <tr kitin-tr-controls></tr>
  ...

Params:

*/
kitin.directive('kitinTrControls', ['$compile', function($compile) {
  return {
    // Type element isnt working since the transclude function is manipulating the element after its been added to the DOM
    // and a table needs to have correct <tr>-tags to render propperly
    restrict: 'AC',
    scope: false,
    link: function(scope, element, attrs, controller, transcludeFn) {
      transcludeFn(scope, function(clone) {
        element.empty();
        // Append button to each row
        var controls = angular.element(
          '<td class="actions">' + 
            '<a class="delete" data-ng-click="removeRow($index)"><i class="fa fa-times"></i></a>' + 
          '</td>');
        element.append(clone).append(controls);
        // Controls needs compiling to be bound to scope
        $compile(controls)(scope);
      });
    }
  };
}]);


/*
Creates a td-tag
This custom tag is needed since rendering of DOM with td-tags results in incorrect html

Usage:
  ...
    <kitin-td></kitin-td>
  ...

Params:

*/
kitin.directive('kitinTd', function(editService){
  return {
      restrict: 'E',
      scope: false,
      replace: true,
      transclude: true,
      template: '<td ng-transclude></td>'
  };
});

