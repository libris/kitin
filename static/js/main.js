//record
// - uid
// - marc
// - spill

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
  field_row_template: _.template($("#field-row-template").html()),
  control_row_template: _.template($("#control-row-template").html()),
  leader_template: _.template("<li class='control_field'><label>Leader: </label><span><%= leader %></span></li>"),

  render: function() {
    $(this.el).html(this.leader_template({leader: this.model.leader.get('value')}));

    for (field in this.model.control_fields) {
      $(this.el).append(this.control_row_template({
        'label': field,
        'value': this.model.control_fields[field].get('value')
      }));
    }

    for (field in this.model.fields) {
      var rows = this.model.fields[field].get('rows');
      for(row in rows) {
        $(this.el).append(this.field_row_template({
          'label': field,
          'ind1': rows[row]['ind1'],
          'ind2': rows[row]['ind2'],
          'subfields': rows[row]['subfields'],
        }));
      }
    }
  }
});

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
});
