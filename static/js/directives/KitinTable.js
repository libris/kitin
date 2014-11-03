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
      template: '<div class="label" ng-hide="isEmpty(model) && options.hidden">' + 
                  '<span class="lbl">{{title | translate}}</span>' +
                  '<span class="inp">' +
                    '<table ng-init="model = createFirstRowIfEmpty(model)">' +
                      '<thead>' +
                        '<tr class="thead" ng-if="titles.length">' +
                          '<th ng-repeat="title in titles">{{title}}</th>' +
                        '</tr>' +
                      '</thead>' +
                      '<tbody>' +
                        '<tr kitin-tr-controls ng-transclude ng-repeat="item in model track by $index">' +
                        '</tr>' +
                      '</tbody>' +
                    '</table>' +
                  '</span>' + 
                  '<span>' +
                    '<a href="" ng-click="addRow()">Lägg till fält</a>' +
                  '</span>' +
                '</div>',
      controller: function($element, $scope, $attrs, $rootScope) {
        
        $scope.isEmpty = $rootScope.isEmpty;
        $scope.title = 'LABEL.' + $attrs.model;
        $scope.titles = $scope.$eval($attrs.titles);

        // TODO! Create object for each model. Use editService.createObject?
        var createObject = function() { return {}; };

        $scope.createFirstRowIfEmpty = function(model) {
          return _.isArray(model) && model.length > 0 ? model : [createObject()]; 
        };

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
    link: function(scope, element, attrs, controller, transcludeFn) {
      transcludeFn(scope,function(clone) {
        element.empty();
        // Append button to each row
        var controls = angular.element(
          '<td>' + 
            '<button class=btn-link deleter" data-ng-click="removeRow($index)"><i class="fa fa-times"></i></button>' + 
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

