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

kitin.directive('titleAndMainEntry', function(){
    return {
        restrict: 'C',
        templateUrl: '/partials/edit/bib/title_and_main_entry',
        controller: function($scope) {
            //controller for your sub area.
        }
    };
});

kitin.directive('publicationAndProduction', function(){
    return {
        restrict: 'C',
        templateUrl: '/partials/edit/bib/publication_and_production',
        controller: function($scope) {
            //controller for your sub area.
        }
    };
});

kitin.directive('identifier', function(){
    return {
        restrict: 'C',
        templateUrl: '/partials/edit/bib/identifier',
        controller: function($scope) {
            //controller for your sub area.
        }
    };
});

kitin.directive('physicalDescription', function(){
    return {
        restrict: 'C',
        templateUrl: '/partials/edit/bib/physical_description',
        controller: function($scope) {
        }
    };
});

kitin.directive('notes', function(){
    return {
        restrict: 'C',
        templateUrl: '/partials/edit/bib/notes',
        controller: function($scope) {
            //controller for your sub area.
        }
    };
});

kitin.directive('editSubject', function(){
    return {
        restrict: 'C',
        templateUrl: '/partials/edit/bib/subject',
        controller: function($scope) {
            //controller for your sub area.
        }
    };
});

kitin.directive('unknown', function(){
    return {
        restrict: 'C',
        templateUrl: '/partials/edit/bib/unknown',
        controller: function($scope) {
            //controller for your sub area.
        }
    };
});

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

// !TODO merge into linkedEntity?
kitin.directive('kitinDataTable', function(editUtil) {

  return {
    restrict: 'A',

    scope: true,

    compile: function(element, attrs) {
      // Parse headers
      var headers = attrs.tableHeaders.split(',');
      var headerTemplate = '';
      for (var i = 0; i < headers.length; i++) {
        headerTemplate += '<td><span class="lbl">' + headers[i] + '</span></td>';
      }

      // Parse columns
      var columns = attrs.tableColumns.split(',');
      var columnTemplate = '';
      for (var j = 0; j < columns.length; j++) {
        columnTemplate += '<td><label><input ng-model="object.' + columns[j] + '" data-inplace class="ng-pristine ng-valid" type="text" /></label></td>';
      }
      if(columnTemplate) {
        columnTemplate += '<td class="controls">' +
                  '<button class="btn-link deleter" data-ng-click="removeObject(' + attrs.tableModel + ', null, $index)">' +
                    '<i class="fa fa-times"></i>' +
                  '</button>' +
                '</td>';
      }

      // Add a add link
      var footerTemplate = '';
      if(typeof attrs.addable !== 'undefined') {
         footerTemplate = '<tfoot>' +
              '<tr>' +
                '<td colspan="' + columns.length + '">' +
                  '<button class="add-thing btn-link" data-ng-click="addObject(record.about, \'' +  attrs.linkMultiple + '\',\'' + attrs.ngSwitchWhen + '\',\'' + attrs.ngTarget + '\',\'' + attrs.ngSwitchWhen + '\')">Lägg till</button>' +
                '</td>' +
              '</tr>' +
            '</tfoot>';
      }

      // Create table template
      var template = '<table>' +
          '<tbody>' +
            '<tr>' + headerTemplate + '</tr>' +
            '<tr ng-repeat="object in ' + attrs.tableModel + '">' +
              columnTemplate + 
            '</tr>' +
          '</tbody>' +
          footerTemplate + 
        '</table>';

      element.html(template);
    },
    controller: function($element, $scope, $attrs) {
    }
  };
});     

kitin.directive('addable', function(editUtil){
  return {
      restrict: 'A',
      scope: true,
      compile: function(element, attrs) {
        editUtil.addableElements.push(attrs);
      }
  };
});

kitin.directive('elementAdder', function(editUtil) {
  return {
    restrict: 'C',
    require: 'editCtrl',
    scope: true,
    template: '<select ng-model="elementToAdd" ng-change="change()" ng-options="(element.linkMultiple+\',\'+element.ngSwitchWhen) for element in addableElements"></select>',
    controller: function($element, $scope, $attrs) {
      $scope.addableElements = editUtil.addableElements;
      
      $scope.change = function() {
        $scope.$parent.addObject($scope.$parent.record.about, $scope.elementToAdd.linkMultiple, $scope.elementToAdd.ngSwitchWhen, $scope.elementToAdd.ngTarget, $scope.elementToAdd.ngSwitchWhen);
        $scope.elementToAdd = null;
      };
    }
  };
});

