//record
// - uid
// - marc
// - spill

var Leader = Backbone.Model.extend({ });
var Field = Backbone.Model.extend({
});

var Record = Backbone.Model.extend({
  fields: {},
  urlRoot:'/record',
  parse: function(response) {
    var fields = response['fields'];
    for (field in fields) {
      var key = _.keys(fields[field])[0];
      if(key <= 008) {
      } else {
        var new_field = new Field(_.values(fields[field])[0]);
        this.fields[key] = new_field;
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
    "record/:bibid": "record"
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
  leader_template: _.template("<li class='control_field'><%= leader %></li>"),

  render: function() {
    $(this.el).html(this.leader_template({leader: this.model.leader.get('value')}));
    var fields = this.model.fields;
    for (field in fields) {
      $(this.el).append(this.field_row_template({
        'label': field,
        'ind1': fields[field].get('ind1'),
        'ind2': fields[field].get('ind2'),
        'subfields': fields[field].get('subfields'),
      }));
    }
  },
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
