var kitin = angular.module('kitin.services', []);

kitin.factory('userData', function() {
  return {
    userSigel: null
  };
});

kitin.factory('definitions', function($http) {
  function getDataset(url) {
    return {
      then: function (f) {
        $http.get(url, {cache: true}).then(function(response) {
          f(response.data);
        });
      }
    };
  }
  var enumBase = "/resource/_marcmap?part=bib.fixprops.";
  var definitions = {
    typedefs: getDataset("/resource/_resourcelist?typedef=all"),
    relators: getDataset("/def/relators"),
    languages: getDataset("/def/languages"),
    countries: getDataset("/def/countries"),
    //nationalities: getDataset("/def/nationalities"),
    conceptSchemes: getDataset("/def/schemes"),
    enums: {
      bibLevel: getDataset(enumBase + "bibLevel"),
      encLevel: getDataset(enumBase + "encLevel"),
      catForm: getDataset(enumBase + "catForm")
    }
  };
  return definitions;
});

kitin.factory('records', function ($http, $q) {
  return {

    get: function (type, id) {
      var path = "/record/" + type + "/" + id;
      var record = $q.defer();
      $http.get(path).success(function (struct, status, headers) {
        record['recdata'] = struct;
        record['etag'] = headers('etag');
        record.resolve(record);
      });
      return record.promise;
    },

    save: function(type, id, data, etag) {
      var record = $q.defer();
      $http.put("/record/" + type + "/" + id, data,
                {headers: {"If-match":etag}}).success(function(data, status, headers) {
        record['recdata'] = data;
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
        record.resolve(data);
      });
      return record.promise;
    }
  };
});

kitin.service('editUtil', function(definitions) {
  var addToContainer = function(subj, rel, type, obj) {
    var collection = subj[rel];
    if(typeof collection === 'undefined') {
      collection = subj[rel] = [];
    }
    var res = obj ? obj : createObject(type);
    collection.push(res);
    return collection;
  };

  var editutil = {

    addObject: function(subj, rel, type, multiple, obj) {
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
          return {'@type': "Identifier", identifierScheme: "ISBN", identifierValue: ""};
        case 'ProviderEvent':
          return {'@type': "ProviderEvent", providerName: "", providerDate: "",
                  place: {'@type': "Place", label: ""}};
        default:
          return {};
      }
    },

    getPersonRoleMap: function (record, relators) {
      var instance = record.about;
      var work = instance.instanceOf;

      var roleMap = {};
      function addPersonRoles(person) {
        roleMap[person['@id']] = [];
      }
      if (work && work.attributedTo) {
        addPersonRoles(work.attributedTo);
      }
      if (work && work.influencedBy) {
        work.influencedBy.forEach(function (person) {
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

      [instance, work].forEach(function (resource) {
        if (typeof resource === 'undefined')
          return;
        var objId = resource['@id'];
        _.forEach(resource, function (vals, key) {
          if (!vals)
            return;
          if (!_.isArray(vals)) vals = [vals];
          _.forEach(vals, function (agent) {
            var pid = agent['@id'];
            if (!pid)
              return;
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

    SchemeContainer: function (work, defaultSchemes) {
      var concepts = work.subject || [];
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
      var thing = record.about.instanceOf;
      var classes = [];
      if (thing.class) {
        classes.push.apply(thing.class);
      }
      ['class-lcc', 'class-ddc'].forEach(function (key) {
        var cls = thing[key];
        if (cls) {
          classes.push({prefLabel: cls});
        }
      });

      return classes;
    },

    // TODO: fix this in the backend service and remove this patch
    patchBibRecord: function (record) {
      var work = record.about.instanceOf;
      if (work && _.isArray(work.attributedTo)) {
        work.attributedTo = work.attributedTo[0];
      }
      if (work && work.language) {
        var langId = work.language['@id'];
        if (!langId)
          return;
        // TODO: change language data index to use URIs
        var langBase = "/def/languages/";
        if (langId.indexOf(langBase) === 0)
          langId = langId.substring(langBase.length);
        definitions.languages.then(function (index) {
          var obj = index.byCode[langId];
          if (obj) {
            work.language = obj;
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

kitin.factory('isbnTools', function($http, $q) {
  function doCheck(isbn) {
    var deferred = $q.defer();
    var url = "/resource/_isxntool?isbn=" + isbn;
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

kitin.factory('searchService', function($http, $q) {
  function performSearch(url) {
    var deferred = $q.defer();
    $http.get(url).success(function(data) {
      deferred.resolve(data);
    });
    return deferred.promise;
  }

  return {
    search: function(url) {
      return performSearch(url);
    }
  };
});

kitin.factory('searchUtil', function() {

  var searchUtil = {

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
          var slug = encodeURIComponent([facetType, key].join(":"));
          var selected = $.inArray(slug, prevFacets) !== -1;
          var searchUrl = "/search/" + recType + "?q=" + encodeURIComponent(q) + "&f=" +
            (selected? $.grep(prevFacets, function(val) {return val != slug;}) : slug + " " + prevFacetsStr);
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
          var term = facet.substring(facet.indexOf(":") + 1);
          if (urlPart === "") {
            urlPart = urlPart + facet;
          } else {
            urlPart = urlPart + " " + facet;
          }
          tmpCrumb["term"] = term;
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

  return searchUtil;

});

