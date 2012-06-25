// module object (works in both browser and node)
var marcjson = typeof exports !== 'undefined'? exports : {};

// populate module
(function (module) {

  module.rawToNamed = function (map, struct) {
    var out = {};
    out.leader = struct.leader;
    // TODO: parse leader
    (struct.fields).forEach(function(field) {
      for (fieldTag in field) {
        var sourceRow = field[fieldTag];
        var key = fieldTag;
        var outObj = sourceRow;
        var dfn = map[fieldTag];
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
    });
    return out;
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
