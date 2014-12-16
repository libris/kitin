/*

Creates a text row for displaying information

Usage:
  <kitin-valuedisplay model=""></kitin-textrow>

Params:
  model: (str)
  hide-label: (bool)
  label-prefix: (str)

*/

kitin.directive('kitinValuedisplay', function(editService, $rootScope){
  return {
      restrict: 'E',
      scope: {
        label: '=label',
        model: '=model'
      },
      require:  '?^^kitinGroup',
      replace: true,
      link: function(scope, element, attrs, kitinGroupCtrl) {
        scope.options = kitinGroupCtrl ? kitinGroupCtrl.options : null;
      },
      template: '<div class="valuedisplay">' + 
                  '<kitin-label label="label"></kitin-label>' +
                  '<kitin-value value="model"></kitin-value>' +
                '</div>',
      controller: function($scope, $rootScope, $attrs) {


      }
  };
});