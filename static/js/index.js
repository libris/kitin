var kitin2 = angular.module('kitin2', []);
kitin2.config(
  ['$locationProvider', '$routeProvider',
    function($locationProvider, $routeProvider) {

      $locationProvider.html5Mode(true);

      $routeProvider
        .when('/',
           {templateUrl: '/partials/index', controller: IndexCtrl})
        .when('/search',
           {templateUrl: '/partials/search', controller: SearchCtrl})
        //.when('/search/:query',
        //   {templateUrl: '/partials/search', controller: SearchCtrl})
        //.when('/hitlist',
        //   {templateUrl: '/partials/hitlist', controller: SearchCtrl})
        //.when('/hld',
        //    {templateUrl: '/partials/hld})
        
        ;//.otherwise({redirectTo: '/'});

    }]
);

function IndexCtrl($scope) {
    $scope.test = "STARTSIDA";
}
function SearchCtrl($scope, $http, $location, $routeParams) {
    $scope.search = function() {
        var url = "/search?q=" + $scope.q;
        $location.url(url);
    };
    if (!$routeParams.q) {
        return;
    }
    $scope.q = $routeParams.q;

    var url = "/search?q=" + $scope.q;
    //var hits = $scope.query.defer();
    $http.get(url).success(function(data, status) {
        console.log("HITS: ", data);
        $scope.result = data;
        $scope.status = status;
    })
    .error(function(data,status){
        $scope.result = "Error";
        $scope.status = status;
    });

    //$scope.test = "SÖK";
}


