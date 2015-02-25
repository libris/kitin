kitin.controller('ModalContactCtrl', function($scope, $modalInstance, $q) {
  $scope.close = function() {
    var deferred = $q.defer();
    $modalInstance.close();
    deferred.resolve();
    return deferred.promise;
  };
});