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

kitin.directive('kitinAutoselect', function(resources) {

  var getRepr = function (obj) {
    return obj.prefLabel + " (" + obj.langCode + ")";
  };

  var filter = function (result, inputval) {
    //var val = result.value.toLowerCase();
    var name = result.data.prefLabel.toLowerCase();
    var code = result.data.langCode.toLowerCase();
    var sel = inputval.toLowerCase();
    return name.indexOf(sel) === 0 || code.indexOf(sel) === 0 || name.indexOf('(' + sel) > -1;
  };

  var selectObject = function (scope, obj) {
    // FIXME: configure target to set in directive
    scope.record.about.instanceOf.language = obj;
    scope.$apply();
  };

  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      var templateId = attrs.kitinTemplate;
      var template = _.template(jQuery('#' + templateId).html());
      var data = {};

      // TODO: configure source in directive
      resources.langIndex.then(function(index) {
        // TODO: this is called twice, check resources..
        data.items = _.map(index.byId, function (obj, code) {
          return {value: getRepr(obj), data: obj};
        });
      });

      elem.autocomplete({
        data: data,
        minChars: 1,
        inputClass: null,
        remoteDataType: 'json',
        autoWidth: null,
        mustMatch: true,
        filter: filter,
        processData: function (data) {
          return data.items || [];
        },
        useCache: false,
        maxItemsToShow: 0, // show all
        showResult: function (value, data) {
          return template(data);
        },
        onItemSelect: function(item) {
          selectObject(scope, item.data);
        }
      });
    }
  };
});

kitin.directive('kitinAutocomplete', ['autoComplete', function(autocompleteService) {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {

      var conf = autocompleteService[attrs.kitinAutocomplete];
      var filterParams = attrs.kitinFilter;
      var addTo = attrs.kitinAddTo;

      /* TODO: IMPROVE: replace current autocomplete mechanism and use angular
      templates ($compile) all the way.. If it is fast enough.. */
      var template = _.template(jQuery('#' + conf.templateId).html());
      var selected = false;
      var isAuthorized = false;

      function toggleRelatedFieldsEditable(val) {
        $(elem).closest('.person').find('.authdependant').prop('disabled', val);
      }

      elem.autocomplete(conf.serviceUrl, {
        inputClass: null,
        remoteDataType: 'json',
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
            isAuthorized = false;
            selected = false;
            toggleRelatedFieldsEditable(false);
            console.log("Found no results!"); // TODO: notify no match to user
            return [];
          }
          return doc.list.map(function(item) {
            result = item.data;
            result['authorized'] = item.authorized;
            result['identifier'] = item.identifier;
            return {value: item.data.controlledLabel, data: result};
          });
        },  

        showResult: function (value, data) {
            return template({data: data});
        },

        onFinish: function() {
          if (selected && isAuthorized) {
            toggleRelatedFieldsEditable(true);
          } else {
            toggleRelatedFieldsEditable(false);
          }
        },

        displayValue: function (value, data) {
          if (addTo)
            return "";
          return value;
        },

        onNoMatch: function() {
          if (conf.scopeObjectKey)
            delete scope[conf.scopeObjectKey]['@id'];
          selected = false;
          isAuthorized = false;
          toggleRelatedFieldsEditable(false);
        },

        onItemSelect: function(item, completer) {
          selected = true;
          // TODO: do this (the isAuthorized part?) the angular way
          isAuthorized = !!item.data.authorized;
          // TODO: use add callbacks instead
          if (conf.scopeObjectKey) {
            var obj = scope[conf.scopeObjectKey];
            obj['@id'] = item.data.identifier;
            conf.objectKeys.forEach(function (key) {
              obj[key] = item.data[key];
            });
          } else if (addTo) {
            var owner = scope.$apply(addTo);
            owner.addObject(item.data);
          }
          scope.triggerModified();
          scope.$apply();
        }
      });
    }
  };
}]);
