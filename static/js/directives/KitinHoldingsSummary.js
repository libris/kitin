/*

Creates a holdings summary with a popover

Usage:
	<kitin-holdings-summary holdings=""></kitin-holdings-summary>

Params:
	holdings: (obj)	Object containing holdings information for the record.

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
        	$scope.holdingsInfo = '';

        	var holdings = $scope.holdings;

        	// Build HTML
        	if(holdings.items != 0) {
        		// If own holding, get it first
        		if(holdings.holding)
        			$scope.holdingsInfo += holdings.holding.about.heldBy.notation + ", ";
        		// Then get other
        		for (var i = 0; i < holdings.all.length; i++) {
        			$scope.holdingsInfo += holdings.all[i].about.heldBy.notation;
        			if(i < holdings.all.length - 1)
        				$scope.holdingsInfo += ", ";
        		}
        	}
        }
	}

});