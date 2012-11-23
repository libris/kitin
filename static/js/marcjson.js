// namespace object (works in both browser and node)
var marcjson = typeof exports !== 'undefined'? exports : {};

// build namespace
(function (exports) {

  exports.parseLeader = function (map, struct, reversible) {
    var leader = struct.leader;
    var columns = map['000'].fixmaps[0].columns;
    return buildFixedFieldObject(leader, columns, map.fixprops, reversible);
  };

  exports.fixedFieldParsers = {

    '006': parseFixedField,

    '007': parseFixedField,

    '008': function (row, dfn, leader, fixprops, reversible) {
      var recTypeBibLevelKey = leader.typeOfRecord.code + leader.bibLevel.code;
      var columns = null;
      // TODO: prepare table to lookup fixmap by matchRecTypeBibLevel
      for (var fixmap=null, i=0; fixmap=dfn.fixmaps[i++];) {
        if (fixmap.matchRecTypeBibLevel.indexOf(recTypeBibLevelKey) > -1) {
          //var type = fixmap.term; // TODO: use computed resource type key
          columns = fixmap.columns;
          break;
        }
      }
      return buildFixedFieldObject(row, columns, fixprops, reversible);
    }

  };

  function parseFixedField(row, dfn, leader, fixprops, reversible) {
    var matchKey = row[0];
    var columns = null;
    for (var fixmap=null, i=0; fixmap=dfn.fixmaps[i++];) {
      if (fixmap.matchKeys.indexOf(matchKey) > -1) {
        columns = fixmap.columns;
        break;
      }
    }
    if (columns === null)
      return row;
    else
      return buildFixedFieldObject(row, columns, fixprops, reversible);
  }

  function buildFixedFieldObject(repr, columns, fixprops, reversible) {
    var result = reversible? makeFixedFieldResult(columns) : {};
    columns.forEach(function (colDfn) {
      processFixedCol(repr, colDfn, result, fixprops);
    });
    return result;
  }

  function makeFixedFieldResult(columns) {
    // TODO: save raw value in case columns don't cover the full range
    var ctor = function () {};
    ctor.prototype.toJSON = function () {
      var self = this;
      // TODO: use saved raw as base (to cover missing column defs)
      var s = "";
      columns.forEach(function (colDfn) {
        var prop = getColumnName(colDfn);
        var o = self[prop];
        if (o === undefined) {
          s += new Array(colDfn.length).join(" ");
        } else {
          var v = o.code;
          if (v === '_') v = ' ';
          s += v;
          if (v.length !== colDfn.length) {
            s += new Array(colDfn.length - v.length).join(" ");
          }
        }
      });
      return s;
    };
    return new ctor();
  }

  function processFixedCol (repr, colDfn, result/*, fixprops*/) {
    var off = colDfn.offset;
    var key = repr.substring(off, off + colDfn.length) || colDfn['default'];
    var prop = getColumnName(colDfn);
    if (prop) {
      key = key == ' '? '_' : key;
      result[prop] = {code: key, getDfn: function () { return colDfn; }};
      //var valueId = fixprops[prop][key].id;
      //if (valueId) { result[prop].id = valueId; }
    }
  }

  function getColumnName(colDfn) {
    if (colDfn.propRef) {
      return colDfn.propRef;
    } else if (colDfn.placeholder[0] != '<') {
      return colDfn.placeholder;
    } else {
      return "_col_" + colDfn.offset + "_" + colDfn.length;
    }
  }


  /**
  * Expands fixed marc fields into objects, in-place. Uses a marc-map containing
  * parsing instructions. If the reversible parameter is true, the resulting
  * objects have toJSON methods responsible for turning them back into fixed
  * field values upon serialization.
  */
  exports.expandFixedFields = function (map, struct, reversible) {
    if (typeof struct.leader === 'object')
      return; // assumes expand has already been run
    var leader = exports.parseLeader(map, struct, reversible);
    struct.leader = leader;
    for (var tag in exports.fixedFieldParsers) {
      struct.fields.forEach(function (field) {
        var row = field[tag];
        if (row) {
          var parse = exports.fixedFieldParsers[tag];
          var dfn = map[tag];
          field[tag] = parse(row, dfn, leader, map.fixprops, reversible);
        }
      });
    }
  };

  /**
  * Get one key from an object expected to contain only one key.
  */
  exports.getMapEntryKey = function (o) {
    for (var key in o) return key;
  };

  exports.getIndicatorType = function (tag, indKey, indEnum) {
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
  };

  exports.getWidgetType = function (tag, row) {
    if (tag === 'leader' || exports.fixedFieldParsers[tag]) {
      return 'fixedfield';
    } else if (typeof row === 'string') {
      return 'raw';
    } else {
      return 'field';
    }
  };


  exports.addField = function (struct, tagToAdd, dfn) {
    var fields = struct.fields;
    if (!tagToAdd)
      return;
    for (var i=0, ln=fields.length; i < ln; i++) {
      var field = fields[i];
      var tag = exports.getMapEntryKey(field);
      if (tag > tagToAdd) break;
    }
    // TODO: get definition from marcmap etc.
    var o = {};
    var row = {ind1: " ", ind2: " ", subfields: [{a: ""}]};
    o[tagToAdd] = row;
    fields.splice(i, 0, o);
  };

  exports.removeField = function (struct, index) {
    struct.fields.splice(index, 1);
  };

  exports.addSubField = function (row, subCode, index) {
    if (!subCode)
      return;
    var o = {};
    o[subCode] = "";
    row.subfields.splice(index + 1, 0, o);
  };

  exports.removeSubField = function (row, index) {
    row.subfields.splice(index, 1);
  };


  exports.createEntityGroups = function (map, overlay, struct) {
    var entities = overlay.entities;
    var out = {};
    var index = {};
    exports.expandFixedFields(map, struct);
    map.leader = map['000'];
    var leaderField = {leader: struct.leader};
    decorateMarcField(map, overlay, 'leader', leaderField);
    index['leader'] = [leaderField];
    struct.fields.forEach(function (field) {
      var tag = exports.getMapEntryKey(field);
      decorateMarcField(map, overlay, tag, field);
      var tagged = index[tag];
      if (tagged === undefined) tagged = index[tag] = [];
      tagged.push(field);
    });

    for (entity in entities) {
      var contents = entities[entity];
      if (contents.forEach) {
        var fields = out[entity] = [];
        specToFields(index, contents, fields);
      } else {
        var group = out[entity] = {};
        for (groupKey in contents) {
          var fields = group[groupKey] = [];
          specToFields(index, contents[groupKey], fields);
        }
      }
    }
    return out;
  };

  function decorateMarcField(map, overlay, tag, field) {
    // TODO: prepare map data: clone dfn once, extend with overlay
    var dfn = map[tag];
    dfn.tag = tag;
    dfn.ind1Type = indicatorType(overlay, dfn, 'ind1');
    dfn.ind2Type = indicatorType(overlay, dfn, 'ind2');
    // TODO: only add if not hidden
    if (this.ind1Type == 'hidden' && this.ind2Type == 'hidden')
      dfn.indicators = [];
    else
      dfn.indicators = [
        {key: 'ind1', type: dfn.ind1Type, enum: dfn.ind1},
        {key: 'ind2', type: dfn.ind2Type, enum: dfn.ind2}
      ];
    field.getRow = function () { return this[tag]; };
    field.getTagDfn = function () { return dfn; };
  }

  function indicatorType(overlay, dfn, indKey) {
    var tag = dfn.tag;
    var indEnum = dfn[indKey];
    var i = 0;
    for (var k in indEnum) if (i++) break;
    var indOverlay = overlay.extend[tag];
    // TODO: extract 'hidden' logic to creation of dfn.indicators list
    if (i === 1 &&
        (indEnum['_'].id === 'undefined' ||
          indEnum['_'].label_sv === 'odefinierad')) {
      return 'hidden';
    } else if (indOverlay && indOverlay[indKey]) {
      return indOverlay[indKey].type;
    } else if (indEnum) {
      return 'select';
    } else {
      return 'plain';
    }
  }

  function specToFields(index, contents, fields) {
    contents.forEach(function (path) {
      if (typeof path === 'string') {
        var field = index[path];
        if (field) {
          fields.push.apply(fields, field);
        }
      } else {
        for (var key in path) {
          var subkey = path[key];
          var holder = index[key];
          if (holder) {
            var sourceField = holder[0];
            var target = sourceField[key][subkey];
            if (target) {
              var field = {}, sub = field[key] = {};
              field.getTagDfn = sourceField.getTagDfn;
              field.getRow = sourceField.getRow;
              //decorateField(field);
              sub[subkey] = target;
              fields.push(field);
            }
          }
        }
      }
    });
  }

  exports.rawToNamed = function (map, struct) {
    var out = {};
    out.leader = exports.parseLeader(map, struct);
    (struct.fields).forEach(function(field) {
      for (fieldTag in field) {
        var sourceRow = field[fieldTag];
        var dfn = map[fieldTag];
        var parse = exports.fixedFieldParsers[fieldTag];
        if (parse) {
          out[dfn.id] = parse(sourceRow, dfn, out.leader/*, map.fixprops*/);
        } else {
          var key = fieldTag;
          var outObj = sourceRow;
          if (dfn) {
            key = dfn.id;
            outObj = exports.rawRowToNamedRow(dfn, sourceRow);
          }
          if (dfn === undefined || dfn.repeatable !== false) {
            var outList = out[key];
            if (outList === undefined) {
              outList = out[key] = [];
            }
            outList.push(outObj);
            outObj = outList;
          }
          out[key] = outObj;
        }
      }
    });
    return out;
  };

  exports.rawRowToNamedRow = function(fieldDfn, row) {
    if (typeof row === 'string')
      return row;
    if (fieldDfn.type === 'fixedLength' || fieldDfn.subfield === undefined)
      return row;
    var outField = {};
    var ind1 = row.ind1,
        ind2 = row.ind2;
    if (ind1 && ind1 !== " ") {
      var ind1Repr = ind1.toString();
      var ind1Val = fieldDfn.ind1[ind1Repr];
      outField[fieldDfn.ind1.id || 'ind1'] = ind1Val? ind1Val.id : ind1Repr;
    }
    if (ind2 && ind2 !== " ") {
      var ind2Repr = ind2.toString();
      var ind2Val = fieldDfn.ind2[ind2Repr];
      outField[fieldDfn.ind2.id || 'ind2'] = ind2Val? ind2Val.id : ind2Repr;
    }
    row.subfields.forEach(function (subfield) {
      for (subCode in subfield) {
        var key = subCode;
        var subDfn = fieldDfn.subfield[subCode];
        var outObj = subfield[subCode];
        if (subDfn) {
          key = dfnKey(subCode, subDfn);
        }
        if (subDfn === undefined || subDfn.repeatable !== false) {
          var outList = outField[key];
          if (outList === undefined) {
            outList = outField[key] = [];
          }
          outList.push(outObj);
          outObj = outList;
        }
        outField[key] = outObj;
      }
    });
    return outField;
  };

  exports.namedToRaw = function () {
    // TODO
  };

  function dfnKey(key, dfn) {
    return dfn.id || "[" + key + "] " + dfn.label_sv;
  }

})(marcjson);
