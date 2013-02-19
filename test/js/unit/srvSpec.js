describe('Kitin services', function() {
    beforeEach(angular.mock.module('kitin'));
    it('should fetch value from service', inject(function(testing) {
        expect(testing.getThis()).toEqual("Hello");
    }));
    /*var scope, $httpBackend;
    it ('should read marcmap and overlay', inject(function(_$httpBackend_, $rootScope, conf) {
        $httpBackend = _$httpBackend_;
        $httpBackend.expectGET('/marcmap.json').
        respond([{Author: 'Tove'}, {Title: 'Mumin'}]);

    }));*/
});
