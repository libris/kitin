// module object (works in both browser and node)
var marcjson = typeof exports !== 'undefined'? exports : {};

// populate module
(function (module) {

  module.parseLeader = function (map, struct, reversible) {
    var leader = struct.leader;
    var columns = map['000'].fixmaps[0].columns;
    return buildFixedFieldObject(leader, columns, map.fixprops, reversible);
  };

  module.fixedFieldParsers = {

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
    if (columns !== null)
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

  module.rawToNamed = function (map, struct) {
    var out = {};
    out.leader = module.parseLeader(map, struct);
    (struct.fields).forEach(function(field) {
      for (fieldTag in field) {
        var sourceRow = field[fieldTag];
        var dfn = map[fieldTag];
        var parse = module.fixedFieldParsers[fieldTag];
        if (parse) {
          out[dfn.id] = parse(sourceRow, dfn, out.leader/*, map.fixprops*/);
        } else {
          var key = fieldTag;
          var outObj = sourceRow;
          if (dfn) {
            key = dfn.id;
            outObj = module.rawRowToNamedRow(dfn, sourceRow);
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

  module.rawRowToNamedRow = function(fieldDfn, row) {
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

  module.namedToRaw = function () {
    // TODO
  };

  function dfnKey(key, dfn) {
    return dfn.id || "[" + key + "] " + dfn.label_sv;
  }

})(marcjson);
