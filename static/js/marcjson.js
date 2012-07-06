// module object (works in both browser and node)
var marcjson = typeof exports !== 'undefined'? exports : {};

// populate module
(function (module) {

  module.rawToNamed = function (map, struct) {
    var out = {};
    out.leader = module.parseLeader(map, struct);
    (struct.fields).forEach(function(field) {
      for (fieldTag in field) {
        var sourceRow = field[fieldTag];
        var dfn = map[fieldTag];
        var handler = module.fixedFieldParsers[fieldTag];
        if (handler) {
          out[dfn.id] = handler(sourceRow, dfn, out.leader/*, map.fixprops*/);
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

  module.parseLeader = function (map, struct) {
    var leader = struct.leader;
    var result = {};
    map['000'].fixmaps[0].columns.forEach(function (colDfn) {
      module.processFixedCol(leader, colDfn, result/*, map.fixprops*/);
    });
    return result;
  };

  module.fixedFieldParsers = {
    '008': function (row, dfn, leader/*, fixprops*/) {
      var result = {};
      var recTypeBibLevelKey = leader.typeOfRecord.code + leader.bibLevel.code;
      // TODO: prepare table to lookup fixmap by matchRecTypeBibLevel
      dfn.fixmaps.forEach(function (fixmap) {
        if (fixmap.matchRecTypeBibLevel.indexOf(recTypeBibLevelKey) > -1) {
          //var type = fixmap.term; // TODO: use computed resource type key
          fixmap.columns.forEach(function (colDfn) {
            module.processFixedCol(row, colDfn, result/*, fixprops*/);
          });
        }
      });
      return result;
    }
  };

  module.processFixedCol = function (repr, colDfn, result/*, fixprops*/) {
    var off = colDfn.offset;
    var key = repr.substring(off, off + colDfn.length) || colDfn['default'];
    var prop = colDfn.propRef;
    if (!prop) {
      if (colDfn.placeholder[0] != '<') {
        prop = colDfn.placeholder;
      } else {
        prop = "_col_" + off + "_" + colDfn.length;
      }
    }
    if (prop) {
      key = key == ' '? '_' : key;
      //var valueId = fixprops[colDfn.propRef][key].id;
      result[prop] = {code: key, getDfn: function () { return colDfn; }};
    }
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
      var ind1Val = ind1.toString();
      outField[fieldDfn.ind1.id || 'ind1'] = fieldDfn.ind1[ind1Val] || ind1Val;
    }
    if (ind2 && ind2 !== " ") {
      var ind2Val = ind2.toString();
      outField[fieldDfn.ind2.id || 'ind2'] = fieldDfn.ind2[ind1Val] || ind1Val;
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
  };

  function dfnKey(key, dfn) {
    return dfn.id || "[" + key + "] " + dfn.label_sv;
  }

})(marcjson);
