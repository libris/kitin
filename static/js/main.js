function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if(results == null)
      return "";
    else
      return decodeURIComponent(results[1].replace(/\+/g, " "));
}

// app.js

var kitin = angular.module('kitin', []);

kitin.config(
  ['$locationProvider', '$routeProvider',
    function($locationProvider, $routeProvider) {

      $locationProvider.html5Mode(true);
      $routeProvider
        .when('/',
              {templateUrl: '/partials/index', controller: IndexCtrl})
        .when('/search',
              {templateUrl: '/partials/search', controller: SearchCtrl})
        .when('/edit/:recType/new',
              { templateUrl: '/partials/edit', controller: NewRecordCtrl})
        .when('/edit/:recType/:recId',
              {templateUrl: '/partials/edit', controller: FrbrCtrl})
        .when('/marc/:recType/:recId',
              {templateUrl: '/partials/marc', controller: MarcCtrl})
        ;//.otherwise({redirectTo: '/'});

    }]
);

kitin.factory('conf', function ($http, $q) {
  var marcmap = $q.defer(),
    overlay = $q.defer();
  $http.get("/marcmap.json").success(function (o) {
    marcmap.resolve(o);
  });
  $http.get("/overlay.json").success(function (o) {
    overlay.resolve(o);
  });
  return {
    marcmap: marcmap.promise,
    overlay: overlay.promise,
    // TODO: off between controller init and completion;
    // use angular events for this?
    renderUpdates: false
  };
});

kitin.factory('records', function ($http, $q) {
  // TODO: use proper angularjs http cache?
  var currentPath, currentRecord;
  function loadPromise(path) {
    var record = $q.defer();
    $http.get(path).success(function (struct, status, headers) {
      currentPath = path;
      currentRecord = struct;
      record['recdata'] = struct;
      record['etag'] = headers('etag');
      record.resolve(record);
    });
    return record.promise;
  }

  function saveRecord(type, id, data, etag) {
    var record = $q.defer();
    $http.put("/record/" + type + "/" + id, data, {headers: {"If-match":etag}}).success(function(data, status, headers) {
      record['recdata'] = data;
      record['etag'] = headers('etag');
      record.resolve(record);
    }).error(function() {
      console.log("og crap, we failed :(");
    });
    return record.promise;
  }

  function createRecord(type, data) {
    var record = $q.defer();
    $http.post("/record/" + type + "/create", data).success(function(data, status, headers) { 
      record.resolve(data);
    });
    return record.promise;
  }

  return {
    get: function (type, id) {
      var path = "/record/" + type + "/" + id;
      if (currentPath === path && currentRecord) {
        return {then: function (callback) { callback(currentRecord); }};
      } else {
        return loadPromise(path);
      }
    },
    save: function(type, id, data, etag) {
      return saveRecord(type, id, data, etag);
    },
    create: function(type, data) {
      return createRecord(type, data);
    }
  };
});

kitin.factory('resources', function($http) {
  var resources = {
    getResourceList: function(restype) {
      var promise = $http.get("/resource?type=" + restype).then(function(response) {
        return response.data;
      });
      return promise;
    }
  };
  return resources;
});

// Gather constants from angular or flask context
kitin.factory('constants', function(flaskConstants) {
  var constants = {
    uiConstantOfChoice: "Whatever"
  };

  angular.extend(constants, flaskConstants);
  return {
    get: function(key) {
      return constants[key];
    },
    all: function() {
      return constants;
    }
  };
});


/**
 * Global scope functions.
 */
kitin.run(function($rootScope) {

  $rootScope.isEmpty = function(obj) { return angular.equals({},obj) };

  $rootScope.typeOf = function (o) { return typeof o; }

});

/**
 * Global filters.
 */
kitin.filter('ensureArray', function($rootScope) {
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
        if (victim.length < 50) {
            return victim;
        } else {
            return String(victim).substring(0, 47) + "...";
        }
    };
});

