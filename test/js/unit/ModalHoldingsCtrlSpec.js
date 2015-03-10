describe('Modal Holdings', function () {

	var scope, controller, modalInstance, record, recType, recordService, bib_7149593;

	// Load example record
	bib_7149593 = readJSON('test/js/mocks/bib_7149593.json');

	beforeEach(function () {
		module('kitin');
	});
	beforeEach(module('kitin.services'));

	beforeEach(inject(function($controller, $rootScope, _recordService_) {
		scope = $rootScope.$new();
		recordService = _recordService_;
		$rootScope['modifications'] = {
			'holding' : {}
		};
		$rootScope['promises'] = {
			'holding' : {}
		};
		modalInstance = {
			close: jasmine.createSpy('modalInstance.close'),
			dismiss: jasmine.createSpy('modalInstance.dismiss'),
			result: {
				then: jasmine.createSpy('modalInstance.result.then')
			}
		};
		createController = function () {
			return $controller('ModalHoldingsCtrl', {
				'$scope': scope,
				'$modalInstance' : modalInstance,
				record : bib_7149593,
				recType : ''
			});
		}
	}));

	describe('Get classification with matching schemes from bib post', function () {
		it('Match all', function () {
			controller = createController();
			var classificationsFrom = ['*'],
					result = scope.getClassificationsFromBibPost(classificationsFrom);
			expect(result.length).toEqual(5);
		});
		it('Match several', function () {
			controller = createController();
			var classificationsFrom = ['DDC', 'kssb*', 'DDC'],
					result = scope.getClassificationsFromBibPost(classificationsFrom);
			expect(result.length).toEqual(3);
		});
		it('Match exactly', function () {
			controller = createController();
			var classificationsFrom = ['DDC'],
					result = scope.getClassificationsFromBibPost(classificationsFrom);
			expect(result.length).toEqual(1);
		});
		it('Match with trailing wildcard', function () {
			controller = createController();
			var classificationsFrom = ['kssb*'],
					result = scope.getClassificationsFromBibPost(classificationsFrom);
			expect(result.length).toEqual(2);
		});
		it('Match nothing', function () {
			controller = createController();
			var classificationsFrom = ['INVALIDSCHEME'],
					result = scope.getClassificationsFromBibPost(classificationsFrom);
			expect(result.length).toEqual(0);
		});
		
	});
	
});
