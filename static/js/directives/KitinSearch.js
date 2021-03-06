/*

Creates autocomplete search for kitin-entity

Usage:
  <kitin-entity>
    <kitin-search filter=""></kitin-search>
  </kitin-entity>


Params:
  service-url: (str) path to serive after API_URL
  make-reference: (bool) decorate reference data
  template-id: (str) jquery template id
  filter: (str) filters for search result
  placeholder: (str) override default "Lägg till" placeholder
  allow-non-auth: (bool)

*/

kitin.directive('kitinSearch', function(definitions, editService, $rootScope, $q) {

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
    require: '?^^kitinEntity',
    replace: true,
    template: '<span class="search"><i class="fa fa-search"></i><input type="text" placeholder="{{placeholder}}" /></span>',
    link: function(scope, elem, attrs, kitinLinkEntity) {

      elem = elem.is('input') ? elem : elem.find('input');

      scope.placeholder = attrs.hasOwnProperty('placeholder') ? attrs.placeholder : 'Lägg till';
      // Try to parse non auth param, is a variable when ng-repeat for subjects
      var allowNonAuth = '';
      if(attrs.hasOwnProperty('allowNonAuth')) {
        try {
          allowNonAuth = scope.$eval(attrs.allowNonAuth);
        } catch(error) {
          allowNonAuth = attrs.allowNonAuth; 
        }
      }

      var linker = kitinLinkEntity;

      var filterParams = {};

      var setFilterParams = function() {
        var f = attrs.filter;
        if ( f ) {
          if ( linker.getType() ) {
            f = _.template(f)({ type: linker.getType() });
          }
          if ( /^\[.*\]$/.test(f) ) {
            // filter array (filters)
            filterParams.filters = scope.$eval(f);
          } else {
            // filter string (filter)
            filterParams.filter = f;
          }
        }
      };

      // add a select box for multiple types
      var types = linker.getTypes();

      if ( types.length > 1 ) {
        var select = angular.element('<select>').on('change', function(e) {
          var index = $('option:selected', this).attr('data-index');
          linker.setType(index);
          setFilterParams();
        });
        types.forEach(function(type, i) {
          select.append('<option data-index="'+i+'">'+type+'</option>');
        });
        elem.after($('<span>').addClass('select').append(select, '<i class="fa fa-caret-down"></i>'));
      }

      setFilterParams();

      // TODO: IMPROVE: replace current autocomplete mechanism and use angular
      // templates ($compile).. If that is fast enough..

      var makeReferenceOnItemSelect = attrs.hasOwnProperty('makeReference');

      var getNonAuthPrefix = function() {
        var nonAuthPrefix = allowNonAuth;
        if ( linker.getType() ) {
          nonAuthPrefix = _.template(allowNonAuth)({ type: linker.getType() });
        }
        return nonAuthPrefix;
      };

      var template = _.template(jQuery('#' + attrs.templateId).html());
      var searchedValue = null;

      var normalizeItem = function(item) {

        var deferred = $q.defer();

        // TODO: if multiple, else set object (and *link*, not copy (embed copy in view?)...)
        if(makeReferenceOnItemSelect) {
          editService.makeReferenceEntity(item.data._source).then(function(referenced) {
            deferred.resolve(referenced);
          });
        } else {
          if ( !_.isEmpty(item.data) ) {
            deferred.resolve(item.data);
          } else {
            deferred.resolve(item.value); // does this ever happen?
          }
        }
        return deferred.promise;
      };

      options = {
        inputClass: null,
        remoteDataType: 'json',
        selectFirst: true,
        autoWidth: null,

        showResult: function (value, data) {
          return template({
            data: data, 
            value: value, 
            nameRepr: nameRepr, 
            truncate: truncate, 
            isLinked: scope.isLinked, 
            nonAuthPrefix: getNonAuthPrefix()
          });
        },

        displayValue: function (value, data) {
          return "";
        },

        onNoMatch: function() {
          // TODO: create new?
        },

        onItemSelect: function(item, completer) {
          normalizeItem(item).then(function(result) {
            delete result._source;
            linker.doAdd(result);
            scope.$emit('changed', ['Added search entity']);
          });
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
          if (doc && doc.items) {
            result = doc.items.map(function(item) {
              var data = item.about;
              // Store reference to orignal object, need to access record properties in making entity reference. 
              data._source = item;
              return {value: item.about.prefLabel, data: data};
            });
          }

          if(attrs.hasOwnProperty('allowNonAuth') && attrs.allowNonAuth !== false) {
            result.unshift({ 
              value: searchedValue, 
              data: linker.doCreate(searchedValue)
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
          if(attrs.hasOwnProperty('allowNonAuth') && attrs.allowNonAuth !== false) {
            result.unshift({ 
              value: searchedValue, 
              data: linker.doCreate(searchedValue)
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