function IndexCtrl($scope, $http) {
  document.body.className = 'index';
  $scope.drafts = $http.get("/drafts").success(function(data) {
    $scope.drafts = data.drafts;
  });

  $scope.delete = function(type, id) {
    $http.post("/record" + "/" + type + "/" + id + "/draft/delete").success(function(data, status) {
      $scope.drafts = data.drafts;
    });
  }
}

function SearchCtrl($scope, $http, $location, $routeParams) {

  var previous_facets = getParameterByName("f");
  document.body.className = 'search';

  $scope.q = $routeParams.q;
  $scope.f = $routeParams.f;
  var url = "/search?q=" + $scope.q;
  if($scope.f != undefined) {
    url += "&f=" + $scope.f;
  }

  $scope.search = function() {
    $location.url(url);
  };

  if (!$routeParams.q) {
    return;
  }

  facet_terms = []; // Poor mans localization

  facet_terms['about.@type'] = "Typer";
  facet_terms['about.dateOfPublication'] = "Datum";
  $scope.facet_terms = facet_terms;

  $http.get(url).success(function(data) {
    $scope.result = data;

    // iterate facets to add correct slug
    // if can do in angularistic fashion; then please do and remove this!
    var result = []
    for(facet_type in data.facets) {
      var new_facet = {};
      new_facet['type'] = facet_type;
      new_facet['items']= [];
      for(item in data.facets[facet_type]) {
        var subitem = {};
        var subitem_object = {};
        subitem_object[item] = data.facets[facet_type][item];
        subitem['object'] = subitem_object;
        var slug = [facet_type, item].join(":");
        if($.inArray(slug, previous_facets.split(" ")) != -1) {
          subitem['slug'] = "/search?q=" + $scope.q + "&f=" + $.grep(previous_facets.split(" "), function(val) {return val != slug});
        } else {
          subitem['slug'] = "/search?q=" + $scope.q + "&f=" + slug + previous_facets;
        }
        new_facet['items'].push(subitem);
      }
      result.push(new_facet);
    }
    $scope.my_facets = result;
  });

}

function NewRecordCtrl($location, $scope, records, $http, $routeParams) {
  document.body.className = 'edit new';
  var recType = $routeParams.recType;
  $http.get('/record/bib/new').success(function(data) {
    $scope.record = data;
  });

  $scope.save = function() {
    records.create(recType, $scope.record).then(function(data) {
      $location.url('/edit/bib/' + data['document_id']);
    });
  }
}

