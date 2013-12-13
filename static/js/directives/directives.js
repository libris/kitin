var kitin = angular.module('kitin.directives', []);
/**
 * directives.js
 */

/* If we use bootstrap popover, we may use angular directive like so:
kitin.directive('popover', function(expression, compiledElement) {
  return function(linkElement) {
      linkElement.popover();
  };
});
*/

kitin.directive('inplace', function () {
  return function(scope, elm, attrs) {
    elm.keyup(function () { // or change (when leaving)
      scope.triggerModified();
      scope.$apply();
    });
    elm.jkey('enter', function () {
      if (scope.editable) {
        scope.editable = false;
        scope.$apply();
      }
      this.blur();
    });
  };
});

kitin.directive('isbnvalidator', function(isbnTools) {
  return {
    require: 'ngModel',
    restrict: 'A',
    link: function(scope, element, attributes, controller) {
     var ptn = attributes.isbnPattern;
     var regex = new RegExp(ptn);
     controller.$parsers.unshift(function(viewValue) {
        controller.$setValidity('invalid_length', true);
        var valid = regex.test(viewValue);
        controller.$setValidity('invalid_value', valid);
        return viewValue;
      });
      element.bind('blur', function() {
       var inputval = $(element).val();
       // Skip this check or put it in the service somehow
       /*if (inputval.length != 0 && inputval.length != 10 && inputval.length != 13){
           controller.$setValidity('invalid_length', false);
           scope.$apply();
           console.log("Frontend says wrong length");
        }
        else {*/
          isbnTools.checkIsbn(inputval).then(function(data) {
            if (data.isbn) {
              var approved = data.isbn.valid;
              if (approved) {
                $(element).val(data.isbn.formatted);
              }
              else {
                controller.$setValidity('invalid_value', false);
              }
            }
            });
        //}
      });
    }
  };
});


kitin.directive('kitinAutoselect', function(definitions) {

  var sourceConfiguration = {
    relators: {
      labelKey: 'label',
      codeKey: 'notation',
      indexKey: 'byNotation',
      repr: function (obj) {
        return obj.label + " (" + obj.notation + ")";
      }
    },
    languages: {
      labelKey: 'prefLabel',
      codeKey: 'langCode',
      indexKey: 'byCode',
      repr: function (obj) {
        return obj.prefLabel + " (" + obj.langCode + ")";
      }
    }
  };

  function getItems(source, struct) {
    var sourceCfg = sourceConfiguration[source];
    return _.map(struct[sourceCfg.indexKey], function (obj, code) {
      if (obj[sourceCfg.labelKey] === undefined)
        obj[sourceCfg.labelKey] = "";
      if (obj[sourceCfg.codeKey] === undefined)
        obj[sourceCfg.codeKey] = "";
      return {value: sourceCfg.repr(obj), data: obj};
    });
  }

  var itemsCache = {};

  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      var subj = scope.$eval(attrs.subject);
      var link = attrs.link;
      var source = attrs.source;
      var templateId = attrs.template;
      var template = _.template(jQuery('#' + templateId).html());

      var data = {items: []};

      var sourceCfg = sourceConfiguration[source];

      elem.autocomplete({
        data: data,
        minChars: 1,
        inputClass: null,
        remoteDataType: 'json',
        autoWidth: null,
        selectFirst: true,
        mustMatch: true,
        useCache: true,
        filter: function (result, inputval) {
          //var val = result.value.toLowerCase();
          var data = result.data;
          var label = data[sourceCfg.labelKey].toLowerCase();
          var code = data[sourceCfg.codeKey].toLowerCase();
          var sel = inputval.toLowerCase();
          return label.indexOf(sel) === 0 || code.indexOf(sel) === 0 || label.indexOf('(' + sel) > -1;
        },
        processData: function (data) {
          return data.items;
        },
        maxItemsToShow: 0, // show all
        showResult: function (value, data) {
          return template(data);
        },
        onItemSelect: function(item) {
          subj[link] = item.data;
          scope.$apply();
        }
      });

      elem.on('focus', function () {
        var items = itemsCache[source];
        if (typeof items === 'undefined') {
          var loadingClass = elem.data('autocompleter').options.loadingClass;
          elem.addClass(loadingClass);
          definitions[source].then(function (struct) {
            elem.removeClass(loadingClass);
            data.items = itemsCache[source] = getItems(source, struct);
          });
        } else {
          data.items = items;
        }
      });

    }
  };
});


