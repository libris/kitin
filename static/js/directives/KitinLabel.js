/*

Creates a label element

Usage:
  <kitin-label label=""></kitin-label>

Params:
  label: (str)

*/

kitin.directive('kitinLabel', function(editService, $rootScope){
  return {
      restrict: 'E',
      scope: {
        label: '=label'
      },
      replace: true,
      template: '<span class="lbl">{{label  | translate}}</span>'
  };
});
