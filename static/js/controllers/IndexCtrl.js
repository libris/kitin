kitin.controller('IndexCtrl', function($scope, $http, recordService, editService) {
  document.body.className = 'index';

  recordService.drafts.get().then(function(data) {
    for (var i = 0; i < data.drafts.length; i++) {
      var draft = data.drafts[i];
      var clickableTitle = draft.instanceTitle.subtitle ? draft.instanceTitle.titleValue + ' - ' + draft.instanceTitle.subtitle : draft.instanceTitle.titleValue;
      if (!clickableTitle) clickableTitle = '<Titel saknas>';
      draft.clickableTitle = clickableTitle;
    }
    $scope.drafts = data.drafts;
  });

  $scope['delete'] = function(id) {
    editService.getRecordTypeId(id).then(function(recTypeId) {
      recordService.draft.delete(recTypeId.type, recTypeId.id).then(function(data) {
        $scope.drafts = data.drafts;
      });
    });
  };
});