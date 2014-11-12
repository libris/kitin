/*

Creates selectbox

Params:
  filter: (str) filters for search result

*/

kitin.directive('kitinSelect', function(definitions, editService, $rootScope, $compile) {

  var i=0;

  return {
    restrict: 'E',
    require: '^kitinEntity',
    replace: true,
    scope: false,
    template: 
      '<span class="select">' +
        '<select placeholder="Lägg till" ng-model="selectedItem" ng-change="onSelected()" ng-options="(item.data.about.prefLabel || item.data.about.prefLabel-en) for item in objects | orderBy:\'data.about.prefLabel\'">' +
          '<option class="placeholder"value="">Lägg till</option>' +
        '</select>' +
        '<i class="fa fa-caret-down"></i>' +
      '</span>',
    link: function(scope, elem, attrs, kitinEntity) {
      var linker = kitinEntity;

      scope.selectedItem = linker.model || '';

      // Load definitions
      definitions.getDefinition(attrs.filter).then(function(data) { 
        if(!data || !data.list || data.list.length === 0) {
          console.warn('No defintion loaded', attrs.filter);
        }
        scope.objects = data.list;
      });

      // On selection chaned add item and reset
      scope.onSelected = function() {
        linker.doAdd(scope.selectedItem.data.about);
        scope.$emit('changed', ['Added select entity']);
        this.selectedItem = null;
      };
    }
  };
});
