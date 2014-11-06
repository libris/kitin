/*

Creates entity

Params:
  model: (str)
  mutiple: (bool) allow multiple entries
  rich: (bool) sets this entity to rich (for advanced formatting)
  view: (str) view template snippet (detaults to generic)
*/

kitin.directive('kitinEntity', function(editService, $rootScope) {

  return {
    restrict: 'E',
    scope: true,
    require: '^kitinGroup',
    replace: true,
    transclude: true,
    link: function(scope, element, attrs, kitinGroupCtrl) {
      scope.options = kitinGroupCtrl.options;
    },
    /*
    compile: function(element, attrs) {
      var multiple = !!(attrs.multiple);
      var collapsable = !!(attrs.collapsable);
      var itemTag = element.is('ul, ol')? 'li' : 'div';
      var viewDiv = '<div ng-if="viewmode" ng-include="viewTemplate"></div>';
      var nonAuth = 'ng-class="{\'non-auth\' : !isLinked(object) && !isInScheme(object)}"';
      var repeater = multiple ? 'ng-if="objects" ng-repeat="object in objects track by $index"' : 'ng-if="object"';
      var collapseButton = collapsable ? '<div collapse-button ng-init="objects=objects"></div>' : '';
      var collapse = collapsable ? ' collapse="doCollapse && $index !== 0" ' : '';
      var template =  collapseButton +
                      '<'+ itemTag + ' ' + collapse + ' ' + repeater + ' ' + nonAuth + '> ' +
                        viewDiv + 
                      '</'+ itemTag +'>' +
                      (collapsable ? '<'+ itemTag +' class="entity" ng-show="doCollapse">... Ytterligare {{objects.length-1}}</'+ itemTag +'>' : '') +
                      '<'+ itemTag +' ' + (multiple ? '' : 'ng-if="!viewmode"') + ' class="search" ng-include="searchTemplate"></'+ itemTag +'>';
      

      element.html(template);
    },
    */

    template: '<div class="{{className}}" ng-hide="shouldHide(objects, options)">' + 
                '<span class="lbl">{{title  | translate}}</span>' +
                '<div class="inp">' +
                  '<div ng-if="objects" ng-repeat="object in objects" class="entity-content">' +
                    '<span class="inner" ng-include="viewTemplate"></span>' +
                    '<span class="controls"><a class="delete" data-ng-click="doRemove($index)"><i class="fa fa-times"></i></a></span>' +
                  '</div>' +
                  '<span ng-transclude ng-init="label=title"></span>' +
                '</div>' +
              '</div>',

    controller: function($element, $scope, $attrs) {

      $scope.viewTemplate = $attrs.view;
      $scope.searchTemplate = $attrs.search;

      var parts = $attrs.model.split('.');

      if($attrs.filter) {
        $scope.filter = $attrs.filter.replace(/\//g,'\\/').replace(/-/g, '\\-');
      }

      $scope.type = $attrs.type || _.last(parts);
      $scope.link = _.last(parts);
      $scope.multiple = $attrs.hasOwnProperty('multiple');
      $scope.title = 'LABEL.' + $attrs.model;

      var classNames = ['entity label'];
      if ( $attrs.hasOwnProperty('rich') ) {
        classNames.push('rich');
      }
      if ( $scope.multiple ) {
        classNames.push('multiple');
      }
      $scope.className = classNames.join(' ');

      var hasValue = false;
      var savedOptionsHidden;

      $scope.shouldHide = function(objects, options) {

        // always show for single rows
        if ( options.single ) {
          return false;
        }

        // reset hasValue if options.hidden has changed from false=>true
        if ( options.hidden && savedOptionsHidden === false ) {
          hasValue = false;
        }
        
        savedOptionsHidden = options.hidden;

        // never hide a field that has value, and save hasValue
        if ( objects && objects.length ) {
          hasValue = true;
          return false;
        }

        if ( !options.hidden || 
           ( options.hidden && hasValue )  ) { // don’t hide if the input has a value
          return false;
        }
        
        return true;
      };

      var subject = parts.slice(0, 2).join('.');
      var subj = $scope.$eval(subject);

      var obj = subj ? subj[$scope.link] : null;

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

      this.doAdd = function (data) {
        var added = editService.addObject(subj, $scope.link, $scope.type, $scope.multiple, data);
        if ($scope.multiple) {
          $scope.objects = added;
        } else {
          $scope.objects = [added];
        }
        $scope.viewmode = true;
        //if($scope.searchTemplate) { angular.element($scope.searchTemplate).focus(); }
        // Do this in Kitin[Search/Select]Entity.js instead
        //$scope.$emit('changed', ['Added linked entity']);
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