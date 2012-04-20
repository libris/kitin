// module object (works in both browser and node)
var marcjson = typeof exports !== 'undefined'? exports : {};

// populate module
(function (ns) {

  ns.rawToNamed = function (map, struct) {
    var res = {};
    for (fieldCode in struct) {
      var sourceRow = struct[fieldCode];
      var key = fieldCode;
      var resRow = sourceRow;
      var dfn = map[fieldCode];
      if (dfn) {
        key = dfn.name;
        resRow = ns.rawRowToNamedRow(dfn, sourceRow);
      }
      res[key] = resRow;
    }
    return res;
  };

  ns.rawRowToNamedRow = function(fieldDfn, row) {
    if (typeof row === 'string' || typeof row === 'array')
      return row;
    var res = [];
    var ind1 = row[0],
        ind2 = row[1],
        field = row[2],
        keyseq = row[3];
    res.push(ind1? fieldDfn.ind1[ind1.toString()] : null);
    res.push(ind2? fieldDfn.ind2[ind2.toString()] : null);
    var resField = {};
    for (subCode in field) {
      var key = subCode;
      var subDfn = fieldDfn.subfield[subCode];
      if (subDfn) {
        key = subDfn.name;
      }
      resField[key] = field[subCode];
    }
    res.push(resField);
    if (keyseq) res.push(keyseq);
    return res;
  };

  ns.namedToRaw = function () {
  };

  ns.textRowToStructRow = function (field) {
    if (typeof field === "object")
      return field;
    //return field.split(/#(\w)/);
  };

  ns.textToStruct = function () {
    // each line, out.extend textRowToStructRow(line)
  };

})(marcjson);
