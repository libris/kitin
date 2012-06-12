kitin.pyvar records, router;

$(function() {

  records = new RecordCollection();
  router = new Router([records]);

  records.on('add', function(model) {
    var view = new RecordView({model: model});
  });

  Backbone.history.start({pushState: true, root: "/"});

  // TODO: onunload:
  //if (ajaxInProgress)
  //  confirm('ajaxInProgress; break and leave?')
});


var Record = Backbone.Model.extend({

  urlRoot:'/record/bib',

  aggregates: {
    fields: FieldList
  },

  parse: function(response) {
    return {
      leader: response['leader'],
      fields: _.map(response['fields'], function (field) {
        for (key in field) {
          var value = field[key];
          var attrs = (typeof value === 'string')?
            {'controlValue': value} : _.clone(value);
          attrs.tag = key;
          if (attrs.subfields) {
            attrs.subfields = _.map(attrs.subfields, function (subfield) {
              for (subKey in subfield) {
                return {code: subKey, value: subfield[subKey]};
              }
            });
          }
          return attrs;
        }
      })
    };
  },

  set: function(attrs, options) {
    if (attrs.fields !== undefined &&
        !(attrs.fields instanceof FieldList)) {
      attrs.fields = new FieldList(attrs.fields);
    }
    return Backbone.Model.prototype.set.call(this, attrs, options);
  },

  toJSON: function() {
    return _.clone(this.attributes);
  }

});

var RecordCollection = Backbone.Collection.extend({
  model: Record
});

var Field = Backbone.Model.extend({

  set: function (attrs, options) {
    if (attrs.subfields !== undefined &&
        !(attrs.subfields instanceof SubFieldList)) {
      attrs.subfields = new SubFieldList(attrs.subfields);
    }
    return Backbone.Model.prototype.set.call(this, attrs, options);
  },

  toJSON: function() {
    var o = {};
    var value = _.clone(this.attributes.controlValue || this.attributes);
    delete value.tag;
    o[this.attributes.tag] = value;
    return o;
  }

});

var FieldList = Backbone.Collection.extend({
  model: Field
});

var SubField = Backbone.Model.extend({
  toJSON: function() {
    var o = {};
    o[this.attributes.code] = this.attributes.value;
    return o;
  }
});

var SubFieldList = Backbone.Collection.extend({
  model: SubField
});


var Router = Backbone.Router.extend({
  initialize: function(options) {
    this.records = options[0];
    self = this;
  },
  routes: {
    "record/bib/:bibid": "record"
  },
  record: function(bibid) {
    var record = new Record({id: bibid});
    record.fetch({
      success: function(model, response) {
        self.records.add(model);
      },
    });
    // TODO: set interval, and if changed, save to model or perhaps to
    // front-backend
  },
});


var RecordView = Backbone.View.extend({

  el: $('#fields'),

  leaderTemplate: _.template($('#leader-template').html()),
  bibAutocompleteTemplate: _.template($('#bib-autocomplete-template').html()),

  events: {
  },

  initialize: function (options) {
    this.model.bind("change", this.render, this);
    this.renderAll();
  },

  renderAll: function() {
    var $el = this.render();
    this.model.get('fields').each(function(field) {
      var fieldView = new FieldView({model: field}).render();
      $el.append(fieldView);
    });
    this.setupGlobalKeyBindings();
    this.setupBibAutocomplete();
    this.setupKeyBindings();
    this.$('.subfield').autoGrowInput({comfortZone: 11, minWidth: 20, maxWidth: 480});
  },

  render: function() {
    var $el = $(this.el);
    $el.html(this.leaderTemplate({leader: this.model.get('leader')}));
    return $el;
  },

  setupGlobalKeyBindings: function () {
    var model = this.model;
    $("input[name='draft']").on('click', function() {
      $.ajax({
        url: '/record/bib/'+model.id+'/draft',
        type: 'POST',
        data: JSON.stringify(model.toJSON()),
      }).done(function() {
        // TODO: Notify user when record is successfullt save as draft
      });
    });
    $("input[name='publish']").on('click', function() {
      model.save();
    });
    $(document).jkey('ctrl+b',function(){
      model.save();
    });
  },

  setupBibAutocomplete: function () {
    var view = this;
    var suggestUrl = "/suggest/auth";
    this.$('.marc100 input.subfield-a'
      + ', .marc600 input.subfield-a'
      + ', .marc700 input.subfield-a').autocomplete(suggestUrl, {

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

});

var FieldView = Backbone.View.extend({

  controlRowTemplate: _.template($('#control-row-template').html()),
  fieldRowTemplate: _.template($('#field-row-template').html()),

  render: function() {
    var field = this.model;
    var tag = field.get('tag');
    var $el;
    if (field.has('controlValue')) {
      $el = this.controlRowTemplate({
        label: tag,
        value: field.get('controlValue')
      });
    } else {
      $el = this.fieldRowTemplate({
        label: tag,
        ind1: field.get('ind1'),
        ind2: field.get('ind2'),
        subfields: field.get('subfields').toJSON()
      });
    }
    return $el;
  }

});

var SubFieldView = Backbone.View.extend({
});
