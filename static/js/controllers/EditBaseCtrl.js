kitin.controller('EditBaseCtrl', function($scope, $modal, $http, $routeParams, $timeout, $rootScope, $location, $anchorScroll, recordService, definitions, userData, editService, utilsService) {

  // recType & recId can be inherited from f.ex modals
  $scope.recType = $scope.recType || $routeParams.recType;
  $scope.recId = $scope.recId || $routeParams.recId;
  $scope.userSigel = userData.get().sigel;
  $scope.editMode = $location.hash(); // #jsonld changes edit template
  $scope.editSource = $routeParams.editSource;
  $scope.queryString = '?' + utilsService.constructQueryString($rootScope.state.search);

  editService.addableElements = [];

  document.body.className = 'edit';

  $scope.$on('$routeUpdate', function() {
    // This is where lazy people put their fake loading indicators
    if ($location.hash() == 'jsonld') {
      $rootScope.promises.jsonld.building = $timeout(function() {}, 500);
    } else if ($location.hash() == 'edit') {
      $rootScope.promises.bib.building = $timeout(function() {}, 500);
    }
    $scope.editMode = $location.hash();
    $anchorScroll();
  });

  // Load record into scope
  if ($location.$$search.type && $location.$$search.aggregateLevel) {
    // NEW RECORD
    recordService.draft.get(null, $location.$$search.type, $location.$$search.aggregateLevel)
      .then(function(data) {
        $scope.addRecordViewsToScope(data['recdata']);
        $scope.etag = data['etag'];
    });
  } else if($routeParams.editSource === 'libris') {
    // LIBRIS
    if($scope.recType === 'hold'){
      // Holding
      recordService.libris.get($scope.recType, $scope.recId).then(function(holdingsData) {
        // TODO: Build holding view that will take an ID instead of a record obj
        // This is currently a bit verbose, as holdings modal will do a similar lookup reversed
        var bibResource = holdingsData.recdata.about.holdingFor['@id'];
        bibResource = bibResource.split('/');
        var bibId = bibResource[bibResource.length-1];
        recordService.libris.get('bib', bibId).then(function(recordData) {
          $scope.openHoldingsModal(recordData.recdata);
        });
      });

    } else {
      // Bib
      recordService.libris.get($scope.recType, $scope.recId).then(function(data) {
          $scope.addRecordViewsToScope(data['recdata'], $scope);
          $scope.etag = data['etag'];
      });
    }
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

    $rootScope.modifications.bib = {
      makeDirty: function() {
        this.saved = false;
        this.published = false;
      },
      onSave: function() {
        this.saved = true;
        this.lastSaved = new Date();
      },
      onPublish: function() {
        this.saved = true;
        this.published = true;
        this.lastPublished = new Date();
      },
      saved:     ($scope.recType === editService.RECORD_TYPES.REMOTE || $scope.record.new) ? false : true, 
      published: ($scope.recType === editService.RECORD_TYPES.REMOTE || $scope.record.draft || $scope.record.new) ? false : true,
      imported: false
    };

  };

  $scope.getCurrentPath = function() { return $location.path(); };
 
  $scope.openHoldingsModal = function(record) {
    var opts = {
      backdrop: 'static',
      keyboard: false,
      backdropFade: false,
      dialogFade: false,
      templateUrl: '/snippets/modal-holdings',
      controller: 'ModalHoldingsCtrl',
      windowClass: 'modal-large holdings-modal',
      resolve: {
        record: function() {
          return record;
        }
      }
    };
    $scope.holdingsModal = $modal.open(opts).result.finally(function() {
      // on close send the user to start page
      $location.url('');
    });
  };

});
