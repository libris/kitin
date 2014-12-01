kitin.controller('JSONLDCtrl', function($scope, $modal) {

  $scope.getLeaf = function (uri) {
    return uri.replace(/.*?([^\/#]+)$/, "$1");
  };

  $scope.ensureArray = function (obj) {
    return _.isArray(obj)? obj : [obj];
  };

  $scope.openTermDef = function (key) {
    var opts = {
      backdrop: true,
      keyboard: true,
      templateUrl: '/snippets/modal-vocabview',
      //controller: 'ModalVocabBrowserCtrl',
      scope: $scope,
      resolve: {key: function () { return key; }},
      controller: function ModalVocabBrowserCtrl($scope, $modalInstance, key) {
        $scope.viewTerm = function (key) {
          $scope.term = $scope.termIndex.byTerm[key];
        };
        $scope.viewTerm(key);
      },
      windowClass: ''
    };
    $scope.browseVocabModal = $modal.open(opts);
  };

  $scope.toJsonLdLink = function (id) {
    return id.replace(/^\/(resource\/)?/, '/jsonld/');
  };

  $scope.jsonLdKeys = function(obj) {
    if (_.isArray(obj))
      return _.keys(obj);
    var result = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && key[0] !== '$') {
        result.push({key: key, value: obj[key]});
      }
    }
    result.sort(function (one, other) {
      var a1 = jsonLdObjectWeight(one.value),
          a2 = jsonLdObjectWeight(other.value);
      if (a1 === a2 && _.isObject(one.value)) {
        a1 = _.size(one.value);
        a2 = _.size(other.value);
      }
      var b1 = one.key,
          b2 = other.key;
      return 2 * (a1 > a2 ? 1 : a1 < a2 ? -1 : 0) +
        1 * (b1 > b2 ? 1 : b1 < b2 ? -1 : 0);
    });
    return _.collect(result, 'key');
  };

  function jsonLdObjectWeight(o) {
    if (_.isArray(o)) {
      return 3;
    } else if (_.isObject(o)) {
      if (!_.isUndefined(o['@id']))
        return 2;
      else
        return 1;
    } else {
      return 0;
    }
  }


});
