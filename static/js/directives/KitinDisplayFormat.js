/*

Creates a text row for displaying format

Usage:
  <kitin-display-format model=""></kitin-display-auth>

Params:
  model: (obj)

*/

kitin.directive('kitinDisplayFormat', function(editService, $rootScope){
  return {
      restrict: 'E',
      scope: {
        model: '=model'
      },
      replace: true,
      link: function(scope, element, attrs, kitinGroupCtrl) {
        scope.options = kitinGroupCtrl ? kitinGroupCtrl.options : null;
      },
      templateUrl: '/snippets/display-format',
      controller: function($scope, $rootScope, $attrs) {
        var src = $scope.model;
        var formats = {};

        _.each(src, function(format) {
          delete format['@type'];
          _.each(format, function(value, key) {
            if(!_.isArray(value) && !_.isObject(value))
              formats[key] = value;
            else if(_.isObject(value) && typeof value !== 'undefined') {
              var subProps = _.map(value, function (item) {
                return item['@id'];
              }).join(', ');

              if(subProps.length >= 1)
                formats[key] = subProps;
            }
          });
        });

        $scope.formats = formats;
        $scope.collapse = _.isEmpty(formats);

      }
  };
});