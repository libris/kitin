(function (root, id, ctor) {
  if (typeof exports === 'object') ctor.apply(exports);
  else root[id] = new ctor();
}(this, 'Gild', function () {
  /**
   * Gild - A Simple Graph Index for JSON-LD
   */

  this.buildIndex = function (objects) {
    var index = {
      byId: {},
      byType: {},
      byTerm: {},
      revMaps: {},
      getter: 'get',
      reverseGetter: 'subjects'
    };

    objects.forEach(function (object) {
      indexObject(index, object);
    });

    return index;
  };

  function indexObject(index, object, subject, rel) {
    var ref = null, keyCount = 0;
    for (var key in object) {
      ++keyCount;
      var value = object[key];
      if (key === '@id') {
        ref = value;
      } else if (key === '@type') {
        addToArray(index.byType, value, object);
      } else if (typeof value === 'object') {
        if (typeof value.forEach === 'function') {
          // jshint -W083
          value.forEach(function (v) {
            indexObject(index, v, object, key);
          });
        } else {
          indexObject(index, value, object, key);
        }
      }
    }
    if (ref) {
      object[index.getter] = function (optKey) {
        var target = index.byId[ref];
        if (optKey && target) {
          target = target[optKey];
          var lookup = function (o) {
            return o[index.getter]? o[index.getter]() : o;
          };
          if (target) {
            if (typeof target.forEach === 'function') {
              return target.map(lookup);
            } else {
              return lookup(target);
            }
          }
        }
        return target;
      };
      if (keyCount > 1) {
        index.byId[ref] = object;
        object[index.reverseGetter] = function (revKey) {
          var revMap = index.revMaps[ref];
          return revMap? revMap[revKey] || [] : [];
        };
        if (index.byTerm) {
          var term = ref.replace(/.*?([^\/#]+)$/, "$1");
          index.byTerm[term] = object;
        }
      }
      if (subject) {
        var revMap = index.revMaps[ref];
        if (typeof revMap === 'undefined') {
          index.revMaps[ref] = revMap = {};
        }
        addToArray(revMap, rel, subject);
      }
    }
  }

  function addToArray(object, keys, value) {
    if (typeof keys === 'string') {
      keys = [keys];
    }
    keys.forEach(function (key) {
      var array = object[key];
      if (typeof array === 'undefined') {
        array = object[key] = [];
      }
      array.push(value);
    });
  }

}));
