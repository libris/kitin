// app.js


var kitin = angular.module('kitin', []);

kitin.config(
  ['$locationProvider', '$routeProvider',
    function($locationProvider, $routeProvider) {

      $locationProvider.html5Mode(true);

      $routeProvider
        .when('/edit/frbr/:recType/:recId',
           {templateUrl: '/partials/frbr', controller: FrbrCtrl})
        .when('/edit/marc/:recType/:recId',
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
    $http.get(path).success(function (struct) {
      currentPath = path;
      currentRecord = struct;
      record.resolve(struct);
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
    }
  };
});

// controllers.js

function FrbrCtrl($rootScope, $scope, $routeParams, conf, records) {

  conf.renderUpdates = false;
  $rootScope.editMode = 'frbr';

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
function openPrompt($event, promptSelect) {
  var tgt = $($event.target), off = tgt.offset(), width = tgt.width();
  var prompt = $(promptSelect).css(
      { top: off.top + 'px', left: off.left + width + 'px'})
    prompt.find('select').focus();
}


// directives.js

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
        if (conf.renderUpdates)
          elm.find('input, select').first().focus();
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
    //scope: {
    //  kitinAutocomplete: '=',
    //  kitinService: '='
    //},
    link: function(scope, elem, attrs) {
      var field = scope[attrs.kitinAutocomplete];
      var service = scope[attrs.kitinConfig].service;
      // TODO: always from 100 for auth?
      var tag = service == 'auth'? '100': field.getTagDfn().tag;
      var row = field.getRow();

      elem.autocomplete("/suggest/" + service, {

        inputClass: null,
        remoteDataType: 'json',
        autoWidth: null,
        filterResults: false,
        useCache: false,

        beforeUseConverter: function (repr) { return repr; },

        processData: function (doc) {
          if (!doc|| !doc.list) {
            console.log("Found no results!"); // TODO: notify no match?
            return [];
          }
          return doc.list.map(function (item) {
            var data = item.data;
            var value = getValueForFieldAndSubfield(data, tag);
            return {value: value, data: data};
          });
        },

        showResult: function (value, data) {
          return '<p><b>' + value + '</b><em>' + JSON.stringify(data) + '</em></p>';
        },

        onItemSelect: function(item, completer) {
          var selected = item.data[tag];
          // TODO: should also clear (or remove?) other subfields
          for (var subKey in selected) {
            var newValue = selected[subKey];
            if (subKey.slice(0, 3) === 'ind') {
              row[subKey] = newValue;
              continue;
            }
            for (var l=row.subfields, subfield=null, i=0; subfield=l[i++];)
              if (subfield[subKey])
                break;
            if (subfield) {
              subfield[subKey] = newValue;
            }
          }
          if (!scope.$$phase) {
              scope.$apply();
          }
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

