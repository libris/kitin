/*

Creates a textarea row

Usage:
  <kitin-textrow model=""></kitin-textrow>

Params:
  model: (str)
  change-model: (str)
  hide-label: (bool)
  label-prefix: (str)
  always-visible: (bool) visible at start
  suggestion: (array) Array of objects:
                      i.e. [{ 'list' : record.about.classification, 'property' : 'notation' }]
                      List = array, Property = property to add as suggestions

*/

kitin.directive('kitinTextrow', function(editService, $rootScope){
  return {
      restrict: 'E',
      scope: {
        model: '=model',
        changeModel: '@changeModel',
        suggestion: '=suggestion'
      },
      require:  '?^^kitinGroup',
      replace: true,
      link: function(scope, element, attrs, kitinGroupCtrl) {
        scope.options = kitinGroupCtrl ? kitinGroupCtrl.options : null;
      },
      //TODO, move into snippet?
      template: '<div class="label" ng-hide="shouldHide(model, options)">' + 
                  '<kitin-label label="label"></kitin-label>' +
                  '<span class="inp"><kitin-textarea data-track-change="{{changeModel}}" model="model"></kitin-textarea></span>' +
                  '<kitin-help help="label"></kitin-help>' +
                  '<div ng-show="suggestions" class="suggestions"><span class="suggestion-label">Förslag</span><span class="item" title="Kopiera till fält" ng-repeat="suggestion in suggestions track by $index" ng-click="$parent.model = suggestion">{{ suggestion }}</span></div>' +
                '</div>',
      controller: function($scope, $rootScope, $attrs) {

        if(!$attrs.hasOwnProperty('hideLabel')) {
          if($attrs.hasOwnProperty('labelPrefix')) {
            $scope.label = $attrs.labelPrefix + $attrs.model;
          } else {
            $scope.label = 'LABEL.' + $attrs.model;
          }
        }


        if(typeof $scope.suggestion !== 'undefined') {
          // [{ 'list' ; '', 'property' : '' }]
          var tmpListFrom = $scope.suggestion; // Array from directive
          var tmpListTo = []; // new array

          for(var i = 0;i<tmpListFrom.length;i++) {
            var property = tmpListFrom[i].property;
            var currentList = tmpListFrom[i].list;

            if(typeof currentList !== 'undefined') {
              for(var x = 0;x<currentList.length;x++) {
                tmpListTo.push(currentList[x][property]);
              }
            }
            else {
              $scope.suggestions = '';
              return;
            }
          }
          $scope.suggestions = tmpListTo;
        }

        var hasValue = false;
        var savedOptionsHidden;

        $scope.shouldHide = function(model, options) {

          // always show for single rows
          if ( !options || options.single || $attrs.hasOwnProperty('alwaysVisible') ) {
            return false;
          }

          // reset hasValue if options.hidden has changed from false=>true
          if ( options.hidden && savedOptionsHidden === false ) {
            hasValue = false;
          }
          
          savedOptionsHidden = options.hidden;

          // never hide a field that has value, and save hasValue
          if ( !$rootScope.isEmpty(model) ) {
            hasValue = true;
            return false;
          }

          if ( !options.hidden || 
             ( options.hidden && hasValue )  ) { // don’t hide if the input has a value
            return false;
          }
          
          return true;
        };

      }
  };
});