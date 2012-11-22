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


// controllers.js

function FrbrCtrl($rootScope, $scope, $routeParams, $http, conf) {

  conf.renderUpdates = false;
  $rootScope.editMode = 'frbr';

  $scope.typeOf = function (o) { return typeof o; }
  $scope.getKey = marcjson.getMapEntryKey;
  $scope.indicatorType = function (tag, indKey, indEnum) {
    var i = 0;
    for (var k in indEnum) if (i++) break;
    if (i === 1 &&
        (indEnum['_'].id === 'undefined' ||
          indEnum['_'].label_sv === 'odefinierad')) {
      return 'hidden';
    // TODO: hack before overlay field config is in place
    } else if (tag + indKey == '245ind1') {
      return 'boolean';
    } else if (tag + indKey == '245ind2') {
      return 'number';
    } else if (indEnum) {
      return 'select';
    } else {
      return 'plain';
    }
  };
  $scope.widgetType = marcjson.getWidgetType;

  var recType = $routeParams.recType,
    recId = $routeParams.recId,
    resourceId = "/record/" + recType + "/" + recId;

  conf.marcmap.then(function (map) {
    conf.overlay.then(function (overlay) {
      $http.get(resourceId).success(function (struct) {
        map = map[recType];
        $scope.entities = marcjson.createEntityGroups(map, overlay, struct);
        $scope.map = map;
      });
    });
  });

}


function MarcCtrl($rootScope, $scope, $routeParams, $http, conf, $timeout) {

  conf.renderUpdates = false;
  $rootScope.editMode = 'marc';

  $scope.typeOf = function (o) { return typeof o; }
  $scope.getKey = marcjson.getMapEntryKey;
  $scope.indicatorType = marcjson.getIndicatorType;
  $scope.widgetType = marcjson.getWidgetType;

  var recType = $routeParams.recType,
    recId = $routeParams.recId,
    resourceId = "/record/" + recType + "/" + recId;

  conf.marcmap.then(function (map) {
    $http.get(resourceId).success(function (struct) {
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


/* TODO: adapt to angular

view.setupBibAutocomplete();
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

  setupBibAutocomplete: function () {
    var view = this;
    var suggestUrl = "/suggest/auth";
    this.$('.marc-100 input.subfield-a'
      + ', .marc-600 input.subfield-a'
      + ', .marc-700 input.subfield-a').autocomplete(suggestUrl, {

        remoteDataType: 'json',
        autoWidth: null,
        filterResults: false,
        useCache: false,

        beforeUseConverter: function (repr) {
          // TODO: get sibling fields and narrow selection(?)
          return repr;
        },

        processData: function (results) {
          if (!results) {
            console.log("Found no results!"); // TODO: notify no match?
            return [];
          }
          return results.map(function (item) {
            var value = view.getValueForFieldAndSubfield(item, '100');
            return {value: value, data: item};
          });
        },

        showResult: function (value, data) {
          return view.bibAutocompleteTemplate({value: value, data: data});
        },

        onItemSelect: function(item, completer) {
          var subfieldD = $('.subfield-d', completer.dom.$elem.parent().siblings());
          subfieldD.val(item.data['100']['d']).trigger('update');
        }

    });
  },

  getValueForFieldAndSubfield: function (item, fieldKey, subKey) {
    subKey = subKey || 'a';
    var field = item[fieldKey];
    return field[subKey];
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

