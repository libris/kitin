// module object (works in both browser and node)
var marcjson = typeof exports !== 'undefined'? exports : {};

// populate module
(function (module) {

  module.rawToNamed = function (map, struct) {
    var out = {};
    out.leader = module.processLeader(map, struct, out);
    (struct.fields).forEach(function(field) {
      for (fieldTag in field) {
        var sourceRow = field[fieldTag];
        var dfn = map[fieldTag];
        var handler = module.fixedFieldHandlers[fieldTag];
        if (handler) {
          handler(fieldTag, sourceRow, dfn, out/*, map.fixprops*/);
        } else {
          var key = fieldTag;
          var outObj = sourceRow;
          if (dfn) {
            key = dfn.name;
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

  module.processLeader = function (map, struct, out) {
    var leader = struct.leader;
    var result = {};
    map['000'].fixmaps[0].columns.forEach(function (col) {
      module.processFixedCol(leader, col, result/*, map.fixprops*/);
    });
    return result;
  };

  module.fixedFieldHandlers = {
    '008': function (tag, sourceRow, dfn, out/*, fixprops*/) {
      var comboKey = out.leader.typeOfRecord/*.id*/ + out.leader.bibLevel/*.id*/;
      // TODO: prepare table to lookup fixmap by matchRecTypeBibLevel
      dfn.fixmaps.forEach(function (fixmap) {
        if (fixmap.matchRecTypeBibLevel.indexOf(comboKey) > -1) {
          out['type'] = fixmap.term;
          var result = out[dfn.name] = {};
          fixmap.columns.forEach(function (col) {
            module.processFixedCol(sourceRow, col, result/*, fixprops*/);
          });
        }
      });
    }
  };

  module.processFixedCol = function (repr, col, result/*, fixprops*/) {
    var off = col.offset;
    var key = repr.substring(off, off + col.length) || col['default'];
    var prop = col.propRef;
    if (!prop && col.placeholder[0] != '<') {
      prop = col.placeholder;
    }
    if (prop) {
      key = key == ' '? '_' : key;
      //var value = col.propRef? fixprops[col.propRef][key] : null;
      result[prop] = key;// {id: key, label_sv: value};
    }
  };

  module.rawRowToNamedRow = function(fieldDfn, row) {
    if (typeof row === 'string')
      return row;
    if (fieldDfn.type === 'fixedLength')
      return row;
    var outField = {};
    var ind1 = row.ind1,
        ind2 = row.ind2;
    if (ind1 && ind1 !== " ") {
      var ind1Val = ind1.toString();
      outField[fieldDfn.ind1.name || 'ind1'] = fieldDfn.ind1[ind1Val] || ind1Val;
    }
    if (ind2 && ind2 !== " ") {
      var ind2Val = ind2.toString();
      outField[fieldDfn.ind2.name || 'ind2'] = fieldDfn.ind2[ind1Val] || ind1Val;
    }
    row.subfields.forEach(function (subfield) {
      for (subCode in subfield) {
        var key = subCode;
        var subDfn = fieldDfn.subfield[subCode];
        var outObj = subfield[subCode];
        if (subDfn) {
          key = subDfn.name;
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

})(marcjson);
