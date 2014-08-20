kitin.directive('kitinLinkEntity', ['editUtil', function(editUtil) {

  return {
    restrict: 'A',

    scope: true,

    compile: function(element, attrs) {
      var multiple = !!(attrs.linkMultiple);
      var itemTag = element.is('ul, ol')? 'li' : 'div';
      var viewDiv = '<div ng-if="viewmode" ng-include="viewTemplate"></div>';
      var nonAuth = 'ng-class="{\'non-auth\' : !isLinked(object) && !isInScheme(object)}"';
      var template;
      if (multiple) {
        template = '<'+ itemTag+' ng-if="objects" ng-repeat="object in objects track by $index" ' + nonAuth + '> ' +
            viewDiv + '</'+ itemTag +'>' +
          '<'+ itemTag +' class="search" ng-include="searchTemplate"></'+ itemTag +'>';
      } else {
        template = viewDiv +
          '<div ng-if="!viewmode" class="search" ng-include="searchTemplate"></div>';
      }

      element.html(template);
    },

    controller: function($element, $scope, $attrs) {
      $scope.viewTemplate = $attrs.viewTemplate;
      $scope.searchTemplate = $attrs.searchTemplate;
      $scope.type = $attrs.type;

      var linkKey = $attrs.link;
      var multiple = false;
      if($attrs.linkMultiple) {
        linkKey = $attrs.linkMultiple;
        multiple = true;
      }
      var link = $scope.$eval(linkKey);
      $scope.link = link;
      $scope.multiple = multiple;

      var subj = $scope.$eval($attrs.subject);
      var obj = subj ? subj[link] : null;
      $scope.viewmode = !_.isEmpty(obj);
      if(!_.isEmpty(obj)) {        
        if (multiple) {
          $scope.objects = obj;
        } else {
          $scope.object = obj;
          $scope.$watch($attrs.subject +'.'+ link, function (newVal, oldVal) {
            $scope.object = newVal;
          });
        }
      } else {
        $scope.objects = null;
      }

      this.doAdd = function (data) {

        var added = editUtil.addObject(subj, link, $scope.type, multiple, data);
        if (multiple) {
          $scope.objects = added;
        } else {
          $scope.object = added;
        }
        $scope.viewmode = true;
        if($scope.searchTemplate) { angular.element($scope.searchTemplate).focus(); }
      };

      $scope.doRemove = function (index) {
        var removed = null;
        if (multiple && _.isNumber(index)) {
          removed = subj[link].splice(index, 1)[0];
        } else {
          removed = subj[link];
          delete subj[link];
          $scope.object = null;
          $scope.viewmode = false;
        }
        if (typeof subj.onRemove === 'function') {
          subj.onRemove(link, removed, index);
        }
        //$scope.triggerModified();
      };

    }
  };
}]);