kitin.directive('kitinLinkEntity', ['editUtil', function(editUtil) {

  return {
    restrict: 'A',

    scope: true,

    compile: function(element, attrs) {
      var multiple = !!(attrs.linkMultiple);
      var itemTag = element.is('ul, ol')? 'li' : 'div';
      var viewDiv = '<div ng-if="viewmode" ng-include="viewTemplate"></div>';
      var template;
      if (multiple) {
        template = '<'+ itemTag+' ng-if="objects" ng-repeat="object in objects"> ' +
            viewDiv + '</'+ itemTag +'>' +
          '<'+ itemTag +' ng-include="searchTemplate"></'+ itemTag +'>';
      } else {
        template = viewDiv +
          '<div ng-if="!viewmode" ng-include="searchTemplate"></div>';
      }
      element.html(template);
    },

    controller: function($element, $scope, $attrs) {

      $scope.viewTemplate = $attrs.viewTemplate;
      $scope.searchTemplate = $attrs.searchTemplate;
      $scope.type = $attrs.type;

      var linkKey = $attrs.link;
      var multiple = false;
      if ($attrs.linkMultiple) {
        linkKey = $attrs.linkMultiple;
        multiple = true;
      }
      var link = $scope.$eval(linkKey);
      $scope.link = link;
      $scope.multiple = multiple;

      var subj = $scope.$eval($attrs.subject);
      var obj = subj ? subj[link] : null;

      $scope.viewmode = !_.isEmpty(obj);

      if (multiple) {
        $scope.objects = obj;
      } else {
        $scope.object = obj;
        $scope.$watch($attrs.subject +'.'+ link, function (newVal, oldVal) {
          $scope.object = newVal;
        });
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

kitin.directive('kitinSearchEntity', ['definitions', function(definitions) {

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

  function getItems(sourceCfg, struct) {
    return _.map(struct[sourceCfg.indexKey], function (obj, code) {
      if (obj[sourceCfg.labelKey] === undefined)
        obj[sourceCfg.labelKey] = "";
      if (obj[sourceCfg.codeKey] === undefined)
        obj[sourceCfg.codeKey] = "";
      return {value: sourceCfg.repr(obj), data: obj};
    });
  }

  var itemsCache = {};

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

      options = {
        inputClass: null,
        remoteDataType: 'json',
        selectFirst: true,
        autoWidth: null,

        showResult: function (value, data) {
          return template({
            data: data, nameRepr: nameRepr, truncate: truncate, isLinked: scope.isLinked
          });
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
      };

      if (attrs.serviceUrl) {

        options.filterResults = false;
        options.sortResults = false;
        options.useCache = false;

        options.beforeUseConverter = function (value) {
          // TODO: set extraParams: filterParams instead once backend supports that
          var params = scope.$apply(filterParams);
          var result = _.reduce(params, function (res, v, k) {
            return v? res +"+"+ k +":" + v : res;
          }, value);
          return result;
        };

        options.processData = function (doc) {
          if (!doc|| !doc.list) {
            console.log("Found no results!"); // TODO: notify no match to user
            return [];
          }
          return doc.list.map(function(item) {
            return {value: item.data.controlledLabel, data: item.data};
          });
        };

        elem.autocomplete(attrs.serviceUrl, options);

      } else {
        var source = attrs.source;
        var data = {items: []};
        var sourceCfg = sourceConfiguration[source];

        options.data = data;
        options.minChars = 1;
        options.mustMatch = true;
        options.useCache = true;
        options.maxItemsToShow = 0; // show all

        options.processData = function (doc) {
          return data.items;
        };

        options.filter = function (result, inputval) {
          var data = result.data;
          var label = data[sourceCfg.labelKey].toLowerCase();
          var code = data[sourceCfg.codeKey].toLowerCase();
          var sel = inputval.toLowerCase();
          return label.indexOf(sel) === 0 || code.indexOf(sel) === 0;
        };

        elem.autocomplete(options);
        elem.on('focus', function () {
          var items = itemsCache[source];
          if (typeof items === 'undefined') {
            var loadingClass = elem.data('autocompleter').options.loadingClass;
            elem.addClass(loadingClass);
            definitions[source].then(function (struct) {
              elem.removeClass(loadingClass);
              data.items = itemsCache[source] = getItems(sourceCfg, struct);
            });
          } else {
            data.items = items;
          }
        });

      }

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
