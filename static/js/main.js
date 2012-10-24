// app.js

angular.module('kitin', []).config(
  ['$locationProvider',
    function($locationProvider) {
      $locationProvider.html5Mode(true);
    }]
);


// controllers.js

function RecordCtrl($scope, $http, $location) {
  var resourceId = $location.path();

  $http.get("/marcmap.json").success(function (map) {
    $http.get(resourceId).success(function (struct) {
      currentStruct = struct; // for DEBUG:ging
      map = map.bib;
      expandFixedFields(map, struct);

      $scope.map = map;
      $scope.struct = struct;

      $scope.typeOf = function (o) {
        return typeof o;
      }

      $scope.getKey = getMapEntryKey;

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

      $scope.addField = function (dfn, currentTag) {
        var fields = struct.fields;
        var tagToAdd = prompt("Insert field:",
                              dfn && dfn.repeatable? currentTag : "");
        if (!tagToAdd)
          return;
        for (var i=0, ln=fields.length; i < ln; i++) {
          var field = fields[i];
          var tag = getMapEntryKey(field);
          if (tag > tagToAdd) break;
        }
        // TODO: get definition from marcmap etc.
        var o = {};
        var row = {ind1: " ", ind2: " ", subfields: [{a: "..."}]};
        o[tagToAdd] = row;
        fields.splice(i, 0, o);
      }

      $scope.removeField = function (index) {
        struct.fields.splice(index, 1);
      }

      $scope.addSubField = function (row, subCode, index) {
        if (!subCode)
          subCode = prompt("Add subfield:");
        if (!subCode)
          return;
        var o = {};
        o[subCode] = "";
        row.subfields.splice(index + 1, 0, o);
      }

      $scope.removeSubField = function (row, index) {
        row.subfields.splice(index, 1);
      }

    });
  });

}


/**
 * Get one key from an object expected to contain only one key.
 */
function getMapEntryKey(o) {
  for (var key in o) return key;
}


/**
 * Expands fixed marc fields into objects, in-place. Uses a marc-map containing
 * parsing instructions. The resulting objects have toJSON methods responsible
 * for turning them back into fixed field values upon serialization.
 */
function expandFixedFields(map, struct) {
  // TODO: must edit pre-parsed fixed fields (and unparse before save..)
  var leader = marcjson.parseLeader(map, struct, true);
  struct.leader = leader;
  // TODO: see pre-parsed note
  for (var tag in marcjson.fixedFieldParsers) {
    struct.fields.forEach(function (field) {
      var row = field[tag];
      if (row) {
        var parse = marcjson.fixedFieldParsers[tag];
        var dfn = map[tag];
        field[tag] = parse(row, dfn, leader, map.fixprops, true);
      }
    });
  }
}


// TODO: saveStruct
//angular.toJson(struct)


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