function FrbrCtrl($scope, $http, $routeParams, $timeout, records, resources, constants) {
  document.body.className = 'edit';
  var recType = $routeParams.recType, recId = $routeParams.recId;
  var path = "/record/" + recType + "/" + recId;

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
      },
    };
    $timeout(function() {
      openPrompt($event, "#confirmDeleteDraftDialog");
    });
  }

  records.get(recType, recId).then(function(data) {
    bibid = data['recdata']['controlNumber'];
    $scope.record = data['recdata'];
    $scope.etag = data['etag'];
    $scope.user_sigel = constants.get("user_sigel")
    $scope.all_constants = constants.all();
    $http.get("/record/" + recType + "/" + recId + "/holdings").success(function(holdata) {
      $scope.holdings = holdata.list;
      var holding_etags = {};
      var items = holdata.list;
      for(var i in items) {
        $http.get("/holding/"+ items[i]['@id'].split("/").slice(-2)[1]).success(function(data, status, headers) {
          holding_etags[data['@id']] = headers('etag');
        });
      }
      $scope.holding_etags = holding_etags;
    });
  });

  $scope.save_holding = function(holding) {
    var etag = $scope.holding_etags[holding['@id']];
    holding['holdingFor'] = { '@id': "/"+recType+"/"+recId };
    if(etag != undefined) {
      $http.put("/holding/" + holding['@id'].split("/").slice(-2)[1], holding, {headers: {"If-match":etag}}).success(function(data, status, headers) {
        $scope.holding_etags[data['@id']] = headers('etag');
      }).error(function(data, status, headers) {
        console.log("ohh crap!");
      });
    } else {
      $http.post("/holding", holding).success(function(data, status, headers) {
        $scope.holding_etags[data['@id']] = headers('etag');
      }).error(function(data, status, headers) {
        console.log("ohh crap!");
      });

    }
  }

  $scope.delete_holding = function(index) {
    var holding_id = $scope.holdings[index]['@id'].split("/").slice(-2)[1];
    $http.delete("/holding/" + holding_id).success(function(data, success) {
      console.log("great success!");
      $scope.holdings.splice(index,1);
    }).error(function() {
      console.log("oh crap!");
    })
  }

  $scope.save = function() {
    var if_match_header = $scope.etag.replace(/["']/g, "");
    records.save(recType, recId, $scope.record, $scope.etag.replace(/["']/g, "")).then(function(data) {
      $scope.record = data['recdata']
      $scope.etag = data['etag'];
    });
  }

  $scope.save_draft = function() {
    $http.post("/record/"+$routeParams.recType+"/"+$routeParams.recId+"/draft", $scope.record, {headers: {"If-match":$scope.etag}}).success(function(data, status) {
      $scope.draft = data;
      $scope.draft.type = data['@id'].split("/").slice(-2)[0];
      $scope.draft.id = data['@id'].split("/").slice(-2)[1];
      $('.flash_message').text("Utkast sparat!");
    });
  }

  $http.get("/draft/"+recType+"/"+recId).success(function(data, status, headers) {
    $scope.draft = data;
    $scope.draft.type = data['@id'].split("/").slice(-2)[0];
    $scope.draft.id = data['@id'].split("/").slice(-2)[1];
    $scope.etag = headers('etag');
  }).error(function(data, status) {
    console.log(status);
  });

  $scope.add_holding = function(holdings) {
    holdings.push({shelvingControlNumber: "", location: constants.get("user_sigel")});
  }

  $scope.add_person = function(authors) {
    authors.push({ authoritativeName: "", birthYear: "" });
  }

  $scope.remove_person = function(index) {
    $scope.record.about.instanceOf.authorList.splice(index,1);
  }

  // GET RESOURCES
  resources.getResourceList("lang").then(function(data) {
    /*$scope.langlist = [];
    var obj;
    for (var key in data) {
        $scope.langlist.push({
        "code" : key,
        "name" : data[key]
        });
    }*/
    $scope.langlist = data;
    //console.log("LANNGSGSG", $scope.langlist);
    //console.log("LANNGSGSG", data);
  });
  resources.getResourceList("country").then(function(data) {
    $scope.countrylist = data;
  });
  resources.getResourceList("function").then(function(data) {
    $scope.functionlist = data;
  });
  resources.getResourceList("nationality").then(function(data) {
    $scope.nationalitylist = data;
  });

}


function FrbrCtrl_old($rootScope, $scope, $routeParams, $timeout, conf, records) {

  conf.renderUpdates = false;
  $rootScope.editMode = 'normal';

  $scope.getKey = marcjson.getMapEntryKey;

  var recType = $routeParams.recType, recId = $routeParams.recId;

  conf.marcmap.then(function (map) {
    conf.overlay.then(function (overlay) {
      records.get(recType, recId).then(function (struct) {
        map = map[recType];
        $scope.entities = marcjson.createEntityGroups(map, overlay, struct);
        $scope.map = map;
      });
    });
  });

  // TODO: unify prompt* functions with the MarcCtrl equivalents

  $scope.promptAddField = function ($event, fieldset) {
    // TODO: set this once upon first rendering of view (listen to angular event)
    conf.renderUpdates = true;
    // TODO: getFieldDefs(), filtered by "if repeatable or not in fielset"
    var fieldDefs = fieldset.fieldDefs;
    var selectedTag = fieldDefs.length? fieldDefs[0].tag : null;
    $scope.fieldToAdd = {
      fieldDefs: fieldDefs,
      tag: selectedTag,
      select: function (tag) {
        this.tag = tag;
        this.execute();
      },
      execute: function () {
        fieldset.addField($scope.fieldToAdd.tag);
        $scope.fieldToAdd = null;
      },
      abort: function () {
        $scope.fieldToAdd = null;
      }
    };
    $timeout(function () {
      openPrompt($event, '#prompt-add-field', '.dropdown-menu');
    });
  }

  $scope.promptAddSubField = function (o, field, index) {
    console.log(arguments);
  }
  $scope.promptAddSubField = function ($event, dfn, row, currentSubCode, index) {
    $scope.subFieldToAdd = {
      subfields: dfn.subfield,
      code: currentSubCode,
      select: function (code) {
        this.code = code;
        this.execute();
      },
      execute: function () {
        marcjson.addSubField(row, $scope.subFieldToAdd.code, index);
        $scope.subFieldToAdd = null;
      },
      abort: function () {
        $scope.subFieldToAdd = null;
      }
    };
    $timeout(function () {
      openPrompt($event, '#prompt-add-subfield', '.dropdown-menu');
    });
  }


}


function MarcCtrl($rootScope, $scope, $routeParams, conf, records, $timeout) {

  conf.renderUpdates = false;
  $rootScope.editMode = 'marc';

  $scope.getKey = marcjson.getMapEntryKey;
  $scope.indicatorType = marcjson.getIndicatorType;
  $scope.widgetType = marcjson.getWidgetType;

  var recType = $routeParams.recType, recId = $routeParams.recId;

  conf.marcmap.then(function (map) {
      records.get(recType, recId).then(function (struct) {
      map = map[recType];
      marcjson.expandFixedFields(map, struct, true);
      $scope.map = map;
      $scope.struct = struct;
    });
  });

  $scope.fieldToAdd = null;

  $scope.promptAddField = function ($event, dfn, currentTag) {
    // TODO: set this once upon first rendering of view (listen to angular event)
    conf.renderUpdates = true;
    $scope.fieldToAdd = {
      tag: currentTag,
      execute: function () {
        marcjson.addField($scope.struct, $scope.fieldToAdd.tag, dfn);
        $scope.fieldToAdd = null;
      },
      abort: function () {
        $scope.fieldToAdd = null;
      }
    };
    $timeout(function () {
      openPrompt($event, '#prompt-add-field');
    });
  }

  $scope.subFieldToAdd = null;

  $scope.promptAddSubField = function ($event, dfn, row, currentSubCode, index) {
    $scope.subFieldToAdd = {
      subfields: dfn.subfield,
      code: currentSubCode,
      execute: function () {
        marcjson.addSubField(row, $scope.subFieldToAdd.code, index);
        $scope.subFieldToAdd = null;
      },
      abort: function () {
        $scope.subFieldToAdd = null;
      }
    };
    $timeout(function () {
      openPrompt($event, '#prompt-add-subfield');
    });
  }

  $scope.removeField = function (index) {
    this.fadeOut(function () { marcjson.removeField($scope.struct, index); });
  };

  $scope.addSubField = marcjson.addSubField;

  $scope.removeSubField = function (index) {
    this.fadeOut(function () { marcjson.removeSubField(index); });
  };

  // TODO:
  //$scope.saveStruct = function () {
  //  var repr = angular.toJson($scope.struct)
  //  ajax-save
  //}

}


// services.js

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


// directives.js

/* TODO: Turn this into a more declarative kitin-subfield directive?
  data-kitin-codekey="promptAddSubField($elem, field, $index)"
kitin.directive('kitinCodekey', function () {
  return function (scope, elm, attrs) {
    var expr = attrs.kitinCodekey;
    elm.jkey("alt+t", function () {
      scope.$apply(expr);
    });
  }
});
*/
/*
kitin.directive('direTest', function() {
    return function (scope, elm, attr) {
        var tjonga = attrs.tjonga
    return {
        restrict: 'A',
        template: '<span>ALATESTING</span>'
    }
});*/

kitin.directive('keyEnter', function () {
  return function (scope, elm, attrs) {
    var expr = attrs.keyEnter;
    elm.jkey('enter', function () {
      scope.$apply(expr);
    });
  }
});

kitin.directive('keyEsc', function () {
  return function (scope, elm, attrs) {
    var expr = attrs.keyEsc;
    elm.jkey('esc', function () {
      scope.$apply(expr);
    });
  }
});


kitin.directive('fadable', function(conf) {
  return function(scope, elm, attrs) {
    var duration = parseInt(attrs.fadable, 10);
    if (conf.renderUpdates) {
      // TODO: adding this indicates that this is not a 'fadable', but a 'fieldbox'..
      elm.hide().fadeIn(duration, function () {
        if (conf.renderUpdates) {
          var fieldExpr = elm.has('input')? 'input' : 'select';
          elm.find(fieldExpr).first().focus();
        }
      });
      var body = $('body');
      var scrollTop = $(document).scrollTop(),
        winHeight = $(window).height(),
        scrollBot = scrollTop + winHeight,
        offsetTop = elm.offset().top - body.offset().top;
      if (offsetTop < scrollTop || offsetTop > scrollBot) {
        body.animate({scrollTop: offsetTop - (winHeight / 2)});
      }
    }
    scope.fadeOut = function(complete) {
      elm.fadeOut(duration / 2, function() {
        if (complete) {
          complete.apply(scope);
        }
      });
    };
  };
});


kitin.directive('isbnvalidator', function() {
  function isvalid_isbn_13(n) {
    var check = 0;
    for (i = 0; i < 13; i += 2) { check += +n[i]; }
    for (i = 1; i < 12; i += 2) { check += 3 * +n[i]; }
    return (check % 10 === 0);
  }

  function isvalid_isbn_10(n) {
    var check = 0;
    for(i = 0; i < 10;i++) {
      if(n[i] == "X") {
        check += 10 * (10-i);
      } else {
        check += n[i] * (10-i);
      }
    }
    return (check % 11 === 0);
  }

  function clean_isbn(n) {
    return n.replace(/-/g,'').replace(/\s+/,'')
  }

  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        var isbn = clean_isbn(viewValue);
        if (isbn.length != 10 && isbn.length != 13) {
          ctrl.$setValidity('isbnvalidator', false);
        }
        if (isbn.length == 13) {
          ctrl.$setValidity('isbnvalidator', isvalid_isbn_13(isbn));
        } else if (isbn.length == 10) {
          ctrl.$setValidity('isbnvalidator', (isvalid_isbn_10(isbn)));
        }
        return viewValue;
      });
    }
  }
});

