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
      record['bibdata'] = struct;
      record['etag'] = headers('etag');
      record.resolve(record);
    });
    return record.promise;
  }

  function saveRecord(type, id, data, etag) {
    var record = $q.defer();
    $http.put("/record/" + type + "/" + id, data, {headers: {"If-match":etag}}).success(function(data, status, headers) {
      record['bibdata'] = data;
      record['etag'] = headers('etag');
      record.resolve(record);
    }).error(function() {
      console.log("og crap, we failed :(");
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

/*kitin.factory('bibdb', function($http) {
    var lib = {
        getResourceList: function(sigel) {
            var promise = $http.get("/bibdb?sigel=" + sigel).then(function(response) {
                return response.data;
            });
            return promise;
        }
    };
    return lib;
});*/

function IndexCtrl($scope, $http) {
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
    $scope.q = $routeParams.q;
    var url = "/search?q=" + $scope.q;
    $scope.search = function() {
        var url = "/search?q=" + $scope.q;
        $location.url(url);
    };
    if (!$routeParams.q) {
        return;
    }
    $http.get(url).success(function(data) {
        $scope.result = data;
    });
}

function FrbrCtrl($scope, $http, $routeParams, $timeout, records, resources) {
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
      bibid = data['bibdata']['controlNumber'];
      $scope.record = data['bibdata'];
      $scope.etag = data['etag'];
      var holdpath = "/holdings?bibid=/bib/" + bibid;
      $http.get(holdpath).success(function(holdata) {
          $scope.holdings = holdata;
      }); 
  });

  $scope.save = function() {
    var if_match_header = $scope.etag.replace(/["']/g, "");
    records.save(recType, recId, $scope.record, $scope.etag.replace(/["']/g, "")).then(function(data) {
      $scope.record = data['bibdata']
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

  // GET RESOURCES
  resources.getResourceList("lang").then(function(data) {
      $scope.langlist = data;
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

  $scope.typeOf = function (o) { return typeof o; }
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

  $scope.typeOf = function (o) { return typeof o; }
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


kitin.directive('kitinAutocomplete', function() {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {

      var templateId = attrs.kitinTemplate;
      /* TODO: IMPROVE: replace current autocomplete mechanism and use angular
      templates ($compile) all the way.. It if is fast enough..*/ 
      var template = _.template(jQuery('#' + 'auth-completion-template').html())

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

        onItemSelect: function(item, completer) {
          var key = scope.person['$$hashKey'];
          var our_person = _.find(scope.$parent.work.authorList, function(e) {
            return e['$$hashKey'] == key;
          })
          our_person.birthYear = item.data.birthYear;
          our_person.deathYear = item.data.deathYear;
          // TODO: If possible; learn how to do this the angular way
          if(item.data.authorized) {
            $(elem).closest('.person').find('.authdependant').prop('disabled', true);
          } else {
            $(elem).closest('.person').find('.authdependant').prop('disabled', false);
          }
          scope.person.authoritativeName = item.data.authoritativeName;
          scope.person.authorizedAccessPoint = item.data.authorizedAccessPoint;
          scope.person.givenName = item.data.givenName;
          scope.person.familyName = item.data.familyName;
          scope.person.name = item.data.name;
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

