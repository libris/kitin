//record
// - uid
// - marc
// - spill


$(function() {
  this.collection = new Collection();
  this.router = new Router([this.collection]);

  this.router.on("route:record", function(data) {
    //this.collection.get(data).fetch();
  });

  this.collection.on('add', function(model) {
    var view = new View({model: model});
    view.render();
  });

  Backbone.history.start({pushState: true, root: "/"});

  // TODO: onunload:
  //if (ajaxInProgress)
  //  confirm('ajaxInProgress; break and leave?')

});


var Leader = Backbone.Model.extend({ });
var Field = Backbone.Model.extend({ });
var ControlField = Backbone.Model.extend({ });

var Record = Backbone.Model.extend({
  fields: {},
  control_fields: {},
  urlRoot:'/record/bib',
  parse: function(response) {
    var fields = response['fields'];
    for (field in fields) {
      var key = _.keys(fields[field])[0];
      var value = _.values(fields[field])[0];
      if(parseInt(key, 10) <= 8) { // We have a ControlField?
        this.control_fields[key] = new ControlField({value: value});
      } else {
        if(_.include(_.keys(this.fields), key)) {
          this.fields[key].get('rows').push(value);
        } else {
          this.fields[key] = new Field({rows: [value]});
        }
      }
    }
    this.leader = new Leader({value: response['leader']});
  },
});

var Collection = Backbone.Collection.extend({
  model: Record,
});

var Router = Backbone.Router.extend({
  initialize: function(options) {
    this.collection = options[0];
    self = this;
  },
  routes: {
    "record/bib/:bibid": "record"
  },
  record: function(bibid) {
    var record = new Record({id: bibid});
    record.fetch({
      success: function(model, response) {
        self.collection.add(model);
      },
    });
  },
});

var View = Backbone.View.extend({
  el: $('#fields'),
  leader_template: _.template($('#leader-template').html()),
  field_row_template: _.template($('#field-row-template').html()),
  control_row_template: _.template($('#control-row-template').html()),
  bib_autocomplete_template: _.template($('#bib-autocomplete-template').html()),

  render: function() {

    this.setupGlobalKeyBindings();

    $(this.el).html(this.leader_template({leader: this.model.leader.get('value')}));

    for (field in this.model.control_fields) {
      $(this.el).append(this.control_row_template({
        label: field,
        value: this.model.control_fields[field].get('value')
      }));
    }

    for (field in this.model.fields) {
      var rows = this.model.fields[field].get('rows');
      for(row in rows) {
        $(this.el).append(this.field_row_template({
          label: field,
          ind1: rows[row]['ind1'],
          ind2: rows[row]['ind2'],
          subfields: rows[row]['subfields'],
        }));
      }
    }

    this.setupBibAutocomplete();
    this.setupRecordKeyBindings();

  },

  setupGlobalKeyBindings: function () {
    $(document).jkey('ctrl+b',function(){
        alert('Publish record...');
    });
  },

  setupRecordKeyBindings: function () {
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
  },

  setupBibAutocomplete: function () {
    var view = this;
    var suggestUrl = "/suggest/auth";
    $('.marc100 input.subfields'
      + ', .marc600 input.subfields'
      + ', .marc700 input.subfields', this.el).autocomplete(suggestUrl, {

        remoteDataType: 'json',

        beforeUseConverter: function (repr) {
          return MARC.getSubFieldA(repr);
        },

        processData: function (results) {
          return results.map(function (item) {
            var value = view.authSuggestItemToFieldRepr(item);
            return {value: value, data: item};
          });
        },

        showResult: function (value, data) {
          return view.bib_autocomplete_template({value: value, data: data});
        },

        onItemSelect: function(item) {
          //console.log(item);
        }

    });
  },

  authSuggestItemToFieldRepr: function (item) {
    var f100 = item.marc['100'];
    return "a\u2021 "+ f100.a +",d\u2021 "+ f100.d;
  }

});

// TODO: merge with marcjson.js and marcmap.json
var MARC = {

  fieldExpr: new RegExp('\\w\u2021\\s*(.+?)((\\s*,?\\s*\\w\u2021)|$)'),

  /**
   * Expect:
   *  this.getSubFieldA("a‡ Jansson, Tove,d‡ 1914-2001")[1] == 'Jansson, Tove'
   *  this.getSubFieldA("a‡ Jansson, Tove")[1] == 'Jansson, Tove'
   *  this.getSubFieldA("Jansson, Tove")[1] == null
   */
  getSubFieldA: function (repr) {
    var parsed = repr.match(this.fieldExpr);
    return parsed? parsed[1] : repr;
  }

}
