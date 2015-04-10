describe('Kitin SearchForm Controller', function() {

  var $rootScope, $scope, $controller, $httpBackend, ctrlLoader;

  beforeEach(function () {
    jasmine.addMatchers({
      toEqualData: function() {
        return {
          compare: function (actual, expected) {
            return {
              pass: angular.equals(actual, expected)
            }
          }
        };
      }
    });
  });

  beforeEach(module('kitin'));

  beforeEach(inject(function(_$rootScope_, _$controller_, _$httpBackend_){
    $rootScope = _$rootScope_;
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $scope = $rootScope.$new();
    
    ctrlLoader = function (q) {
      var vars = {
        '$scope': $scope,
        '$rootScope': $rootScope
      };
      if (q) {
        vars['$routeParams'] = {
          'q': q
        };
      }
      return $controller('SearchFormCtrl', vars);
    };
  }));

  describe('SearchFormCtrl with query param present', function() {
    beforeEach(inject(function() {
      var query = 'tove';
      $httpBackend.expectGET('/search/bib?q=' + query).respond({
        "@context": "/sys/context/lib.jsonld",
        "startIndex": 0,
        "itemsPerPage": 10,
        "totalResults": 0,
        "duration": "PT0.027S",
        "items": [],
        "facets": {
          "about.@type": {},
          "about.language.@id": {},
          "encLevel.@id": {}
        }
      });
      var ctrl = ctrlLoader(query);
    }));

    // Expectations
    it('', function() {
      // 
      //dump($rootScope);
    });
  });
});
