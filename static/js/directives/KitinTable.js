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
                    '<table ng-init="m = createFirstRowIfEmpty(model)">' +
                      '<thead>' +
                        '<tr class="thead" ng-if="titles.length">' +
                          '<th ng-repeat="title in titles">{{title}}</th>' +
                        '</tr>' +
                      '</thead>' +
                      '<tbody>' +
                        '<tr kitin-tr-controls ng-repeat="item in m track by $index">' +
                        '</tr>' +
                      '</tbody>' +
                    '</table>' +
                '</div>',
      controller: function($element, $scope, $attrs, $rootScope) {
        $scope.isEmpty = $rootScope.isEmpty;
        $scope.title = 'LABEL.' + $attrs.model;
        $scope.titles = $scope.$eval($attrs.titles);
        $scope.createFirstRowIfEmpty = function(model) {
          return _.isArray(model) && model.length > 0 ? model : [{}];
        };

      }
  };
});


kitin.directive('kitinTrControls', [function() {
  return {
    // Type element isnt working since the transclude function is manipulating the element after its been added to the DOM
    // and a table needs to have correct <tr>-tags to render propperly
    restrict: 'AC',
    replace: true,
    link: function(scope, element, attrs, controller, transcludeFn) {

      transcludeFn(function(clone) {
        element.empty();
        // Append button to each row
        element.append(clone).append(
          '<td>' + 
            '<button class="btn-link deleter" data-ng-click="$parent.removeTableRow($index)">' +
              '<i class="fa fa-times"></i>' +
            '</button>' + 
          '<td>');
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

