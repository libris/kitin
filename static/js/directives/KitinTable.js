kitin.directive('kitinTable', function(editService){
  return {
   restrict: 'E',
      scope: {
        model: '=model'
      },
      require:  '^kitinGroup',
      replace: true,
      transclude: true,
      link: function(scope, element, attrs, kitinGroupCtrl, transcludeFn) {
        scope.options = kitinGroupCtrl.options;
      },
      template: '<div class="label" ng-hide="shouldHideTable(model, options)">' + 
                  '<span class="lbl">{{title | translate}}</span>' +
                  '<span class="inp">' +
                    '<table>' +
                      '<thead>' +
                        '<tr class="thead" ng-if="titles.length">' +
                          '<th ng-repeat="title in titles">{{title}}</th>' +
                        '</tr>' +
                      '</thead>' +
                      '<tbody>' +
                        '<tr kitin-tr-controls ng-transclude ng-repeat="(key, item) in model track by $index">' +
                        '</tr>' +
                      '</tbody>' +
                    '</table>' +
                  '</span>' + 
                  '<span class="act">' +
                    '<a href="" ng-click="addRow()">Lägg till fält</a>' +
                  '</span>' +
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
        $scope.title = 'LABEL.' + $attrs.model;


        // TODO! Create object for each model. Use editService.createObject?
        var createObject = function(model) { 
          console.log(model);
          return ['']; 
        };

        $scope.model = _.isArray($scope.model) && $scope.model.length > 0 ? $scope.model : createObject($attrs.model);

        $scope.addRow = function(index) {
          return $scope.model.push(createObject());
        };

        $scope.removeRow = function(index) {
          return $scope.model.splice(index,1);
        };

      }
  };
});


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
          '<td>' + 
            '<button class=btn-link deleter" data-ng-click="removeRow($index)"><i class="fa fa-trash-o"></i></button>' + 
          '</td>');
        element.append(clone).append(controls);
        // Controls needs compiling to be bound to scope
        $compile(controls)(scope);
      });
    }
  };
}]);

kitin.directive('kitinTd', function(editService){
  return {
      restrict: 'E',
      scope: false,
      replace: true,
      transclude: true,
      template: '<td ng-transclude></td>'
  };
});

