// module object (works in both browser and node)
var marcjson = typeof exports !== 'undefined'? exports : {};

// populate module
(function (module) {

  module.rawToNamed = function (map, struct) {
    var res = {};
    res.leader = struct.leader;
    // TODO: parse leader
    (struct.fields).forEach(function(field) {
      for (fieldCode in field) {
        var sourceRow = field[fieldCode];
        var key = fieldCode;
        var resRow = sourceRow;
        var dfn = map[fieldCode];
        if (dfn) {
          key = dfn.name;
          resRow = module.rawRowToNamedRow(dfn, sourceRow);
        }
        res[key] = resRow;
      }
    });
    return res;
  };

  module.rawRowToNamedRow = function(fieldDfn, row) {
    if (typeof row === 'string')
      return row;
    if (fieldDfn.type === 'fixedLength')
      return row;
    var res = [];
    var ind1 = row.ind1, ind2 = row.ind2;
    res.push(ind1? fieldDfn.ind1[ind1.toString()] : null);
    res.push(ind2? fieldDfn.ind2[ind2.toString()] : null);
    var resField = {};
    row.subfields.forEach(function (subfield) {
      for (subCode in subfield) {
        var key = subCode;
        var subDfn = fieldDfn.subfield[subCode];
        if (subDfn) {
          key = subDfn.name;
        }
        resField[key] = subfield[subCode];
      }
    });
    res.push(resField);
    return res;
  };

  module.namedToRaw = function () {
  };

  module.textRowToStructRow = function (field) {
    if (typeof field === "object")
      return field;
    //return field.split(/#(\w)/);
  };

  module.textToStruct = function () {
    // each line, out.extend textRowToStructRow(line)
  };

})(marcjson);
