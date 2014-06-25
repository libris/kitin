kitin.directive('kitinSearchEntity', ['definitions', 'editUtil', function(definitions, editUtil) {

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
          linker.doAdd(item.data);
          scope.$apply(onSelect);
          //scope.triggerModified();
        }
      };

      if (attrs.serviceUrl) {

        options.filterResults = false;
        options.sortResults = false;
        options.useCache = false;
        options.extraParams = scope.$eval(filterParams);

        options.beforeUseConverter = function (value) {
          searchedValue = value; // Store searched value
          return value + '*';
        };

        options.processData = function (doc) {
          var result = [];
          if (doc && doc.list) {
            result = doc.list.map(function(item) {
              return {value: item.data.about.prefLabel, data: item.data.about};
            });
          }
          if(attrs.allowNonAuth === 'true') {
            // !TODO Add propper lookup against entity definitions
            result.unshift({ 
              value: searchedValue, 
              data: editUtil.createObject(scope.$parent.type, searchedValue)
            });
          }
          return result;
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
