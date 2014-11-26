/*

Creates selectbox for kitin-entity

Usage:
  <kitin-entity>
    <kitin-select filter=""></kitin-select>
  </kitin-entity>

Params:
  filter: (str) filters for search result

*/

kitin.directive('kitinSelect', function(definitions, editService, $rootScope, $compile) {

  var i=0;

  return {
    restrict: 'E',
    require: '?^^kitinEntity',
    replace: true,
    scope: {
      optionsModel: '=',
      changeModel: '@changeModel'
    },
    template: 
      '<span class="select">' +
        '<select data-track-change="{{changeModel}}" placeholder="Lägg till" ng-model="selectedItem" ng-change="onSelected()" ng-options="(item.about.prefLabel || item.about.prefLabel-en) for item in objects | orderBy:\'about.prefLabel\'">' +
          '<option class="placeholder"value="">Lägg till</option>' +
        '</select>' +
        '<i class="fa fa-caret-down"></i>' +
      '</span>',
    link: function(scope, elem, attrs, kitinEntity) {
      var linker = kitinEntity;

      scope.selectedItem = linker.model || '';

      // Load definitions
      if (attrs.filter) {
        definitions.getDefinition(attrs.filter).then(function(data) { 
          if(!data || !data.items || data.items.length === 0) {
            console.warn('No defintion loaded', attrs.filter);
          }
          scope.objects = data.items;
        });
      } else if (attrs.optionsModel) {
        var objects = scope.optionsModel;
        scope.objects = objects;
      }

      // On selection chaned add item and reset
      scope.onSelected = function() {
        linker.doAdd(scope.selectedItem.about);
        scope.$emit('changed', ['Added select entity']);
        this.selectedItem = null;
      };
    }
  };
});
