describe('Displaying a hitlist', function () {

	var scope, controller;

	beforeEach(module('kitin'));

	beforeEach(inject(function($controller, $rootScope) {
		scope = $rootScope.$new();
		$rootScope['state'] = {
			'search' : {}
		};
		createController = function () {
			return $controller('SearchResultCtrl', {
				'$scope' : scope
			})
		}
	}));

	describe('Total hit count from result data', function () {
		it('LIBRIS search', function() {
			controller = createController();
			var totalResults = 213;
			expect(scope.getHitCount(totalResults)).toEqual(213);
		});

		it('Remote search', function() {
			controller = createController();
			var totalResults = {"LC":4128, "Something" : 20};
			expect(scope.getHitCount(totalResults)).toEqual(4148);
		});
	});


});
