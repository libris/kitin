kitin.controller('ModalCreateNewCtrl', function ($scope, $rootScope, $modalInstance) {
  var termIndex = $rootScope.termIndex,
      TERMS = $rootScope.TERMS;

  var mainTypes = termIndex.byId[TERMS+'CreativeWork'].subjects('subClassOf');
  var aggregateLevels = _.uniq(
    termIndex.byId[TERMS+'Aggregate'].subjects('subClassOf').concat(
      termIndex.byId[TERMS+'Part'].subjects('subClassOf')), false, '@id');

  function labelSort(cls) { return cls.get('label'); }
  mainTypes = _.sortBy(mainTypes, labelSort);
  aggregateLevels = _.sortBy(aggregateLevels, labelSort);

  function notAbstract(cls) { return cls.get('abstract') !== true; }
  mainTypes = _.filter(mainTypes, notAbstract);
  aggregateLevels = _.filter(aggregateLevels, notAbstract);

  $scope.typeGroups = [
    {name: 'mainType', label: 'Typ', classes: mainTypes},
    {name: 'aggregateLevel', label: 'Bibliografisk nivå', classes: aggregateLevels}
  ];

  $scope.createNew = {mainType: 'Text', aggregateLevel: 'Monograph'};

  $scope.close = function() {
    $modalInstance.close();
  };
});
