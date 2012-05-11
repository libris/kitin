//record
// - uid
// - marc
// - spill

var Record = Backbone.Model.extend({
  urlRoot:'/record',
  parse: function(response) {
    console.log(response);
  }
});

var Workspace = Backbone.Router.extend({
  routes: {
    "record/:bibid": "record"
  },

  record: function(bibid) {
    var record = new Record({id: bibid});
    record.fetch();
  }
});

$(function() {
  this.router = new Workspace();
  Backbone.history.start({pushState: true, root: "/"});
});
