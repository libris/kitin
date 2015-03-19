/**
 * definitions
 * Get definitions lists from backend
 */
kitin.factory('definitions', function($http, $rootScope, $q) {
  
  /**
  * getDataset
  * @param    url       {String}    URL to dataset
  * @return   promise   {Object}          Angular JS promise, $q
  */
  function getDataset(url) {
    return {
      then: function (f) {
        $http.get(encodeURI(url), {cache: true}).then(function(response) {
          f(response.data);
        });
      }
    };
  }

  function getDefinition(filter) {
    filter = filter ? '+' + filter.replace(/\//g,'\\/').replace(/-/g, '\\-') : '';
    return getDataset(API_PATH + '/def/_search?q=*' + filter + '&n=10000');
  }

  function getEnumDefinition(collectionName) {
    return getDefinition('about.inCollection.@id:/def/enum/record/' + collectionName + '-collection');
  }

  // Defined definitions
  var definitions = {
    remotedatabases:  getDataset(API_PATH + "/_remotesearch?databases=list"),
    terms:            function() {
      
      var deferer = $q.defer();
      var ID = '@id';
      var TYPE = '@type';
      var TERMS_PATH = 'http://libris.kb.se/def/terms#';

      getDataset(API_PATH + "/def/terms").then(function(data) {
        var items = [];
        for (var key in data.index) { items.push(data.index[key]); }
        deferer.resolve({
          ID: ID,
          TYPE: TYPE,
          TERMS_PATH: TERMS_PATH,
          terms: data.index,
          items: items,
          termIndex: Gild.buildIndex(items),

          getTermToken: function (obj) {
            var id = obj[ID];
            if (typeof id !== 'string')
              return null;
            return id.substring(id.indexOf('#') + 1);
          },

          getTypeDef: function (obj) {
            if (typeof obj === "undefined")
              return;
            return terms[obj[TYPE]];
          },

          // TODO: merge with getLabel (defined in SearchCtrl)
          getTypeLabel: function (obj, locale) {
            var label = this._getTypeAttr(obj, 'label', locale, this.terms);
            return label;
          },

          getComment: function (type, locale) {
            return this._getTypeAttr({'@type': type }, 'comment', locale, this.terms);
          },

          _getTypeAttr: function (obj, attr, locale, terms) {
            if (typeof obj === "undefined")
              return;
            var typeLabels = [];
            var typeKeys = obj[TYPE];
            if (!_.isArray(typeKeys)) {
              typeKeys= [typeKeys];
            }
            var param = attr + (locale && locale !== 'se' ? '_'+locale : '');
            typeKeys.forEach(function (typeKey) {
              var dfn = terms[typeKey];
              typeLabels.push(dfn ? dfn[param] : typeKey);
            });
            if(typeLabels && typeLabels.length > 0) {
              return typeLabels.join(', ');  
            }
            return;
          }
        });
      });
      return deferer.promise;
    }(),
    conceptSchemes:   getDataset(API_PATH + "/def/schemes"),
  // !TODO Remove definitions below when the "index expander" is implemented in backend
    relators:         getDefinition('about.@type:ObjectProperty'),
    languages:        getDefinition('about.@type:Language'),
    countries:        getDefinition('about.@type:Country'),
    nationalities:    getDefinition('about.@type:Nationality'),
    enums: {
      encLevel:       getEnumDefinition('encLevel'),
      catForm:        getEnumDefinition('catForm'),
    },
    recordSkeletonTypeMap: getDataset("/record/template/skeletontypemap"),
    getDefinition: getDefinition
  };

  return definitions;
});
