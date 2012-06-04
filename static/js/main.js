(function($){
  // jQuery autoGrowInput plugin by James Padolsey
  // See related thread: http://stackoverflow.com/questions/931207/is-there-a-jquery-autogrow-plugin-for-text-fields
  $.fn.autoGrowInput = function(o) {

    o = $.extend({
      maxWidth: 1000,
      minWidth: 0,
      comfortZone: 70
    }, o);

    this.filter('input:text').each(function(){

      var minWidth = o.minWidth || $(this).width(),
      val = '',
      input = $(this),
      testSubject = $('<tester/>').css({
        position: 'absolute',
        top: -9999,
        left: -9999,
        width: 'auto',
        fontSize: input.css('fontSize'),
        fontFamily: input.css('fontFamily'),
        fontWeight: input.css('fontWeight'),
        letterSpacing: input.css('letterSpacing'),
        whiteSpace: 'nowrap'
      }),
      check = function() {

        if (val === (val = input.val())) {return;}

        // Enter new content into testSubject
        var escaped = val.replace(/&/g, '&amp;').replace(/\s/g,'&nbsp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        testSubject.html(escaped);

        // Calculate new width + whether to change
        var testerWidth = testSubject.width(),
        newWidth = (testerWidth + o.comfortZone) >= minWidth ? testerWidth + o.comfortZone : minWidth,
        currentWidth = input.width(),
        isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth)
        || (newWidth > minWidth && newWidth < o.maxWidth);

        // Animate width
        if (isValidWidthChange) {
          input.width(newWidth);
        }

      };

      testSubject.insertAfter(input);

      $(this).bind('keyup keydown blur update', check);

      check();
    });

    return this;

  };

})(jQuery);

//
//record
// - uid
// - marc
// - spill
$.fn.serializeObject = function() {
  var o = {};
  var fields = [];
  $.each($('#fields .control_field'), function() {
    var obj = {};
    var field_label = $(this).find('.field_label');
    obj[field_label.attr('name')] = field_label.val();
    fields.push(obj);
  });
  $.each($('#fields .regular_field'), function() {
    var field_name = $(this).find('.js-field-label').text();
    var ind1 = $(this).find('.ind1');
    var ind2 = $(this).find('.ind2');

    var subfields = [];
    $.each($(this).find('.js-subfield-wrapper'), function() {
      subfields[$(this).find('.js-subfield-code').text()] = $(this).find('.js-subfield-value').val();
    });

    var obj = {}
    obj[field_name] = {
      "ind1": $(this).find('.js-field-ind1').val() || '',
      "ind2": $(this).find('.js-field-ind2').val() || '',
      "subfields": subfields,
    };
    fields.push(obj);
  });
  o['fields'] = fields;
  o['leader'] = $(this).find("input[name='leader']").val();
  return o;
}

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

var Record = Backbone.Model.extend({
  urlRoot:'/record/bib',
  parse: function(response) {
    var fields = response['fields'];
    for (field in fields) {
      var key = _.keys(fields[field])[0];
      if(parseInt(key, 10) <= 8) { // We have a ControlField? Yes, that's the idea! :)
        fields[field].control_field = true;
      } else {
        fields[field].control_field = false;
      }
    }
    return {
      leader: response['leader'],
      fields: fields,
    };
  },
  save: function(attributes, options) {
    _.each(this.get('fields'), function(instance) { delete instance['control_field']; });
    Backbone.Model.prototype.save.call(this, attributes, options);
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

  events: {
    "click .subfields": "update_data" // TODO: perhaps consider other triggers..
  },

  update_data: function(event) {
    // TODO: save to model or perhaps to front-backend
  },

  render: function() {

    this.setupGlobalKeyBindings(this.model);

    $(this.el).html(this.leader_template({leader: this.model.get('leader')}));

    var control_fields = _.filter(this.model.get('fields'), function(field) {
      return field['control_field'] == true;
    });
    for (field in control_fields) {
      $(this.el).append(this.control_row_template({
        label: _.keys(control_fields[field])[0],
        value: _.values(control_fields[field])[0],
      }));
    }

    var fields = _.filter(this.model.get('fields'), function(field) {
      return field['control_field'] == false;
    });
    for (field in fields) {
      var key = _.keys(fields[field])[0];
      var value = _.values(fields[field])[0];
      $(this.el).append(this.field_row_template({
        label: key,
        ind1: value['ind1'],
        ind2: value['ind2'],
        subfields: value['subfields'],
      }));
    }

    this.setupBibAutocomplete();
    this.setupRecordKeyBindings();
    $('.subfield').autoGrowInput({comfortZone: 20, minWidth: 60, maxWidth: 140});

  },

  setupGlobalKeyBindings: function (model) {
    $("input[name='publish']").on('click', function() {
      model.save();
    });
    $(document).jkey('ctrl+b',function(){
      model.save();
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
    $('.marc100 input.subfield'
      + ', .marc600 input.subfield'
      + ', .marc700 input.subfield', this.el).autocomplete(suggestUrl, {

        remoteDataType: 'json',
        autoWidth: "min-width",

        beforeUseConverter: function (repr) {
          // TODO: get sibling fields and narrow selection(?)
          return repr;
        },

        processData: function (results) {
          return results.map(function (item) {
            var value = view.getValueForFieldAndSubfield(item, '100');
            return {value: value, data: item};
          });
        },

        showResult: function (value, data) {
          return view.bib_autocomplete_template({value: value, data: data});
        },

        onItemSelect: function(item, completer) {
          var subfieldD = $('.subfield-d', completer.dom.$elem.parent().siblings());
          subfieldD.val(item.data.marc['100']['d']);
        }

    });
  },

  getValueForFieldAndSubfield: function (item, fieldKey, subKey) {
    subKey = subKey || 'a';
    var field = item.marc[fieldKey];
    return field[subKey];
  }

});

