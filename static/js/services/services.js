var kitin = angular.module('kitin.services', []);

/**
 * userData
 */
kitin.factory('userData', function() {
  return {
    userSigel: null
  };
});

/**
 * definitions
 * Get definitions lists from backend
 */
kitin.factory('definitions', function($http, $rootScope) {
  
  /**
  * getDataset
  * @param    url       {Servicetring}    URL to dataset
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

  // Defined definitions
  var definitions = {
    remotedatabases:  getDataset($rootScope.API_PATH + "/_remotesearch?databases=list"),
    terms:            getDataset($rootScope.API_PATH + "/def/terms"),
  // !TODO Remove definitions below when the "index expander" is implemented in backend
    relators:         getDataset($rootScope.API_PATH + "/def/_search?q=*+about.@type:ObjectProperty&n=10000"),
    languages:        getDataset($rootScope.API_PATH + "/def/_search?q=*+about.@type:Language&n=10000"),
    countries:        getDataset("/deflist/countries"),
    nationalities:    getDataset("/deflist/nationalities"),
    conceptSchemes:   getDataset($rootScope.API_PATH + "/def/schemes"),
    enums: {
      encLevel:       getDataset("/deflist/enum/encLevel"),
      catForm:        getDataset("/deflist/enum/catForm")
    },
    recordTemplate: function(recordType) { return getDataset("/record/template/" + recordType); }
  };
  return definitions;
});

/**
 * dataService
 * Service to handle communcation with backend.
 * Currently used for records and drafts
 */
kitin.factory('dataService', function ($http, $q, editUtil, $rootScope) {
  return {

    record: {
      get: function (type, id) {
        var record = $q.defer();
        var path = '/record/template/' + type; // new record
        if(id) {
          path = $rootScope.API_PATH + '/' + type + '/' + id;
        }
        var me = this;
        $http.get(path).success(function (struct, status, headers) {
          record['recdata'] = editUtil.decorate(struct);
          record['etag'] = headers('etag');
          record.resolve(record);
        });
        
        return record.promise;
      },

      save: function(type, id, data, etag) {
        var record = $q.defer();
        $http.put($rootScope.API_PATH + '/' + type + "/" + id, editUtil.undecorate(data),
                  {headers: {"If-match":etag}}).success(function(data, status, headers) {
          record['recdata'] = editUtil.decorate(data);
          record['etag'] = headers('etag');
          record.resolve(record);
        }).error(function() {
          console.log("FAILED to save record");
        });
        return record.promise;
      },

      create: function(type, data) {
        var record = $q.defer();
        $http.post($rootScope.API_PATH, editUtil.undecorate(data)).success(function(data, status, headers) {
          record['recdata'] = editUtil.decorate(data);
          record['etag'] = headers('etag');
          record.resolve(record);
        });
        return record.promise;
      },

      convertToMarc: function(data) {
        var record = $q.defer();
        $http.post($rootScope.API_PATH + '/_format?to=application\/x-marc-json', editUtil.undecorate(data)).success(function(data, status, headers) {
          record.resolve(data);
        });
        return record.promise;
      }
    },

    draft: {
      get: function (draftId) {
        var record = $q.defer();
        $http.get("/draft/" + draftId).success(function (data, status, headers) {
          data.document = editUtil.decorate(data.document);
          record['recdata'] = data;
          record['etag'] = headers('etag');
          record.resolve(record);
        });
        return record.promise;
      },

      save: function(type, draftId, data, etag) {
        var record = $q.defer();
        etag = etag ? etag : '';
        $http.put("/draft/" + type + '/' + draftId, editUtil.undecorate(data), {headers: {"If-match":etag } })
          .success(function(data, status, headers) {
            record['recdata'] = editUtil.decorate(data);
            record['etag'] = headers('etag');
            record.resolve(record);
            console.log("Saved record.");
          })
          .error(function() {
            console.log("FAILED to save record");
          });
        return record.promise;
      },

      create: function(type, data, etag) {
        var record = $q.defer();
        etag = etag ? etag : '';
        $http.post("/draft/" + type, editUtil.undecorate(data), {headers: {"If-match":etag } })
          .success(function(data, status, headers) {
            data.document = editUtil.decorate(data.document); 
            record.resolve(data);
          });
        return record.promise;
      },

      delete: function(type, draftId) {
        var record = $q.defer();
        $http.delete("/draft/" + type + '/' + draftId).success(function(data, status, headers) {
          record.resolve(data);
        });
        return record.promise;
      }
    },

    drafts: {
      get: function() {
        var record = $q.defer();
        $http.get('/drafts').success(function(data, status, headers) {
          record.resolve(data);
        });
        return record.promise;
      }
    },

    holding: {
      get: function() {}
    }
  };
});


/**
 * editUtil
 * Service to modify a record. Typically decorate/undecorate
 */
kitin.service('editUtil', function(definitions, $http) {


  /** mergeProperties
  *   Helper function for doMergeObjects
  *
  *   @param  propertyKey   {String}    Key to property in firstObject to merge
  *   @param  firstObject   {Object}    Javascript object
  *   @param  secondObject  {Object}    Javascript object
  *   @return               {Object}    Merged object
  *   
  */
  function mergeProperties(propertyKey, firstObject, secondObject) {
    var propertyValue = firstObject[propertyKey];
      if (_.isObject(propertyValue) || _.isArray(propertyValue)) {
        // Second object is missing a node, return first objects node
        if(typeof secondObject[propertyKey] === 'undefined' || _.isEmpty(secondObject[propertyKey])) {
          return propertyValue;
        }
          return doMergeObjects(firstObject[propertyKey], secondObject[propertyKey]);
      } else if (typeof secondObject[propertyKey] === 'undefined' || _.isEmpty(secondObject[propertyKey])) {
        // Second object is missing a leaf, return first objects leaf
        return firstObject[propertyKey];
      }
      // Leaf in second object has a value, return second objects leaf (even if its empty)
      return secondObject[propertyKey];
  }

  /** doMergeObjects
  *   Merges secondObject into firstObject
  *
  *   @param  firstObject   {Object}    Javascript object
  *   @param  secondObject  {Object}    Javascript object
  *   @return               {Object}    Merged object
  *   
  */
  function doMergeObjects(firstObject, secondObject) {
      var finalObject = firstObject;

      // Merge first object and its properties.
      for (var propertyKey in firstObject) {
          finalObject[propertyKey] = mergeProperties(propertyKey, firstObject, secondObject);
      }

      // Merge second object and its properties, to add missing properties from second to first object.
      for (propertyKey in secondObject) {
          finalObject[propertyKey] = mergeProperties(propertyKey, secondObject, firstObject);
      }

      return finalObject;
  } 

  /** doCleanObject
  *   Removes empty entities from an javascript object
  *
  *   @param    obj       {Object}    Javascript object to clean
  *   @param    cleanObj  {Object}    (Optional) New object used by the iterator
  *   @return             {Object}    Cleaned-up object
  */
  function doCleanObject(obj, cleanObj) {
    // Initial creation of clean object
    if(!cleanObj) { cleanObj = {}; }

    // Iterate all trough the object
    for(var key in obj) {
      // Node
      if(_.isObject(obj[key])) {
        // Pass empty array or object
        var childObj = doCleanObject(obj[key], _.isArray(obj[key]) ? [] : {});
        // Empty child, skip add
        if(!_.isEmpty(childObj)) {
          cleanObj[key] = childObj;
        }
      // Leaf
      } else { 
        if(!_.isEmpty(obj[key])) {
          // If Array push value else set the value
          if(_.isArray(cleanObj)) {
            cleanObj.push(obj[key]);
          } else {
            cleanObj[key] = obj[key];
          }
        } else {
          // If empty jump to next leaf
          continue;
        }
      }
    }
    return cleanObj;
  }

  var editutil = {

    RECORD_TYPES: {
      NEW: 'new',
      DRAFT: 'draft',
      REMOTE: 'remote',
      BIB: 'bib',
      AUTH: 'auth'
    },

    addableElements: [],
    record: null,
    
    /*
    *  Used in remote search, to store record on switch from search to edit mode
    */
    setRecord: function(record) {
      this.record = record;
    },

    /*
    *  Used in remote search, to store record on switch from search to edit mode
    */
    getRecord: function() {
      return this.record;
    },

    getMaterialType: function(record) {
      if(_.isArray(record.about['@type'])) {
        return record.about['@type'].join('.').toLowerCase();
      } else {
        return record.about['@type'];
      }
      
    },

    addObject: function(subj, rel, type, multiple, obj) {

      var addToContainer = function(subj, rel, type, obj) {
        var collection = subj[rel];
        if(typeof collection === 'undefined') {
          collection = subj[rel] = [];
        }
        var res = obj ? obj : createObject(type);
        collection.push(res);
        return collection;
      };

      var added;
      if (multiple) {
        added = addToContainer(subj, rel, type, obj);
      } else {
        added = obj? obj : this.createObject(type);
        subj[rel] = added;
      }
      // TODO: make decorate per object type
      if (_.contains(['Person', 'Organization'], added['@type'])) {
        added._reifiedRoles = this.makeVolatileArray();
      }
      return added;
    },

    createObject: function (type) {
      switch (type) {
        case 'Person':
          //objectKeys: ['controlledLabel', 'familyName', 'givenName', 'birthYear', 'deathYear']
          return {'@type': "Person", controlledLabel: "", birthYear: ""};
        //case 'Concept':
        //  objectKeys: ['prefLabel', '@type', 'hiddenLabel', 'broader', 'narrower', '@id', 'scopeNote', 'historyNote' ]
        case 'ISBN':
          return {'@type': "Identifier", identifierScheme: { '@id': "/def/identifiers/isbn" }, identifierValue: ""};
        case '/def/identifiers/issn':
          return {'@type': "Identifier", identifierScheme: { '@id': "/def/identifiers/issn" }, identifierValue: ""};
        case 'Identifier':
          return {'@type': "Identifier", identifierValue: ""};
        case 'ProviderEvent':
          return {'@type': "ProviderEvent", providerName: "", providerDate: "",
                  place: {'@type': "Place", label: ""}};
        default:
          return {};
      }
    },

    indexes: {
      identifier: {
        indexName: "identifierByIdentifierScheme",
        getIndexKey: function (entity) {
          return entity.identifierScheme ? entity.identifierScheme["@id"] : 'identifier';
        }
      },
      hasFormat: {
        indexName: "hasFormatByType",
        getIndexKey: function (entity) {
          if(entity) {
            return entity["@type"];
          }
        }
      },
      subject: {
        indexName: "subjectByInSchemeOrType",
        getIndexKey: function (entity) {
          return (entity.inScheme && entity.inScheme['@id']) ? entity.inScheme['@id'] : entity['@type'];
        }
      }
    },

    decorate: function(record) {
      function doIndex (entity, key, cfg) {
        var items = entity[key];
        if(_.isEmpty(items)) {
          return;
        }
        entity[cfg.indexName] = _.groupBy(items, cfg.getIndexKey);
        delete entity[key];
      }
      // Rearrange Array elements into display groups
      this.mutateObject(record.about, doIndex);
      // Rearrange Person roles
      definitions.relators.then(function (relators) {
        var roleMap = {};
        this.reifyAgentRoles(record, relators);
      }.bind(this));

      this.patchBibRecord(record);

      // Decorate record with template json
      definitions.recordTemplate(this.getMaterialType(record)).then(function(recordTemplate) {
        if(recordTemplate) {
          this.mergeRecordAndTemplate(record, recordTemplate);
        }
      }.bind(this));

      
      return record;
    },

    undecorate: function(record) {
      function doUnindex (entity, key, cfg) {
        entity[key] = _.flatten(entity[cfg.indexName], function(it) { return it; });
        delete entity[cfg.indexName];
      }
      // Rearrange grouped Arrays
      this.mutateObject(record.about, doUnindex);
      // Rearrange Person roles
      this.unreifyAgentRoles(record);
      // Remove empty entities 
      record = this.cleanRecord(record);
      return record;
    },

    mutateObject: function(entity, mutator) {
      if(!_.isEmpty(entity)) {
        for (var key in this.indexes) {
          var cfg = this.indexes[key];
          mutator(entity, key, cfg);
        }
      }
      return entity;
    },

    mergeRecordAndTemplate: doMergeObjects,

    cleanRecord: doCleanObject,

    makeVolatileArray: function () {
        var l = [];
        l.toJSON = function () { };
        return l;
    },

    reifyAgentRoles: function (record, relators) {
      var instance = record.about;
      if (!instance)
        return;

      // add index to relator terms object
      // TODO: coordinate terms, JSON-LD context and relators dataset instead
      // FIXME: use '@id' directly
      if (relators.byTerm === undefined) {
        var index = relators.byTerm = {};
        _.each(relators.list, function (obj) {
          var id = obj['data']['about']['@id'];
          index[id] = obj;
          var key = id.substring(id.lastIndexOf('/') + 1);
          index[key] = obj;
        });
      }

      // add _reifiedRoles key to each person
      var personMap = {};
      var prepareAgent = function (agent) {
        if (!agent)
          return;

        if (agent['@id']) {
          personMap[agent['@id']] = agent;
        }
        agent._reifiedRoles = this.makeVolatileArray();
      }.bind(this);

      prepareAgent(instance.attributedTo);
      if (instance.influencedBy) {
        instance.influencedBy.forEach(prepareAgent);
      }

      _.forEach(instance, function (values, key) {
        if (!values)
          return;

        if (!_.isArray(values))
          values = [values];
        _.forEach(values, function (agent) {
          if (agent['@id']) {
            agent = personMap[agent['@id']];
          }
          if (!agent)
            return;

          var roles = agent._reifiedRoles;
          if (!roles)
            return;

          var role = relators.byTerm[key];
          if (!role) {  return; }

          if (!_.contains(roles, role)) {
            roles.push(role['data']['about']);
            delete instance[key];
          }
        });
      });
    },

    unreifyAgentRoles: function (record) {
      var instance = record.about;
      if (!instance)
        return;

      var unreifyRoles = function (agent) {
        if (!agent)
          return;
        var roles = agent._reifiedRoles;
        if (!roles)
          return;
        roles.forEach(function (role) {
          var id = role['@id'];
          // FIXME: use @id
          var key = id.substring(id.lastIndexOf('/') + 1);
          var linked = instance[key];
          if (typeof linked === 'undefined') {
            linked = instance[key] = [];
          } else if (!_.isArray(linked)) {
            linked = instance[key] = [linked];
          }
          // TODO: use agentRef after first occurrence..
          if (!_.find(linked, function (o) { return o['@id'] === agent['@id']; }) ) {
            linked.push(agent);
          }
        });

        //delete agent._reifiedRoles;
      }.bind(this);

      unreifyRoles(instance.attributedTo);
      if (instance.influencedBy) {
        instance.influencedBy.forEach(unreifyRoles);
      }
    },

    // TODO: this will be unified in the backend mapping and thus not needed here
    getUnifiedClassifications: function (record) {
      var classes = [];
      if(record && record.about) {
        var thing = record.about;
        if (thing.class) {
          classes.push.apply(thing.class);
        }
        ['class-lcc', 'class-ddc'].forEach(function (key) {
          var cls = thing[key];
          if (cls) {
            classes.push({prefLabel: cls});
          }
        });
      }
      return classes;
    },

    // TODO: fix this in the backend service and remove this patch
    patchBibRecord: function (record) {
      var work = record.about;
      if (work && _.isArray(work.attributedTo)) {
        work.attributedTo = work.attributedTo[0];
      }
     /* if (work && work.language) {
        var langId = work.language['@id'];
        if (!langId)
          return;
        // TODO: change language data index to use URIs
        $http.get("/deflist/" + langId.replace(/\/def\//,''), {cache: true}).then(function(response) {
          if (response.data) {
            work.language = response.data;
          }
        });
      }*/
    },

    // TODO: fix this in the backend service and remove this patch
    patchHoldings: function (holdings) {
      return _.map(holdings, function (it) {
        var obj = it.data; obj['@id'] = it.identifier; return obj;
      });
    }
  };
  return editutil;
});

/**
 * isbnTools
 *
 */
kitin.factory('isbnTools', function($http, $q) {
  function doCheck(isbn) {
    var deferred = $q.defer();
    var url = "/_isxntool?isbn=" + isbn;
    $http.get(url).success(function(data) {
      deferred.resolve(data);
    });
    return deferred.promise;
  }

  return {
    checkIsbn: function(isbn) {
      return doCheck(isbn);
    }
  };
});

/**
 * searchService
 *
 */
kitin.factory('searchService', function($http, $q) {
  return {
    pageSize: 10,
    facetLabels: { 
     'about.@type': 'Typer',
     'about.language.@id': 'Språk',
     'encLevel.@id': 'Beskrivningsnivå'
    },
    searchTypeIndex: {
      bib: {
        key: 'bib', 
        label: 'Libris',
        placeholder: 'Sök bland bibliografiskt material (på ISBN, titel, författare etc.)'
      },
      auth: {
        key: 'auth', 
        label: 'Auktoriteter',
        placeholder: 'Sök bland auktoriteter (personer, ämnen, verk etc.)'
      },
      remote: {
        key: 'remote', 
        label: 'Remote',
        placeholder: 'Sök remote'
      }
    },
    sortables: [
      { text: 'Relevans',     value: 'relevans' },
      { text: 'Nyast först',  value: '-about.publication.providerDate' },
      { text: 'Äldst först',  value: 'about.publication.providerDate' }
    ],
    search: function(url, params) {
      var deferred = $q.defer();
      $http.get(url, { params: params }).success(function(data) {
        deferred.resolve(data);
      });
      return deferred.promise;
    }
  };
});


/**
 * searchUtil
 *
 */
kitin.factory('searchUtil', function() {
  return {

    countTotalHits: function(hits) {
      if(_.isObject(hits)) {
        return _.reduce(hits, function(sum, num) {
          return sum + num;
        });
      } else {
        return hits;
      }
    },

    parseSelected: function (remoteDatabases) {
      return _.map(_.filter(remoteDatabases, 'selected'), 'database').join(',');
    },

    makeLinkedFacetGroups: function (recType, facets, q, prevFacetsStr) {
      // iterate facets to add correct slug
      // if can do in angularistic fashion; then please do and remove this!
      var result = [];
      _.each(facets, function (facet, facetType) {
        var newFacet = {};
        newFacet.type = facetType;
        newFacet.items = [];
        var prevFacets = prevFacetsStr.split(" ");
        _.each(facet, function (count, key) {
          var slug = [facetType, key.replace(/:/g, '\\:')].join(":");
          var selected = _.indexOf(prevFacets, slug) !== -1;
          var searchUrl = "/search/" + recType + "?q=" + encodeURIComponent(q) + 
            (selected ? (prevFacets.length > 1 ? "&f=" + _.filter(prevFacets, function(val) {return val != slug;}).join(' ') : '') : "&f=" + slug + " " + prevFacetsStr);
          
          var item = {
            key: key,
            count: count,
            selected: selected,
            searchUrl: searchUrl
          };
          newFacet['items'].push(item);
        });
        result.push(newFacet);
      });
      return result;
    },

    bakeCrumbs: function (recType, q, prevFacetsStr) {
      var facetlist = prevFacetsStr.split(" ").reverse();
      var crumblist = [];
      var tmpCrumb = {};
      tmpCrumb['term'] = q;
      if (prevFacetsStr.length > 0) {
        tmpCrumb['urlpart'] = "/search/" + recType + "?q=" + encodeURIComponent(q);
        crumblist.push(tmpCrumb);
        var urlPart = "";
        for (var i=0; i < facetlist.length; i++) {
          tmpCrumb = {};
          var facet = facetlist[i];
          var f = facet.split(':');
          var term = f[1];
          var type = f[0];
          if (urlPart === "") {
            urlPart = urlPart + facet;
          } else {
            urlPart = urlPart + " " + facet;
          }
          tmpCrumb["term"] = term;
          tmpCrumb["type"] = type;
          if (i < (facetlist.length - 1)) {
            tmpCrumb['urlpart'] = "/search/" + recType + "?q=" + encodeURIComponent(q) + "&f=" + urlPart;
          }
          if (i === 0) {
            tmpCrumb["bridge"] = " inom ";
          }
          if (i > 0) {
            tmpCrumb["bridge"] = " och ";
          }
          //console.log("Facett: " + facet + ", term: " + term + ", urlpart: " + urlPart + ", position: " + i + ", length: " + facetlist.length);
          crumblist.push(tmpCrumb);
        }
      } else {
      crumblist.push(tmpCrumb);
      }
      return crumblist;
    }
  };
});

