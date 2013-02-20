describe('Kitin controllers', function() {

  beforeEach(function(){
    this.addMatchers({
      toEqualData: function(expected) {
        return angular.equals(this.actual, expected);
      }
    });
  });

  beforeEach(module('kitin'));

  describe('SearchCtrl without query params', function() {
    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('partials/index').respond("apa");
      scope = $rootScope.$new();
      ctrl = $controller(SearchCtrl, {$scope: scope});
    }));

    it('it should return undefined', function() {
      expect(scope.result).toEqualData(undefined);
    });
  });

  describe('SearchCtrl with query param present', function() {
    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('/search?q=7149593').respond("");
      scope = $rootScope.$new();
      ctrl = $controller(SearchCtrl, {$scope: scope, $routeParams: {
        q:"7149593"
      }});
    }));

    it('it should set the query params on the scope var', function() {
      expect(scope.q).toEqualData("7149593");
    });
  });
});
