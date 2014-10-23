kitin.controller('EditBaseCtrl', function($scope, $modal, $http, $routeParams, $timeout, $rootScope, $location, $anchorScroll, recordService, definitions, userData, editService) {

  // recType & recId can be inherited from f.ex modals
  $scope.recType = $scope.recType || $routeParams.recType;
  $scope.recId = $scope.recId || $routeParams.recId;
  $scope.userSigel = userData.userSigel;
  $scope.editMode = $location.hash(); // #jsonld changes edit template
  $scope.editSource = $routeParams.editSource;
  console.warn('edit mode',$scope.editMode);

  editService.addableElements = [];

  document.body.className = 'edit';

  $scope.$on('$routeUpdate', function() {
    $scope.editMode = $location.hash();
    $anchorScroll();
  });

  // Load record into scope
  if($routeParams.editSource === 'libris') {
    // LIBRIS
    recordService.libris.get($scope.recType, $scope.recId).then(function(data) {
      if ($scope.recType === editService.RECORD_TYPES.BIB) {
        $scope.addRecordViewsToScope(data['recdata'], $scope);
        $scope.etag = data['etag'];
      }
    });
  } else if($routeParams.editSource === 'draft') {
    // DRAFT
    recordService.draft.get($scope.recType + '/' + $scope.recId)
      .then(function(data) { 
        $scope.addRecordViewsToScope(data['recdata']);
        if(data['recdata']['@id']) {
          $scope.record.type = data['recdata']['@id'].split("/").slice(-2)[0];
          $scope.record.id = data['recdata']['@id'].split("/").slice(-2)[1];
        }
        $scope.etag = data['recdata']['etag'];
    });
  } else if ($location.$$search.type && $location.$$search.aggregateLevel) {
    // NEW RECORD
    recordService.libris.get(null, null, $location.$$search.type, $location.$$search.aggregateLevel)
      .then(function(data) {
        $scope.addRecordViewsToScope(data['recdata']);
        $scope.etag = data['etag'];
    });
  } else if($scope.recType === editService.RECORD_TYPES.REMOTE){
    // REMOTE
    // !TODO remote is probably not working
    var record = editService.getRecord();
      if(record) {
        $scope.addRecordViewsToScope(record.data);
      }
  } else {
    console.error('No type of record to load');
  }


  // TODO: move each part of this into editService.decorate, then remove this function
  $scope.addRecordViewsToScope = function(record) {

    $scope.record = record;

    $scope.unifiedClassifications = editService.getUnifiedClassifications(record);

    definitions.conceptSchemes.then(function(data) {
      $scope.conceptSchemes = data;
    });
    $scope.subjectByType = {
      'Place': {
        title: 'Geografiska ämnesord',
        allowNonAuth: true
      },
      'Person': {
        title: 'Personer'
      },
      '/topic/chronological': {
        title: 'Kronologiska ämnesord'
      },
      'Organization': {
        title: 'Organisation'
      }
    };
  };

 

  


 


});
