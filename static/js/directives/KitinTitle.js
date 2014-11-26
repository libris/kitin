/*

Creates a title element

Usage:
  <kitin-title title=""></kitin-title>

Params:
  title: (str)

*/

kitin.directive('kitinTitle', function(editService, $rootScope){
  return {
      restrict: 'E',
      scope: {
        title: '=title'
      },
      replace: true,
      template: '<span class="lbl">{{title  | translate}}</span>',
  };
});
