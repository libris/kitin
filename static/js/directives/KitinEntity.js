/*

Creates entity 

Usage:
  <kitin-entity model="">
    <kitin-select> ..or.. <kitin-search>
  </kitin-entity>
  

Params:
  model: (str)
  mutiple: (bool) allow multiple entries
  rich: (bool) sets this entity to rich (for advanced formatting)
  view: (str) view template snippet (detaults to generic)
  link: (str) link into model, typically model[link]. Used to enable data binding when in a ng-repeat
  type: (str) property @type, used when new object is created
  in-kitin-entity-row: (bool) handle special case when in kitin-entity-row (do to scope problems when using transclude)
*/

kitin.directive('kitinEntity', function(editService, $rootScope, $parse) {

  return {
    restrict: 'E',
    scope: true,
    replace: true,
    transclude: true,
    require: ['?^^kitinEntityrow', '?^^kitinGroup'],
    link: function(scope, element, attrs, parents) {
      // pass initial objects to parent
      if ( parents && parents.length ) {
        scope.$watch(scope.objects, function(a, b, ns) {
          parents.forEach(function(parent) {
            if ( parent && parent.passObjects ) {
              parent.passObjects(ns.objects);
            }
          });
        });
      }
    },
    template:   '<div class="{{classNames}}">' +
                  '<div ng-if="objects" ng-repeat="object in objects track by $index" class="{{innerClassNames}}"" ng-class="{auth: isLinked(object)}">' +
                    '<span class="inner" ng-include="viewTemplate"></span>' +
                    '<span class="controls"><a class="delete" data-ng-click="doRemove($index)"><i class="fa fa-times"></i></a></span>' +
                  '</div>' +
                  '<span ng-transclude></span>' +
                '</div>',

    controller: function($element, $scope, $attrs) {
      if($attrs.inKitinEntityRow) {
        // If in a kitin entity row, get attributes from scope
        angular.extend($attrs, $scope.attributes);
      }
      
      $scope.viewTemplate = $attrs.view || '/snippets/view-generic-linked-entity';
     
      $scope.searchTemplate = $attrs.search;

      var parts = $attrs.model.split('.');

      $scope.property = $scope.property || _.last(parts);
      // attrs.link = is in ng-repeat, eval link and use as link into subject else use last part of model
      $scope.link = $attrs.link ? $scope.$eval($attrs.link) : _.last(parts); 
      $scope.multiple = $attrs.hasOwnProperty('multiple') && $attrs.multiple !== false;

      // attrs.link = is in ng-repeat, use full model else typically use about.record
      var subject = $attrs.link ? $attrs.model : parts.slice(0, parts.length-1).join('.'); 
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
        }
      } else {
        $scope.objects = null;
      }

      var classNames = ['entity'];
      var innerClassNames = ['entity-content'];
      if ( $attrs.hasOwnProperty('rich') && $attrs.rich !== false) {
        classNames.push('rich');
      } else {
        classNames.push('tags');
        innerClassNames.push('tag');
      }
      if ( $scope.multiple ) {
        classNames.push('multiple');
      }

      $scope.classNames = classNames.join(' ');
      $scope.innerClassNames = innerClassNames.join(' ');

      this.doAdd = function(data) {
        var added = editService.addObject(subj, $scope.link, $scope.property, $scope.multiple, data);

        if ($scope.multiple) {
          $scope.objects = added;
        } else {
          $scope.objects = [added];
        }
        $scope.$emit('entity', $scope.objects);
        $scope.viewmode = true;
      };

      this.doCreate = function(initialValue) {
        var type = $attrs.type;
        // For subjects, creation is in an ng-repeat. Then try to eval variable to get type value from scope attribute
        try { type = $scope.$eval($attrs.type); } catch(error) {}
        if(_.isUndefined(type)) {
          type = $attrs.type;
        }
        return editService.createObject($scope.property, type, initialValue);
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
        $scope.$emit('entity', $scope.objects);
      };

    }
  };
});