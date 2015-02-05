/*

Creates a text row for displaying a bib header

Usage:
  <kitin-bib-header model=""></kitin-bib-header>

Params:
  model: (record obj)

*/

kitin.directive('kitinBibHeader', function(editService, $rootScope, utilsService){
  return {
    restrict: 'E',
    scope: {
      record: '=record'
    },
    replace: true,
    templateUrl: '/snippets/bib-header',
    link: function(scope, elem, attrs) {
      if (attrs.hasOwnProperty('static')) {
        scope.disableLinks = true;
      }
      else {
        scope.disableLinks = false;
      }
    }
  };
});