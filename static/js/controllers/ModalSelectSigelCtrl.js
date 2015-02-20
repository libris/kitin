kitin.controller('ModalSelectSigelCtrl', function($scope, $modalInstance, $rootScope, $location, $q, userData) {

  $scope.userData = userData;


  $scope.close = function() {
    var deferred = $q.defer();
    $modalInstance.close();
    deferred.resolve();
    return deferred.promise;
  };
});