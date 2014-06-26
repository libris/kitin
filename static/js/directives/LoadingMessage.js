kitin.directive('loadingMessage', [function() {
    return {
        scope: {},
        template: '<p class="loading-text">{{loadingText}}</p>',
        restrict: 'EA',
        link: function($scope, elm, attrs, controller) {
            $scope.loadingText = attrs.loadingMessage !== '' ? attrs.loadingMessage : 'Laddar...';
            $scope.Spinner = new Spinner({
              lines: 11, // The number of lines to draw
              length: 0, // The length of each line
              width: 7, // The line thickness
              radius: 14, // The radius of the inner circle
              corners: 1, // Corner roundness (0..1)
              rotate: 0, // The rotation offset
              direction: 1, // 1: clockwise, -1: counterclockwise
              color: '#000', // #rgb or #rrggbb or array of colors
              speed: 1, // Rounds per second
              trail: 50, // Afterglow percentage
              shadow: false, // Whether to render a shadow
              hwaccel: false, // Whether to use hardware acceleration
              className: 'spinner', // The CSS class to assign to the spinner
              zIndex: 2e9, // The z-index (defaults to 2000000000)
              top: '40%', // Top position relative to parent
              left: '50%' // Left position relative to parent
            });     
            $scope.Spinner.spin(elm[0]);
        }
    };
}]);