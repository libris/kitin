
/**
 * app.js
 */

var kitin = angular.module('kitin', ['ui']);

kitin.config(
  ['$locationProvider', '$routeProvider',
    function($locationProvider, $routeProvider) {
      $locationProvider.html5Mode(true).hashPrefix('!');
      $routeProvider
        .when('/',
              {templateUrl: '/partials/index', controller: IndexCtrl})
        .when('/search',
              {templateUrl: '/partials/search', controller: SearchCtrl})
        .when('/edit/:recType/:recId',
              {templateUrl: '/partials/edit', controller: EditCtrl})
        .when('/jsonld/:recType/:recId',
              {templateUrl: '/partials/jsonld', controller: EditCtrl})
        ;//.otherwise({redirectTo: '/'});

    }]
);

// TODO: window.onunload or $routeProvider / $locationChangeStart
//if (ajaxInProgress)
//  confirm('ajaxInProgress; break and leave?')


/**
 * Filters
 */

kitin.filter('ensureArray', function() {
  return function (obj) {
    return (obj === undefined || obj.length !== undefined)? obj : [obj];
  };
});

// May be generalized at will
kitin.filter('chop', function() {
  return function(victim) {
    if (!victim) {
      victim = "";
    }
    if (victim.length < 70) {
      return victim;
    } else {
      return String(victim).substring(0, 67) + "...";
    }
  };
});

kitin.filter('chunk', function() {
  return function(toChunk) {
    return String(toChunk).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };
});


/**
 * Global scope functions
 */
kitin.run(function($rootScope) {

  $rootScope._ = _;

  $rootScope.isEmpty = function(obj) { return angular.equals({},obj); };

  $rootScope.typeOf = function (o) { return o === null? 'null' : typeof o; };

});


function IndexCtrl($scope, $http) {
  document.body.className = 'index';
  $scope.drafts = $http.get("/drafts").success(function(data) {
    $scope.drafts = data.drafts;
  });

  $scope['delete'] = function(type, id) {
    $http.post("/record" + "/" + type + "/" + id + "/draft/delete").success(function(data, status) {
      $scope.drafts = data.drafts;
    });
  };
}


function SearchFormCtrl($scope, $location) {
  $scope.search = function() {
    $location.url("/search?q="+encodeURIComponent($scope.q));
  };
}


