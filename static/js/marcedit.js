
kitin.factory('conf', function ($http, $q) {
  var marcmap = $q.defer();
  $http.get('/resource/_marcmap').success(function (o) {
    marcmap.resolve(o);
  });
  return {
    marcmap: marcmap.promise,
    // TODO: off between controller init and completion;
    // use angular events for this?
    renderUpdates: false
  };
});


function MarcCtrl($rootScope, $scope, $routeParams, conf, records, $timeout) {

  conf.renderUpdates = false;
  $rootScope.editMode = 'marc';

  $scope.getKey = marcjson.getMapEntryKey;
  $scope.indicatorType = marcjson.getIndicatorType;
  $scope.widgetType = marcjson.getWidgetType;

  var recType = $routeParams.recType, recId = $routeParams.recId;

  conf.marcmap.then(function (map) {
      records.get(recType, recId).then(function (struct) {
      map = map[recType];
      marcjson.expandFixedFields(map, struct, true);
      $scope.map = map;
      $scope.struct = struct;
    });
  });

  $scope.fieldToAdd = null;

  $scope.promptAddField = function ($event, dfn, currentTag) {
    // TODO: set this once upon first rendering of view (listen to angular event)
    conf.renderUpdates = true;
    $scope.fieldToAdd = {
      tag: currentTag,
      execute: function () {
        marcjson.addField($scope.struct, $scope.fieldToAdd.tag, dfn);
        $scope.fieldToAdd = null;
      },
      abort: function () {
        $scope.fieldToAdd = null;
      }
    };
    $timeout(function () {
      openPrompt($event, '#prompt-add-field');
    });
  };

  $scope.subFieldToAdd = null;

  $scope.promptAddSubField = function ($event, dfn, row, currentSubCode, index) {
    $scope.subFieldToAdd = {
      subfields: dfn.subfield,
      code: currentSubCode,
      execute: function () {
        marcjson.addSubField(row, $scope.subFieldToAdd.code, index);
        $scope.subFieldToAdd = null;
      },
      abort: function () {
        $scope.subFieldToAdd = null;
      }
    };
    $timeout(function () {
      openPrompt($event, '#prompt-add-subfield');
    });
  };

  $scope.removeField = function (index) {
    this.fadeOut(function () { marcjson.removeField($scope.struct, index); });
  };

  $scope.addSubField = marcjson.addSubField;

  $scope.removeSubField = function (index) {
    this.fadeOut(function () { marcjson.removeSubField(index); });
  };

  // TODO:
  //$scope.saveStruct = function () {
  //  var repr = angular.toJson($scope.struct)
  //  ajax-save
  //}

}


kitin.directive('keyEnter', function () {
  return function (scope, elm, attrs) {
    var expr = attrs.keyEnter;
    elm.jkey('enter', function () {
      scope.$apply(expr);
    });
  };
});

kitin.directive('keyEsc', function () {
  return function (scope, elm, attrs) {
    var expr = attrs.keyEsc;
    elm.jkey('esc', function () {
      scope.$apply(expr);
    });
  };
});

/* TODO: Turn this into a more declarative kitin-subfield directive?
  data-kitin-codekey="promptAddSubField($elem, field, $index)"
kitin.directive('kitinCodekey', function () {
  return function (scope, elm, attrs) {
    var expr = attrs.kitinCodekey;
    elm.jkey("alt+t", function () {
      scope.$apply(expr);
    });
  }
});
*/

kitin.directive('fadable', function(conf) {
  return function(scope, elm, attrs) {
    var duration = parseInt(attrs.fadable, 10);
    if (conf.renderUpdates) {
      // TODO: adding this indicates that this is not a 'fadable', but a 'fieldbox'..
      elm.hide().fadeIn(duration, function () {
        if (conf.renderUpdates) {
          var fieldExpr = elm.has('input')? 'input' : 'select';
          elm.find(fieldExpr).first().focus();
        }
      });
      var body = $('body');
      var scrollTop = $(document).scrollTop(),
        winHeight = $(window).height(),
        scrollBot = scrollTop + winHeight,
        offsetTop = elm.offset().top - body.offset().top;
      if (offsetTop < scrollTop || offsetTop > scrollBot) {
        body.animate({scrollTop: offsetTop - (winHeight / 2)});
      }
    }
    scope.fadeOut = function(complete) {
      elm.fadeOut(duration / 2, function() {
        if (complete) {
          complete.apply(scope);
        }
      });
    };
  };
});
