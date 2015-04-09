/*

Creates a text row for displaying a bib header

Usage:
  <kitin-bib-header model=""></kitin-bib-header>

Params:
  model: (record obj)

*/

kitin.directive('kitinBibHeader', function(editService, $rootScope, utilsService){
  return {
    restrict: 'E',
    scope: {
      record: '=record',
      recType: '=rectype',
      stickto: '=stickto'
    },
    replace: true,
    templateUrl: '/snippets/bib-header',
    controller: function ($scope, $attrs) {
      
      if ($attrs.hasOwnProperty('static')) {
        $scope.disableLinks = true;
      }
      else {
        $scope.disableLinks = false;
      }
      if ($scope.recType === "remote") {
        // reroute record variable
        if($scope.record.data)
          $scope.recordInfo = $scope.record.data;
        else
          $scope.recordInfo = $scope.record;
      }
      else {
        $scope.recordInfo = $scope.record;
      }

      $scope.showSticky = false;

      var sticky = angular.element($scope.stickto + ' .stickToTop');
      sticky.css('transform', 'translate(0px, -5000px)'); // Initially hidden (otherwise hide animation will be shown)

      $scope.hookScroll = function (hookElement) {
        angular.element(hookElement).scroll(function() {
          $scope.modalScroll = angular.element(hookElement).scrollTop();
          if ($scope.modalScroll > 100 && $attrs.hasOwnProperty('stickto')) {
            sticky.removeClass('hidden');
          }
          else {
            sticky.addClass('hidden');
          }

          sticky.css('transform', 'translate(0px, ' + ($scope.modalScroll - 47) +'px)');
        });
      };

      $scope.modalScroll = 0;
      $scope.hookScroll($scope.stickto);

    }
  };
});