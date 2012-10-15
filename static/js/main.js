// app.js
/*
angular.module('kitin', ['kitin.services']).config(
  ['$locationProvider', '$routeProvider',
    function($locationProvider, $routeProvider) {
      //locationProvider.html5mode(true);
      console.log(locationProvider.hashPrefix());
      locationProvider.hashPrefix('!');
    }
);
*/

// controllers.js

currentStruct = null;

function RecordCtrl($scope, $http, $location) {
  var bibid = $location.path();

  $http.get("/marcmap.json").success(function (map) {
    $http.get("/record/bib" + bibid).success(function (struct) {
      currentStruct = struct; // for DEBUG:ging
      // TODO: must edit pre-parsed fixed fields (and unparse before save..)
      map = map.bib;
      $scope.map = map;
      $scope.struct = struct;
      // TODO: see pre-parsed note
      var leader = marcjson.parseLeader(map, struct);
      $scope.leader = leader;

      $scope.typeOf = function (o) {
        return typeof o;
      }

      $scope.getKey = function (o) {
        for (var key in o) return key;
      }

      $scope.indicatorType = function (indEnum) {
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
        if (marcjson.fixedFieldParsers[tag]) {
          return 'fixedfield';
        } else if (typeof row === 'string') {
          return 'raw';
        } else {
          return 'field';
        }
      }

      // TODO: see pre-parsed note
      $scope.parseFixedField = function (tag, row, dfn) {
        return marcjson.fixedFieldParsers[tag](row, dfn, leader, map.fixprops);
      }

    });
  });

}

$(function() {

  /* TODO:
  angular.history.start({pushState: true, root: "/"});

  "record/bib/:bibid/lite": "lite"

  lite = function(bibid) {
    var tplt = _.template($('#marclite-template').html());
    $.getJSON("/marcmap.json", function (map) {
      $.getJSON("/record/bib/"+ bibid, function (struct) {
        $('#litebox').html(tplt({map: map.bib, struct: struct}));
      });
  });
  // TODO: onunload:
  //if (ajaxInProgress)
  //  confirm('ajaxInProgress; break and leave?')

  view.setupGlobalKeyBindings();
  view.setupBibAutocomplete();
  view.setupKeyBindings();
  */

});



/* TODO:
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

