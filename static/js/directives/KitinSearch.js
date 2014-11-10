/*

Creates autocomplete search 

Params:
  service-url: (str) path to serive after API_URL
  make-reference: (bool) decorate reference data
  template-id: (str) jquery template id
  filter: (str) filters for search result

*/

kitin.directive('kitinSearch', function(definitions, editService, $rootScope) {

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
    restrict: 'E',
    require: '^kitinEntity',
    replace: true,
    template: '<span class="search"><input type="text" placeholder="Lägg till" /></span>',
    link: function(scope, elem, attrs, kitinEntity) {

      elem = elem.is('input') ? elem : elem.find('input');

      var linker = kitinEntity;

      // TODO: IMPROVE: replace current autocomplete mechanism and use angular
      // templates ($compile).. If that is fast enough..
      var filterParams = attrs.filter ? {filter: attrs.filter } : {};
      var makeReferenceOnItemSelect = attrs.hasOwnProperty('makeReference');

      var template = _.template(jQuery('#' + attrs.templateId).html());
      var searchedValue = null;

      options = {
        inputClass: null,
        remoteDataType: 'json',
        selectFirst: true,
        autoWidth: null,

        showResult: function (value, data) {
          return template({
            data: data, value: value, nameRepr: nameRepr, truncate: truncate, isLinked: scope.isLinked
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
          if(makeReferenceOnItemSelect) {
            editService.makeReferenceEntity(item.data._source).then(function(referenced) {
              linker.doAdd(referenced);
            });
          } else {
            linker.doAdd(_.isEmpty(item.data) ? item.value : item.data);
          }
          
          
          delete item.data._source;
          scope.$apply();
          scope.$emit('changed', ['Added search entity']);
        }
      };

      if (attrs.serviceUrl) {

        var serviceUrl = $rootScope.API_PATH + attrs.serviceUrl;

        options.filterResults = false;
        options.sortResults = false;
        options.useCache = false;
        options.extraParams = filterParams;

        options.beforeUseConverter = function (value) {
          searchedValue = value; // Store searched value
          return value + '*';
        };

        options.processData = function (doc) {
          var result = [];
          if (doc && doc.list) {
            result = doc.list.map(function(item) {
              var data = item.data.about;
              // Store reference to orignal object, need to access record properties in making entity reference. 
              data._source = item.data;
              return {value: item.data.about.prefLabel, data: data};
            });
          }
          if(attrs.allowNonAuth === 'true') {
            // !TODO Add propper lookup against entity definitions
            result.unshift({ 
              value: searchedValue, 
              data: editService.createObject(scope.$parent.type, searchedValue)
            });
          }
          return result;
        };

        elem.autocomplete(serviceUrl, options);

      } else {
        var source = attrs.source;
        var data = {items: []};
        var sourceCfg = sourceConfiguration[source];

        options.data = data;
        options.minChars = 1;
        options.mustMatch = true;
        options.useCache = true;
        options.maxItemsToShow = 0; // show all

        options.beforeUseConverter = function (value) {
          searchedValue = value; // Store searched value
          return value + '*';
        };

        options.processData = function (doc) {
          var result = [];
          if(doc && doc.items && doc.items.length > 0) {
            result = doc.items;
          }
          if(attrs.allowNonAuth === 'true' && searchedValue) {
            result.unshift({ 
              value: searchedValue, 
              data: searchedValue
            });
          }
          return result;
        };

        options.filter = function (result, inputval) {
          if(sourceCfg) {
            var data = result.data;
            var label = data[sourceCfg.labelKey].toLowerCase();
            var code = data[sourceCfg.codeKey].toLowerCase();
            var sel = inputval.toLowerCase();
            return label.indexOf(sel) === 0 || code.indexOf(sel) === 0;
          } else {
            return true;
          }
        };

        elem.autocomplete(options);
        elem.on('focus', function () {
          if(source) {
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
          }
        });

      }

      elem.jkey('enter', function () {
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

});
