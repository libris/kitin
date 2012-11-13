// app.js

var kitin = angular.module('kitin', []);

kitin.config(
  ['$locationProvider',
    function($locationProvider) {
      $locationProvider.html5Mode(true);
    }]
);

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

// TODO: poor global state; can we put this in config for this directive?
var fadableEnabled = false;

kitin.directive('fadable', function() {
  return function(scope, elm, attrs) {
    if (fadableEnabled) {
      var duration = parseInt(attrs.fadable, 10);
      // TODO: adding this indicates that this is not a 'fadable', but a 'fieldbox'..
      elm.hide().fadeIn(duration, function () {
        if (fadableEnabled)
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


// controllers.js

function RecordCtrl($scope, $location, $http, $timeout) {
  var resourceId = $location.path();

  $http.get("/marcmap.json").success(function (map) {
    $http.get("/overlay.json").success(function (overlay) {
      $http.get(resourceId).success(function (struct) {
        ready(map, overlay, struct);
      });
    });
  });

  function ready(map, overlay, struct) {
    currentStruct = struct; // global object used for DEBUG:ging
    map = map.bib;

    marcjson.expandFixedFields(map, struct, true);

    $scope.toggleFuture = function () {
      if (!$scope.editable) {
        fadableEnabled = false;
        $scope.editable = marcjson.createEditMap(map, overlay, struct);
      } else {
        $scope.editable = null;
      }
    };

    $scope.map = map;
    $scope.struct = struct;

    $scope.typeOf = function (o) {
      return typeof o;
    }

    $scope.getKey = marcjson.getMapEntryKey;

    $scope.indicatorType = function (tag, indKey, indEnum) {
      var i = 0;
      for (var k in indEnum) if (i++) break;
      if (i === 1 &&
          (indEnum['_'].id === 'undefined' ||
            indEnum['_'].label_sv === 'odefinierad')) {
        return 'hidden';
      } else if (indEnum) {
        return 'select';
      } else {
        return 'plain';
      }
    }

    $scope.widgetType = function (tag, row) {
      if (tag === 'leader' || marcjson.fixedFieldParsers[tag]) {
        return 'fixedfield';
      } else if (typeof row === 'string') {
        return 'raw';
      } else {
        return 'field';
      }
    }

    $scope.fieldToAdd = null;

    $scope.promptAddField = function ($event, dfn, currentTag) {
      // TODO: set this once upon first rendering of view (listen to angular event)
      fadableEnabled = true;
      $scope.fieldToAdd = {
        tag: currentTag,
        execute: function () {
          marcjson.addField(struct, $scope.fieldToAdd.tag, dfn);
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
      this.fadeOut(function () { marcjson.removeField(struct, index); });
    };

    $scope.addSubField = marcjson.addSubField;

    $scope.removeSubField = function (index) {
      this.fadeOut(function () { marcjson.removeSubField(index); });
    };

    // TODO:
    //$scope.saveStruct = function () {
    //  var repr = angular.toJson(struct)
    //  ajax-save
    //}
  }

}


// services.js

// TODO: turn into promptService?
function openPrompt($event, promptSelect) {
  var tgt = $($event.target), off = tgt.offset(), width = tgt.width();
  var prompt = $(promptSelect).css(
      { top: off.top + 'px', left: off.left + width + 'px'})
    prompt.find('select').focus();
}


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

