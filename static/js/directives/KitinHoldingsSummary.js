/*

Creates a holdings summary with a popover

Usage:
  <kitin-holdings-summary holdings=""></kitin-holdings-summary>

Params:
  holdings: (obj) Object containing holdings information for the record.

*/

kitin.directive('kitinHoldingsSummary', function () {
  return {
    restrict: 'E',
    scope: {
      'holdings' : '='
    },
    template: '<span popover-placement="bottom" popover-trigger="mouseenter" popover="{{holdingsInfo}}" popover-append-to-body="true">' +
        '<i class="fa fa-thumb-tack"></i> {{ holdings.items > 0 ? holdings.items : "Inga" }} bibliotek' +
        '</span>',
    controller: function($scope, $element) {

      $scope.$watch('holdings', function() {
        $scope.holdingsInfo = '';
        // Build HTML
        if($scope.holdings.items !== 0) {
          // If own holding, get it first
          if($scope.holdings.holding)
            $scope.holdingsInfo += $scope.holdings.holding.about.heldBy.notation;
          // Then get other
          for (var i = 0; i < $scope.holdings.all.length; i++) {
            if (i === 0 && $scope.holdingsInfo.length > 0)
              $scope.holdingsInfo += ", ";
            $scope.holdingsInfo += $scope.holdings.all[i].about.heldBy.notation;
            if(i < $scope.holdings.all.length - 1)
              $scope.holdingsInfo += ", ";
          }
        }
      }, true);

    }
  };

});