kitin.directive('kitinAutocomplete', function() {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {

      var templateId = attrs.kitinTemplate;
      /* TODO: IMPROVE: replace current autocomplete mechanism and use angular
      templates ($compile) all the way.. It if is fast enough..*/ 
      var template = _.template(jQuery('#' + 'auth-completion-template').html())
      var selected = false;
      var is_authorized = false;

      function toggleRelatedFieldsEditable(val) {
        $(elem).closest('.person').find('.authdependant').prop('disabled', val);
      };

      elem.autocomplete("/suggest/auth", {

        inputClass: null,
        remoteDataType: 'json',
        autoWidth: null,
        filterResults: false,
        useCache: false,

        // TODO: is this used?
        beforeUseConverter: function (repr) { return repr; },

        processData: function (doc) {
          if (!doc|| !doc.list) {
            is_authorized = false;
            selected = false;
            toggleRelatedFieldsEditable(false);
            console.log("Found no results!"); // TODO: notify no match to user
            return [];
          }
          return doc.list.map(function(item) {
            result = item.data;
            result['authorized'] = item.authorized;
            result['identifier'] = item.identifier;
            return {value: item.data.authoritativeName, data: result};
          });
        },

        showResult: function (value, data) {
          return template({data: data});
        },

        onFinish: function() {
          if(selected && is_authorized) {
            toggleRelatedFieldsEditable(true);
          } else {
            toggleRelatedFieldsEditable(false);
          }
        },

        onNoMatch: function() {
          // Delete fields that are generated by the WHELK
          delete scope.person.authorizedAccessPoint;
          delete scope.person.givenName;
          delete scope.person.familyName;
          delete scope.person.name;
          delete scope.person['@id'];
          selected = false;
          is_authorized = false;
          toggleRelatedFieldsEditable(false);
        },

        onItemSelect: function(item, completer) {
          selected = true;
          var key = scope.person['$$hashKey'];
          var our_person = _.find(scope.$parent.work.authorList, function(e) {
            return e['$$hashKey'] == key;
          })
          our_person.birthYear = item.data.birthYear;
          our_person.deathYear = item.data.deathYear;
          // TODO: If possible; learn how to do this the angular way
          if(item.data.authorized) {
            is_authorized = true;
          } else {
            is_authorized = false;
          }
          scope.person.authoritativeName = item.data.authoritativeName;
          scope.person['@id'] = item.data.identifier;
          scope.$apply();
        }
      });
    }
  };
});