kitin.directive('kitinLinkEntity', ['editUtil', function(editUtil) {

  var viewDiv = '<div ng-if="viewmode" ng-include="viewTemplate"></div>';
  var template =
      '<div ng-if="multiple">' +
        '<div ng-repeat="object in objects">' + viewDiv + '</div>' +
      '</div>' +
      '<div ng-if="!multiple">' + viewDiv + '</div>' +
      '<div ng-if="multiple || !viewmode" ng-include="searchTemplate"></div>';

  return {
    restrict: 'A',

    template: template,

    scope: true,

    controller: function($scope, $attrs) {

      $scope.viewTemplate = $attrs.viewTemplate;
      $scope.searchTemplate = $attrs.searchTemplate;
      $scope.type = $attrs.type;

      var link = $attrs.link;
      var multiple = false;
      if ($attrs.linkMultiple) {
        link = $attrs.linkMultiple;
        multiple = true;
      }
      $scope.link = link;
      $scope.multiple = multiple;

      var subj = $scope.$eval($attrs.subject);
      var obj = subj[link];

      $scope.viewmode = !_.isEmpty(obj);

      if (multiple) {
        $scope.objects = obj;
        $scope.object = null;
      } else {
        $scope.objects = null;
        $scope.object = obj;
      }

      this.doAdd = function (data) {
        var added = editUtil.addObject(subj, link, $scope.type, multiple, data);
        if (multiple) {
          $scope.objects = added;
        } else {
          $scope.object = added;
        }
        $scope.viewmode = true;
        $scope.$apply();
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

kitin.directive('kitinSearchEntity', [function() {

  function nameRepr(d) {
    return d.name || [d.familyName, d.givenName].join(', ');
  }

  function truncate(s, maxChars) {
    maxChars = maxChars || 70;
    return s.length > maxChars ? s.substr(0, maxChars) + '...' : s;
  }

  return {
    require: '^kitinLinkEntity',
    link: function(scope, elem, attrs, kitinLinkEntity) {
      var linker = kitinLinkEntity;

      // TODO: IMPROVE: replace current autocomplete mechanism and use angular
      // templates ($compile).. If that is fast enough..
      var filterParams = attrs.filter;
      var onSelect = attrs.onselect;
      var templateId = attrs.completionTemplate;
      var template = _.template(jQuery('#' + templateId).html());

      elem.autocomplete(attrs.serviceUrl, {
        inputClass: null,
        remoteDataType: 'json',
        selectFirst: true,
        autoWidth: null,
        filterResults: false,
        sortResults: false,
        useCache: false,

        beforeUseConverter: function (value) {
          // TODO: set extraParams: filterParams instead once backend supports that
          var params = scope.$apply(filterParams);
          var result = _.reduce(params, function (res, v, k) {
            return v? res +"+"+ k +":" + v : res;
          }, value);
          return result;
        },

        processData: function (doc) {
          if (!doc|| !doc.list) {
            console.log("Found no results!"); // TODO: notify no match to user
            return [];
          }
          return doc.list.map(function(item) {
            return {value: item.data.controlledLabel, data: item.data};
          });
        },

        showResult: function (value, data) {
          return template({data: data, nameRepr: nameRepr, truncate: truncate});
        },

        displayValue: function (value, data) {
          return "";
        },

        onNoMatch: function() {
          // TODO: create new?
        },

        onItemSelect: function(item, completer) {
          var owner = scope.subject;
          // TODO: if multiple, else set object (and *link*, not copy (embed copy in view?)...)
          linker.doAdd(item.data);
          scope.$apply(onSelect);
          //scope.triggerModified();
        }
      });

      elem.jkey('enter', function () {
        scope.$apply(onSelect);
        elem.val("");
      });

      elem.data('autocompleter').dom.$results[0].addEventListener('click', function(e) {
        if ( e.target.className == 'what' ) {
          e.stopPropagation();
          //window.open('http://google.com');
        }
      }, true);
    }
  };
}]);
