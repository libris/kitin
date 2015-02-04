/*

Creates a text row for displaying record type

Usage:
  <kitin-display-header model=""></kitin-display-type>

Params:
  model: (record obj)

*/

kitin.directive('kitinDisplayHeader', function(editService, $rootScope, utilsService){
  return {
      restrict: 'E',
      scope: {
        model: '=model'
      },
      replace: true,
      template: '<div>' +
                '<h4 ng-if="model.about.attributedTo[\'@type\'] == \'Person\'">{{ model.about.attributedTo.name }} {{ model.about.attributedTo.familyName }}{{ model.about.attributedTo.familyName ? \', \' + model.about.attributedTo.givenName : model.about.attributedTo.givenName }}{{ model.about.attributedTo.birthYear ? \', \' + model.about.attributedTo.birthYear + \'-\' : \'\' }}{{ model.about.attributedTo.deathYear }}</h4>' +
                '<h2>{{ model.about.instanceTitle.titleValue }}</h2>' +
                '<h3> {{ model.about.instanceTitle.subtitle }} / {{ utils.composeCreator(model) }}</h3>' +
                '<kitin-display-type model="model"></kitin-display-type>' +
                '<hr></div>',
      controller: function($scope, $rootScope, $attrs) {
        $scope.utils = utilsService;
      }
  };
});