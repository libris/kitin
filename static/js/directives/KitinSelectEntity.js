kitin.directive('kitinSelectEntity', ['definitions', 'editService', '$compile', function(definitions, editService, $compile) {

  return {
    require: '^kitinLinkEntity',

    restrict: 'A',
    replace: false,
    terminal: true, // skip other directives after this
    priority: 1000, // make sure this is directive compiled first


    link: function(scope, elem, attrs, kitinLinkEntity) {
      var linker = kitinLinkEntity;
      // Add model and change to track selection changed
      elem.attr('ng-model', 'selectedItem');
      elem.attr('ng-change', 'onSelected()');
      // Remove the attribute to avoid indefinite loop
      elem.removeAttr("kitin-select-entity"); 
      elem.removeAttr("data-kitin-select-entity");

      definitions.getDefinition(scope.filter).then(function(data) { 
        if(!data || !data.list || data.list.length === 0) {
          console.warn('No defintion loaded', scope.filter);
        }
        scope.objects = data.list;
      });

      // On selection chaned add item and reset
      scope.onSelected = function() {
        linker.doAdd(scope.$eval(attrs.selectedItemVariable));
        this.selectedItem = null;
      };

      $compile(elem)(scope);
    }
  };

}]);
