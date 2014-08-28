kitin.controller('ModalCreateNewCtrl', function ($scope, $rootScope, $modalInstance) {
  var termIndex = $rootScope.termIndex,
      MARCENUM = 'http://libris.kb.se/def/marc/enum/';

  var typeOfRecordEnum = termIndex.byId[MARCENUM + 'typeOfRecord'];
  var bibLevelEnum = termIndex.byId[MARCENUM + 'bibLevel'];

  function labelSort(cls) { return cls.get('label'); }

  $scope.typeGroups = [
    {
      name: 'mainType',
      label: typeOfRecordEnum.get('label'),
      classes: _.sortBy(typeOfRecordEnum.subjects('termGroup'), labelSort)
    },
    {
      name: 'aggregateLevel',
      label: bibLevelEnum.get('label'),
      classes: _.sortBy(bibLevelEnum.subjects('termGroup'), labelSort)
    }
  ];

  $scope.createNew = {mainType: 'Text', aggregateLevel: 'Monograph'};

  $scope.close = function() {
    $modalInstance.close();
  };
});