function SearchCtrl($scope, $http, $location, $routeParams, resources, searchService) {
  console.time("search");
  // Can this resource fetching stuff be globalized?
  $scope.enums = {};
  resources.enums.bibLevel.then(function(data) {
    $scope.enums.bibLevel = data;
  });

  resources.typedefs.then(function(data) {
    $scope.typeDefs = data.types;
  });

  resources.enums.encLevel.then(function(data) {
    $scope.enums.encLevel = data;
  });

  var prevFacetsStr = $routeParams.f || "";

  function mangleFacets(facets) {
    // iterate facets to add correct slug
    // if can do in angularistic fashion; then please do and remove this!
    var result = [];
    _.each(facets, function (facet, facetType) {
      var newFacet = {};
      newFacet['type'] = facetType;
      newFacet['items']= [];
      var prevFacets = prevFacetsStr.split(" ");
      _.each(facet, function (value, key) {
        var subitem = {};
        var subitemObject = {};
        subitemObject[key] = value;
        subitem['object'] = subitemObject;
        var tmpslug = [facetType, key].join(":");
        var slug = encodeURIComponent(tmpslug);
        subitem.selected = $.inArray(slug, prevFacets) !== -1;
        if (subitem.selected) {
          subitem['slug'] = "/search?q=" + encodeURIComponent($scope.q) + "&f=" + $.grep(prevFacets, function(val) {return val != slug;});
        } else {
          subitem['slug'] = "/search?q=" + encodeURIComponent($scope.q) + "&f=" + slug + " " + prevFacetsStr;
        }
        newFacet['items'].push(subitem);
      });
      result.push(newFacet);
    });
    return result;
  }

  function bakeCrumbs(prv) {
    var facetlist = prv.split(" ").reverse();
    var crumblist = [];
    var tmpCrumb = {};
    tmpCrumb['term'] = $routeParams.q;
    if (prevFacetsStr.length > 0) {
      tmpCrumb['urlpart'] = "/search?q=" + encodeURIComponent($scope.q);
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
          tmpCrumb['urlpart'] = "/search?q=" + encodeURIComponent($scope.q) + "&f=" + urlPart;
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

  document.body.className = 'search';

  $scope.q = $routeParams.q;
  $scope.f = $routeParams.f;
  var url = "/search.json?q=" + encodeURIComponent($scope.q);
  if ($scope.f !== undefined) {
    url += "&f=" + $scope.f;
  }

  $scope.search = function() {
    $location.url(url);
  };

  if (!$routeParams.q) {
    return;
  } else {
    $scope.loading = true;
    searchService.search(url).then(function(data) {
      $scope.myFacets = mangleFacets(data.facets);
      $scope.result = data;
      if (data.hits == 1) {
          $location.url("/edit" + data.list[0].identifier);
          $location.replace();
      }
      $scope.chunkedHits = data.hits.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      //$scope.chunkedHits = toChunk.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      $scope.loading = false;
    });
  }

  $scope.getLabel = function (term) {
    var dfn = $scope.typeDefs[term];
    if (!dfn) return term;
    return dfn['label_sv'] || term;
  };

  $scope.firstPerson = function (work) {
    var candidate = work.creator || work.contributorList;
    return _.isArray(candidate)? candidate[0] : candidate;
  };

  $scope.crumbs = bakeCrumbs(prevFacetsStr);

  var facetTerms = []; // TODO: localization
  facetTerms['about.@type'] = "Typer";
  facetTerms['about.dateOfPublication'] = "Datum";
  $scope.facetTerms = facetTerms;

  console.timeEnd("search");
}


function EditCtrl($scope, $http, $routeParams, $timeout, records, resources, constants) {
  var recType = $routeParams.recType, recId = $routeParams.recId;
  var path = "/record/" + recType + "/" + recId;

  var isNew = (recId === 'new');
  var newType = $routeParams.type;

  document.body.className = isNew? 'edit new' : 'edit';

  // Fetch resources

  $scope.enums = {};
  resources.enums.bibLevel.then(function(data) {
    $scope.enums.bibLevel = data;
  });
  resources.enums.encLevel.then(function(data) {
    $scope.enums.encLevel = data;
  });
  resources.enums.catForm.then(function(data) {
    $scope.enums.catForm = data;
  });
  resources.relators.then(function(data) {
    var map = $scope.relatorsMap = {};
    // TODO: fix this backend resource
    _.forEach(data, function (val, key) { map[val.term] = val; });
  });
  resources.languages.then(function(data) {
    /*$scope.langlist = [];
    var obj;
    for (var key in data) {
        $scope.langlist.push({
        "code" : key,
        "name" : data[key]
        });
    }*/
    $scope.langlist = data;
  });
  resources.countries.then(function(data) {
    $scope.countrylist = data;
  });
  resources.nationalities.then(function(data) {
    $scope.nationalitylist = data;
  });

  resources.typedefs.then(function(data) {
    var typedefs = data.types;
    $scope.getTypeDef = function (obj) {
      if (typeof obj === "undefined")
        return;
      return typedefs[obj['@type']];
    };
  });

  // TODO: resources.conceptSchemes
  var conceptSchemes = $scope.conceptSchemes =  {
    "sao": {"label": "Svenska ämnesord"},
    "saogf": {"label": "SAO - Genre och form"},
    "barn": {"label": "Barnämnesord"},
    "lcsh": {"label": "LCSH"},
    "kao": {"label": "Kvinnsam"},
    "mesh": {"label": "MeSH"},
    "agrovoc": {"label": "AgroVoc"},
    "sfit": {"label": "SFIT"},
    "prvt": {"label": "PRVT"},
    "gmgpc//swe": {"label": "GMGPC (swe)"}
  };

  if (isNew) {
    $http.get('/record/bib/new?type' + newType).success(function(data) {
      $scope.record = data;
    });
  } else

  records.get(recType, recId).then(function(data) {
    var record = $scope.record = data['recdata'];

    bibid = record['controlNumber'];
    $scope.etag = data['etag'];
    $scope.userSigel = constants['user_sigel'];
    $http.get("/record/" + recType + "/" + recId + "/holdings").success(function(data) {

      $scope.personRoleMap = datatools.getPersonRoleMap(record, $scope.relatorsMap);
      $scope.unifiedClassifications = datatools.getUnifiedClassifications(record);
      // FIXME: this is just a view object - add/remove must operate on source and refresh this
      // (or else this must be converted back into source form before save)
      $scope.conceptSchemeTuples =
        datatools.getConceptSchemeTuples(conceptSchemes, record.about.instanceOf.subject);

      var holdingEtags = {};
      var items = datatools.patchHoldings(data.list);
      $scope.holdings = items;
      var myHoldings = _.filter(items, function(i) { return i['location'] == constants['user_sigel']; });
      if (myHoldings <= 0) {
        $http.get("/holding/bib/new").success(function(data, status, headers) {
          data.location = $scope.userSigel;
          $scope.holding = data;
          data._isNew = true; // TODO: don't do this when etag works
        });
      } else {
        $scope.holding = myHoldings[0];
      }
      items.forEach(function (item) {
        if (item['@id']) {
          $http.get("/holding/"+ item['@id'].split("/").slice(-2)[1]).success(function (data, status, headers) {
            holdingEtags[data['@id']] = headers('etag');
          });
        }
      });
      $scope.holdingEtags = holdingEtags;
    });

  });

  $scope.modifications = {saved: true, published: true};

  function onSaveState() {
    $scope.modifications.saved = true;
    $scope.modifications.lastSaved = new Date();
  }
  function onPublishState() {
    $scope.modifications.saved = true;
    $scope.modifications.published = true;
    $scope.modifications.lastPublished = new Date();
  }

  $scope.triggerModified = function () {
    $scope.modifications.saved = false;
    $scope.modifications.published = false;
  };

  $scope.modifiedClasses = function () {
    var classes = [], mods = $scope.modifications;
    if (mods.saved) classes.push('saved');
    if (mods.published) classes.push('published');
    return classes;
  };

  $scope.lastSavedLabel = function (tplt) {
    if (!$scope.modifications.lastSaved)
      return "";
    return tplt.replace(/%s/, $scope.modifications.lastSaved.toLocaleString());
  };

  $scope.lastPublishedLabel = function (tplt) {
    if (!$scope.modifications.lastPublished)
      return "";
    return tplt.replace(/%s/, $scope.modifications.lastPublished.toLocaleString());
  };

  $scope.promptConfirmDelete = function($event, type, id) {
    $scope.confirmDeleteDraft = {
      execute: function() {
        $http.post("/record" + "/" + type + "/" + id + "/draft/delete").success(function(data, status) {
          $scope.draft = null;
          $scope.confirmDeleteDraft = null;
        });
      },
      abort: function() {
        $scope.confirmDeleteDraft = null;
      }
    };
    $timeout(function() {
      openPrompt($event, "#confirmDeleteDraftDialog");
    });
  };

  if (isNew) {
    $scope.save = function() {
      records.create(recType, $scope.record).then(function(data) {
        $location.url('/edit/bib/' + data['document_id']);
      });
    };
  } else
  $scope.save = function() {
    var ifMatchHeader = $scope.etag.replace(/["']/g, "");
    records.save(recType, recId, $scope.record, ifMatchHeader).then(function(data) {
      $scope.record = data['recdata'];
      $scope.etag = data['etag'];
            onPublishState();
    });
  };

  $scope.saveDraft = function() {
    $http.post("/record/"+ $routeParams.recType +"/"+ $routeParams.recId +"/draft",
      $scope.record,
      {headers: {"If-match":$scope.etag}}
    ).success(function(data, status) {
      $scope.draft = data;
      $scope.draft.type = data['@id'].split("/").slice(-2)[0];
      $scope.draft.id = data['@id'].split("/").slice(-2)[1];
      onSaveState();
      //$('.flash_message').text("Utkast sparat!");
    });
  };

  $http.get("/draft/"+recType+"/"+recId).success(function(data, status, headers) {
    $scope.draft = data;
    $scope.draft.type = data['@id'].split("/").slice(-2)[0];
    $scope.draft.id = data['@id'].split("/").slice(-2)[1];
    $scope.etag = headers('etag');
  }).error(function(data, status) {
    console.log(status);
  });

  function createObject(type) {
    switch (type) {
      case 'Person':
        return {'@type': "Person", controlledLabel: "", birthYear: ""};
      default:
        return {};
    }
  }

  $scope.newObject = function(subj, rel, type) {
    var obj = subj[rel] = createObject(type);
  };

  $scope.addObject = function(subj, rel, type) {
    var collection = subj[rel];
    if (typeof collection === 'undefined') {
      collection = subj[rel] = [];
    }
    var obj = createObject(type);
    collection.push(obj);
  };

  $scope.removeObject = function(subj, rel, index) {
    var obj = subj[rel];
    if (_.isArray(obj))
      obj.splice(index,1);
    else
      subj[rel] = null;
    $scope.triggerModified();
  };

  $scope.addHolding = function(holdings) {
    holdings.push({shelvingControlNumber: "", location: constants['user_sigel']});
  };

  $scope.saveHolding = function(holding) {
    var etag = $scope.holdingEtags[holding['@id']];
    holding['annotates'] = { '@id': "/"+recType+"/"+recId };
    // TODO: only use etag (but it's not present yet..)
    if(!holding._isNew && (etag || holding.location === $scope.userSigel)) {
      $http.put("/holding/" + holding['@id'].split("/").slice(-2)[1], holding, {headers: {"If-match":etag}}).success(function(data, status, headers) {
        $scope.holdingEtags[data['@id']] = headers('etag');
      }).error(function(data, status, headers) {
        console.log("ohh crap!");
      });
    } else {
      if (holding._isNew) { delete holding._isNew; }
      console.log("we wants to post a new holding");
      $http.post("/holding", holding).success(function(data, status, headers) {
        $scope.holdingEtags[data['@id']] = headers('etag');
      }).error(function(data, status, headers) {
        console.log("ohh crap!");
      });
    }
  };

  $scope.deleteHolding = function(holdingId) {
    $http['delete']("/holding/" + holdingId).success(function(data, success) {
      console.log("great success!");
      $http.get("/record/" + recType + "/" + recId + "/holdings").success(function(data) {
        $scope.holdings = patchHoldings(data.list);
      });
    }).error(function() {
      console.log("oh crap!");
    });
  };

  var typeCycle = ['Book', 'EBook', 'Audiobook', 'Serial', 'ESerial'], typeIndex = 0;
  $scope.cycleType = function (evt, obj) {
    if (!obj || !evt.altKey) return;
    if (typeIndex++ >= typeCycle.length - 1) typeIndex = 0;
    obj['@type'] = typeCycle[typeIndex];
  };

}


var datatools = {

  getPersonRoleMap: function (record, relatorsMap) {
    var instance = record.about;
    var work = instance.instanceOf;

    var roleMap = {};
    function addPersonRoles(person) {
      roleMap[person['@id']] = [];
    }
    if (work.creator) {
      addPersonRoles(work.creator);
    }
    if (work.contributorList) {
      work.contributorList.forEach(function (person) {
        addPersonRoles(person);
      });
    }

    [instance, work].forEach(function (resource) {
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
          var role = relatorsMap[key];
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

  getConceptSchemeTuples: function (conceptSchemes, concepts) {
    var tuplesByScheme = {};
    concepts.forEach(function (concept) {
      var schemeNotation = (concept.inScheme && concept.inScheme.notation)?
        concept.inScheme.notation : "N/A";
      var tuple = tuplesByScheme[schemeNotation];
      if (typeof tuple === "undefined") {
        tuple = {scheme: conceptSchemes[schemeNotation] || {"label": schemeNotation}, concepts: []};
        tuplesByScheme[schemeNotation] = tuple;
      }
      tuple.concepts.push(concept);
    });
    return _.values(tuplesByScheme);
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
  patchHoldings: function (holdings) {
    return _.map(holdings, function (it) {
      var obj = it.data; obj['@id'] = it.identifier; return obj;
    });
  }

};


/**
 * services.js
 */

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

kitin.factory('isbntools', function($http, $q) {
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


kitin.factory('resources', function($http) {
  function getResourceList(restype, part) {
      var url;
      if (restype === 'enums')
        url = "/resource/_marcmap?part=bib.fixprops." + part;
      else
        url = "/resource/_resourcelist?" + restype + "=all";
    var promise = $http.get(url).then(function(response) {
      return response.data;
    });
    return promise;
  }
  // TODO: load cached aggregate, or lookup part on demand from backend?
  var resources = {
    typedefs: getResourceList("typedef"),
    relators: getResourceList("relator"),
    languages: getResourceList("lang"),
    countries: getResourceList("country"),
    nationalities: getResourceList("nationality"),
    enums: {
      bibLevel: getResourceList("enums", "bibLevel"),
      encLevel: getResourceList("enums", "encLevel"),
      catForm: getResourceList("enums", "catForm")
    }

  };
  return resources;
});


// Gather constants from angular or flask context
kitin.factory('constants', function(flaskConstants) {
  var constants = {};
  angular.extend(constants, flaskConstants);
  return constants;
});


// TODO: turn into promptService?
function openPrompt($event, promptSelect, innerMenuSelect) {
  var tgt = $($event.target),
    off = tgt.offset(), width = tgt.width();
  var prompt = $(promptSelect);
  // NOTE: picking width from .dropdown-menu which has absolute pos
  var menuWidth = (innerMenuSelect? $(innerMenuSelect, prompt) : prompt).width();
  var topPos = off.top;
  var leftPos = off.left + width - menuWidth;
  if (leftPos < 0)
    leftPos = 0;
  prompt.css({position: 'absolute',
              top: topPos + 'px', left: leftPos + 'px'});
  prompt.find('select').focus();
}


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

kitin.directive('isbnvalidator', function(isbntools) {
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

// TODO: build properly configurable service out of this..
var autocompleteServices = {
  person: {
    serviceUrl: "/suggest/auth",
    templateId: "auth-completion-template",
    scopeObjectKey: "person",
    objectKeys: ['controlledLabel', 'familyName', 'givenName', 'birthYear', 'deathYear']
  },
  subject: {
    serviceUrl: "/suggest/subject",
    templateId: "subject-completion-template",
    addToScope: function (scope, obj) {
      if (scope.tuple.concepts === undefined) {
        scope.tuple.concepts = [];
      }
      scope.tuple.concepts.push(obj);
    },
    objectKeys: ['prefLabel']
  }
};

kitin.directive('kitinAutocomplete', function() {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {

      var conf = autocompleteServices[attrs.kitinAutocomplete];

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

        onNoMatch: function() {
          delete scope[conf.scopeObjectKey]['@id'];
          selected = false;
          isAuthorized = false;
          toggleRelatedFieldsEditable(false);
        },

        onItemSelect: function(item, completer) {
          selected = true;
          // TODO: do this (the isAuthorized part?) the angular way
          isAuthorized = !!item.data.authorized;
          if (conf.scopeObjectKey) {
            var obj = scope[conf.scopeObjectKey];
            obj['@id'] = item.data.identifier;
            conf.objectKeys.forEach(function (key) {
              obj[key] = item.data[key];
            });
          } else if (conf.addToScope) {
            // TODO: copy data? addObject?
            if (item.data.prefLabel) {
              delete item.data.broader;
            }
            conf.addToScope(scope, item.data);
          }
          scope.$apply();
        }
      });
    }
  };
});
