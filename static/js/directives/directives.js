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
          isbntools.checkIsbn(inputval).then(function(data) {
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
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      var templateId = attrs.kitinTemplate;
      var template = _.template(jQuery('#' + templateId).html());
      var ld = [{}];

      resources.languages.then(function(langdata) {
        ld['lang'] = langdata;
      });

      elem.autocomplete({
        data: ld,
        inputClass: null,
        remoteDataType: 'json',
        autoWidth: null,
        mustMatch: true,
        filter: function (result) {
          var tstr = result.value.toLowerCase();
          var name = tstr.split("!")[0];
          var code = tstr.split("!")[1].replace("(", "").replace(")", "");
          var inputval = $(elem).val().toLowerCase(); // Is this value accessible some other way?
          //console.log("name: ", name, ", code: ", code, ", tstr: ", tstr, ", inputval: ", inputval)
          //return (haystack.substr(0, needle.length) == needle);
          //if (tstr.substr(0, inputval.length) == inputval) {
          //   return true;
          //}
          if (wordStartsWith(inputval, name) || wordStartsWith(inputval,code) || inWordStartsWith(inputval,name)) {
              return true;
          }
          //if (tstr.indexOf(inputval) != -1) {
          //    return true;
          //}
          function wordStartsWith(input,val){
            if (val.substr(0, input.length) == input) {
                return true;
            }
            return false;
          }
          function inWordStartsWith(input,val){
            var wlist = val.split(" ");
            if (wlist.length > 1){
              for (i = 1; i < wlist.length; i++) {
                var tmp = wlist[i].replace("(", "").replace(")", "");
                if (tmp.substr(0, input.length) == input) {
                  return true;
                }
              }
            }
            return false;
          }
        },
        useCache: false,
        maxItemsToShow: 0, // Means show all

        processData: function (data) {
          var tmp = [];
          //var list = [{}];
          for (var key in data['lang']){
            var tmpstr = data['lang'][key] + "!(" + key + ")"; // Ugly, would like to build a json struct like in liststr example, but how grab the json in showresult?
            tmp.push(tmpstr);
            //var liststr = '{code:"' + key + '"},{name:"' + data["lang"][key] + '"}';
            //list.push(liststr);
          }
          return tmp;
        },
        showResult: function (data, value) {
          var dtmp = data;
          var name = dtmp.split("!")[0]; // Yeah, I know.
          var code = dtmp.split("!")[1];
          return template({name: name, code: code});
        },
        onItemSelect: function(item) {
          scope.record.about.instanceOf.language = item.value.split("!")[0] + " " + item.value.split("!")[1];
          scope.$apply();
        }
      });
    }
  };
});

kitin.directive('kitinAutocomplete',[ 'autoComplete', function(autocompleteService) {
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
