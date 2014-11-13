/*

Creates entity

Params:
  model: (str)
  mutiple: (bool) allow multiple entries
  rich: (bool) sets this entity to rich (for advanced formatting)
  view: (str) view template snippet (detaults to generic)
*/

kitin.directive('kitinEntity', function(editService, $rootScope, $parse) {

  return {
    restrict: 'E',
    scope: false,
    replace: true,
    transclude: true,
    template:   '<span>' +
                  '<div ng-if="objects" ng-repeat="object in objects" class="entity-content">' +
                    '<span class="inner" ng-include="viewTemplate"></span>' +
                    '<span class="controls"><a class="delete" data-ng-click="doRemove($index)"><i class="fa fa-times"></i></a></span>' +
                  '</div>' +
                  '<span ng-transclude></span>' +
                '</span>',

    controller: function($element, $scope, $attrs) {
      if($attrs.inKitinEntityRow) {
        // If in a kitin entity row, get attributes from scope
        angular.extend($attrs, $scope.attributes);
      }

      if(!$attrs.hasOwnProperty('hideTitle')) {
        $scope.title = 'LABEL.' + $attrs.model;
      }
      
      $scope.viewTemplate = $attrs.view || '/snippets/render-generic-linked-entity';
     
      $scope.searchTemplate = $attrs.search;

      var parts = $attrs.model.split('.');

      $scope.type = $scope.type || _.last(parts);
      // attrs.link = is in ng-repeat, eval link and use as link into subject else use last part of model
      $scope.link = $scope.link ? $scope.$eval($scope.link) : _.last(parts); 
      $scope.multiple = $attrs.hasOwnProperty('multiple') && $attrs.multiple !== false;

      // attrs.link = is in ng-repeat, use full model else typically use about.record
      var subject = $attrs.link ? $attrs.model : parts.slice(0, 2).join('.'); 
      // Get variable value from scope
      var subj = $scope.$eval(subject);
      // Get value out of linker in subject
      var obj = subj ? subj[$scope.link] : null;

      // If object is empty make sure object is set to scope
      $scope.viewmode = !_.isEmpty(obj);
      if(!_.isEmpty(obj)) {        
        if ($scope.multiple) {
          $scope.objects = obj;
        } else {
          $scope.objects = [obj];
          // ! what is this?
          /*
          if($attrs.subject[$scope.link]) {
            $scope.$watch($attrs.subject[$scope.link], function (newVal, oldVal) {
              if(typeof newVal !== 'undefined') {
                $scope.objects = [newVal];
              }
            });
          }
          */
        }
      } else {
        $scope.objects = null;
      }

      var classNames = ['entity label'];
      if ( $attrs.hasOwnProperty('rich') ) {
        classNames.push('rich');
      } else {
        classNames.push('tags');
      }
      if ( $scope.multiple ) {
        classNames.push('multiple');
      }
      $scope.className = classNames.join(' ');

      this.doAdd = function(data) {
        var added = editService.addObject(subj, $scope.link, $scope.type, $scope.multiple, data);

        if ($scope.multiple) {
          $scope.objects = added;
        } else {
          $scope.objects = [added];
        }
 
        $scope.viewmode = true;
      };

      $scope.doRemove = function (index) {
        var removed = null;
        if ($scope.multiple && _.isNumber(index)) {
          removed = subj[$scope.link].splice(index, 1)[0];
        } else {
          removed = subj[$scope.link];
          delete subj[$scope.link];
          $scope.objects = null;
          $scope.viewmode = false;
        }
        if (typeof subj.onRemove === 'function') {
          subj.onRemove($scope.link, removed, index);
        }
        $scope.$emit('changed', ['Removed linked entity']);
      };

    }
  };
});