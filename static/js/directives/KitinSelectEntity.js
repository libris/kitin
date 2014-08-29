kitin.directive('kitinSelectEntity', ['definitions', 'editUtil', '$compile', function(definitions, editUtil, $compile) {

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

      // On selection chaned add item and reset
      scope.onSelected = function() {
        linker.doAdd(scope.$eval(attrs.selectedItemVariable));
        this.selectedItem = null;
      };

      $compile(elem)(scope);
    }
  };

}]);
