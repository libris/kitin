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
kitin.factory('definitions', function($http) {
  
  /**
  * getDataset
  * @param    url       {Servicetring}    URL to dataset
  * @return   promise   {Object}          Angular JS promise, $q
  */
  function getDataset(url) {
    return {
      then: function (f) {
        $http.get(url, {cache: true}).then(function(response) {
          f(response.data);
        });
      }
    };
  }

  // Defined definitions
  var definitions = {
    remotedatabases:  getDataset("/search/remote.json?databases"),
    terms:            getDataset("/deflist/terms/terms"),
  // !TODO Remove definitions below when the "index expander" is implemented in backend
    relators:         getDataset("/deflist/terms/relators"),
    languages:        getDataset("/deflist/terms/languages"),
    countries:        getDataset("/deflist/terms/countries"),
    nationalities:    getDataset("/deflist/terms/nationalities"),
    conceptSchemes:   getDataset("/deflist/terms/schemes"),
    enums: {
      encLevel:       getDataset("/deflist/terms/enum/encLevel"),
      catForm:        getDataset("/deflist/terms/enum/catForm")
    }
  };
  return definitions;
});

/**
 * recordUtil
 * Service to modify a record. Typically decorate/undecorate
 */
kitin.factory('recordUtil', function() {
  return {

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
          return entity["@type"];
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
      this.mutateObject(record.about, doIndex);
      return record;
    },

    undecorate: function(record) {
      function doUnindex (entity, key, cfg) {
        entity[key] = _.flatten(entity[cfg.indexName], function(it) { return it; });
        delete entity[cfg.indexName];
      }
      this.mutateObject(record.about, doUnindex);
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

  };
});


/**
 * dataService
 * Service to handle communcation with backend.
 * Currently used for records and drafts
 */
kitin.factory('dataService', function ($http, $q, recordUtil) {
  return {

    record: {
      get: function (type, id) {
        var record = $q.defer();
        $http.get("/record/" + type + (id ? "/" + id : '')).success(function (struct, status, headers) {
          record['recdata'] = recordUtil.decorate(struct);
          record['etag'] = headers('etag');
          record.resolve(record);
        });
        return record.promise;
      },

      save: function(type, id, data, etag) {
        var record = $q.defer();
        $http.put("/record/" + type + "/" + id, data,
                  {headers: {"If-match":etag}}).success(function(data, status, headers) {
          record['recdata'] = recordUtil.undecorate(data);
          record['etag'] = headers('etag');
          record.resolve(record);
          console.log("Saved record.");
        }).error(function() {
          console.log("FAILED to save record");
        });
        return record.promise;
      },

      create: function(type, data) {
        var record = $q.defer();
        $http.post("/record/" + type + "/create", data).success(function(data, status, headers) {
          record.resolve(recordUtil.decorate(data));
        });
        return record.promise;
      }
    },

    draft: {
      get: function (draftId) {
        var record = $q.defer();
        $http.get("/draft/" + draftId).success(function (data, status, headers) {
          record['recdata'] = recordUtil.decorate(data);
          record['etag'] = headers('etag');
          record.resolve(record);
        });
        return record.promise;
      },

      save: function(type, draftId, post, etag) {
        var record = $q.defer();
        etag = etag ? etag : '';
        $http.put("/draft/" + type + '/' + draftId, recordUtil.undecorate(post), {headers: {"If-match":etag } })
          .success(function(data, status, headers) {
            record['recdata'] = recordUtil.decorate(data);
            record['etag'] = headers('etag');
            record.resolve(record);
            console.log("Saved record.");
          })
          .error(function() {
            console.log("FAILED to save record");
          });
        return record.promise;
      },

      create: function(type, post, etag) {
        var record = $q.defer();
        etag = etag ? etag : '';
        $http.post("/draft/" + type, recordUtil.undecorate(post), {headers: {"If-match":etag } })
          .success(function(data, status, headers) {
            record.resolve(recordUtil.decorate(data));
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
 *
 */
kitin.service('editUtil', function(definitions, $http) {
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
    
    setRecord: function(record) {
      this.record = record;
    },

    getRecord: function() {
      return this.record;
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

    populatePersonRoleMap: function (roleMap, record, relators) {
      var instance = record.about;

      var self = this;

      function addPersonRoles(person) {
        var pid = person['@id'];
        if (!pid) {
          pid = person['@id'] = self.genBNodeId();
        }
        roleMap[person['@id']] = [];
      }
      if (instance && instance.attributedTo) {
        addPersonRoles(instance.attributedTo);
      }
      if (instance && instance.influencedBy) {
        instance.influencedBy.forEach(function (person) {
          addPersonRoles(person);
        });
      }

      // TODO: coordinate terms, JSON-LD context and relators dataset instead
      if (relators.byTerm === undefined) {
        var index = relators.byTerm = {};
        _.each(relators.byNotation, function (obj) {
          var id = obj['@id'];
          var key = id.substring(id.lastIndexOf('/') + 1);
          index[key] = obj;
        });
      }

      [instance].forEach(function (resource) {
        if (typeof resource === 'undefined')
          return;
        var objId = resource['@id'];
        _.forEach(resource, function (vals, key) {
          if (!vals)
            return;
          if (!_.isArray(vals)) vals = [vals];
          _.forEach(vals, function (agent) {
            var pid = agent['@id'];
            if (!pid) {
              return;
            }
            var roles = roleMap[pid];
            if (!roles)
              return;
            var role = relators.byTerm[key];
            if (!role)
              return;
            if (!_.contains(roles, role))
              roles.push(role);
            //pr.roles[role] = objId;
          });
        });
      });

      return roleMap;
    },

    counter: 0,

    genBNodeId: function () {
      return "_:t-" + (new Date().getTime()) + "-" + this.counter++;
    },

    SchemeContainer: function (work, defaultSchemes) {
      var concepts = work && work.subject || [];
      var byScheme = {};
      this.byScheme = byScheme;

      concepts.forEach(function (concept) {
        var key = (concept.inScheme && concept.inScheme.notation)?
          concept.inScheme.notation : concept['@type'];
        var container = byScheme[key];
        if (typeof container === "undefined") {
          container = new editutil.ConceptContainer(work); 
          byScheme[key] = container;
        }
        container.concepts.push(concept);
      });
      defaultSchemes.forEach(function (key) {
        if (!byScheme[key])
            byScheme[key] = new editutil.ConceptContainer(work);
      });

      this.addObject = function (obj) {
        var schemeKey = obj.inScheme.notation;
        container = byScheme[schemeKey];
        if (container === undefined) {
          container = byScheme[schemeKey] = new editutil.ConceptContainer(work);
        }
        container.addObject(obj);
      };
    },

    ConceptContainer: function (work) {

      this.concepts = [];

      this.addObject = function (obj) {
        // TODO: copy data? Unify with addObject and createObject..
        if (obj.prefLabel) {
          delete obj.broader;
        }
        if (typeof work.subject === 'undefined')
          work.subject = [];
        work.subject.push(obj);
        this.concepts.unshift(obj);
      };

      this.onRemove = function (rel, removed, index) {
        _.remove(work.subject, function (it) {
          return it['@id'] === removed['@id'];
        });
        if (work.subject && work.subject.length === 0)
          delete work.subject;
      };
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
      if (work && work.language) {
        var langId = work.language['@id'];
        if (!langId)
          return;
        // TODO: change language data index to use URIs
        $http.get("/deflist/" + langId.replace(/\/def\//,''), {cache: true}).then(function(response) {
          if (response.data) {
            work.language = response.data;
          }
        });
      }
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
        label: 'Bibliografiskt material',
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

