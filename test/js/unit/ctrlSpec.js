describe('Kitin controllers', function() {
    beforeEach(module('kitin'));
    describe('TestCtrl', function() {
        var scope, ctrl;
        beforeEach(inject(function($rootScope, $controller) {
            scope = $rootScope.$new();
            ctrl = $controller(TestCtrl, {$scope: scope});
        }));
        it('should create "books" model with 3 books', function() {
            expect(scope.books.length).toBe(3);
        });
        it('should call "testing" service and store return in variable servtest', function() {
            expect(scope.servtest).toEqual("Hello");
        });
    });
    describe('TestHttpCtrl', function() {
        var scope, ctrl, $httpBackend;
        beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
            $httpBackend = _$httpBackend_;
            $httpBackend.expectGET('/overlay.json').respond({data: "OK"});

            scope = $rootScope.$new();
            ctrl = $controller(TestCtrl, {$scope: scope});
        }));

        it('should call "testHttp" service and store return in variable anotherTest', function() {
            expect(scope.anotherTest).toBeUndefined();
            $httpBackend.flush();
            expect(scope.anotherTest).toEqualData({data: "OK"});
        });
    });
});