function getValueForFieldAndSubfield(data, fieldKey, subKey) {
  subKey = subKey || 'a';
  var field = data[fieldKey];
  return field[subKey];
}
// Do we need a jquery namespace here? 
(function($) {
$("ul.facetlist").has("li.overflow").each(function() {
    var $facetlist = $(this);
    $('<a class="show_more" href="#">Visa fler</a>').insertAfter($facetlist).click(function() {
        var $toggler = $(this);
        $('li.overflow', $facetlist).toggleClass('facet-closed');
        $toggler.text($("li.facet-closed", $facetlist).length? "Visa fler" : "Visa färre");
        return false
    });
});
}(jQuery));
/* TODO: adapt to angular

view.setupGlobalKeyBindings();
view.setupKeyBindings();

// TODO: onunload:
//if (ajaxInProgress)
//  confirm('ajaxInProgress; break and leave?')

var view = {

  setupGlobalKeyBindings: function () {
    var model = this.model;
    $("input[name='draft']").on('click', function() {
      var model_as_json = model.toJSON();
      delete model_as_json.id;
      $.ajax({
        url: '/record/bib/'+model.id+'/draft',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(model_as_json),
      }).done(function() {
        displaySuccessAlert("Sparade framgångsrikt ett utkast av " + model.id);
      }).error(function() {
        displayFailAlert("Kunde inte spara utkast av " + model.id);
      });
    });
    $("input[name='publish']").on('click', function() {
      model.save({},
        {
          error: function() { displayFailAlert("Kunde inte publicera " + model.id); },
          success: function() { displaySuccessAlert("Sparade framgångsrikt " + model.id); }
        });
    });
    $(document).jkey('ctrl+b',function(){
      model.save({},
        {
          error: function() { displayFailAlert("Kunde inte publicera " + model.id); },
          success: function() { displaySuccessAlert("Sparade framgångsrikt " + model.id); }
        });
    });
  },

  setupKeyBindings: function () {
    $('input', this.el).jkey('f3',function() {
        alert('Insert row before...');
    });
    $('input', this.el).jkey('f4',function() {
        alert('Insert row after...');
    });
    //$('input', this.el).jkey('f2',function() {
    //    alert('Show valid marc values...');
    //});
    //$(this.el).jkey('ctrl+t', function() {
    //  this.value += '‡'; // insert subkey delimiter
    //});
    // TODO: disable when autocompleting:
    //$('input', this.el).jkey('down',function() {
    //    alert('Move down');
    //});
  }
};

function displaySuccessAlert(message) {
  var alert = $("<div class='alert alert-success'><strong>Succe!</strong></div>");
  var message = $("<p class='message'></p>").text(message);
  var close_btn = $("<a class='close' data-dismiss='alert' href='#'>×</a>");
  $(alert).append(close_btn).append(message);
  $('.alert-wrapper').append(alert);
}

function displayFailAlert(message) {
  var alert = $("<div class='alert alert-error'><strong>Fadäs!</strong></div>");
  var message = $("<p class='message'></p>").text(message);
  var close_btn = $("<a class='close' data-dismiss='alert' href='#'>×</a>");
  $(alert).append(close_btn).append(message);
  $('.alert-wrapper').append(alert);
}

*/

