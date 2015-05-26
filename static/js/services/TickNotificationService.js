kitin.factory('TickNotificationService', ['$rootScope',
function($rootScope) {
    // events:
    var TIME_AGO_TICK = "e:timeAgo";
    var timeAgoTick = function() {
        $rootScope.$broadcast(TIME_AGO_TICK);
    };
    var x = 20;
    // every x seconds, publish/$broadcast a TIME_AGO_TICK event
    setInterval(function() {
       timeAgoTick();
       $rootScope.$apply();
    }, 1000 * x);
    return {
        // publish
        timeAgoTick: timeAgoTick,
        // subscribe
        onTimeAgo: function($scope, handler) {
            $scope.$on(TIME_AGO_TICK, function() {
                handler();
            });
        }
    };
}]);
