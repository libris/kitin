var doc = "{ \"leader\": \"00887cam a2200277 a 4500\", \"001\": \"7149593\", \"005\": \"20040809152032.0\", \"008\": [\"960214s\", \"1996\", null, \"sw            000 0aswe  \"], \"020\": [null, null, {\"a\": [\"91-0-056322-6 (inb.)\"], \"c\": [\"310:00\"]}], \"035\": [null, null, {\"9\": [\"9100563226\"]}], \"040\": [null, null, {\"a\": [\"NB\"]}], \"042\": [null, null, {\"9\": [\"BULB\", \"NB\", \"SEE\", \"SLB\", \"KVIN\"]}], \"084\": [[null, null, {\"a\": [\"Gcdz Jansson, Tove\"], \"2\": [\"kssb/6\"]}], [null, null, {\"a\": [\"Ibz Pietilä, Tuulikki\"], \"2\": [\"kssb/6\"]}], [null, null, {\"a\": [\"Lz\"]}]], \"100\": [1, null, {\"a\": [\"Jansson, Tove\"], \"d\": [\"1914-2001\"]}], \"245\": [0, 0, {\"a\": [\"Anteckningar från en ö\"], \"c\": [\"Tove Jansson, Tuulikki Pietilä\"]}], \"260\": [null, null, {\"a\": [\"Stockholm\"], \"b\": [\"Bonnier\"], \"c\": [\"1996\"], \"e\": [\"(Finland)\"]}], \"300\": [null, null, {\"a\": [\"102, [1] s.\"], \"b\": [\"ill.\"], \"c\": [\"25 cm\"]}], \"500\": [null, null, {\"a\": [\"Även tillg. med tryckår: 2. uppl., 1996\"]}], \"599\": [null, null, {\"a\": [\"Li:S\"]}], \"600\": [1, 4, {\"a\": [\"Jansson, Tove\"], \"d\": [\"1914-2001\"]}], \"600\": [1, 4, {\"a\": [\"Pietilä, Tuulikki\"]}], \"700\": [1, null, {\"a\": [\"Pietilä, Tuulikki\"], \"d\": [\"1917-\"]}], \"976\": [[null, 2, {\"a\": [\"Gcdz\"], \"b\": [\"Litteraturhistoria Finlandssvensk\"]}], [null, 2, {\"a\": [\"Ibz\"], \"b\": [\"Konst Konsthistoria\"]}]] }"

$(document).ready(function() {
  var json_doc = JSON.parse(doc);
  for (key in json_doc) {
    var field = $('.'+key);
    console.log(field);
    if(field.length != 0) {
      field.text(json_doc[key].toString());
    } else {
      console.log('nothing here...');
    }
  }
});
