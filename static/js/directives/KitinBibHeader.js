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


      $scope.hookScroll = function (hookElement) {
        angular.element(hookElement).scroll(function() {
          $scope.modalScroll = angular.element(hookElement).scrollTop();
          if ($scope.modalScroll > 100 && $attrs.hasOwnProperty('stickto')) {
            sticky.removeClass('fade');
          }
          else {
            sticky.addClass('fade');

            // If sticky is not shown we need to push it away so that we can correctly select the text beneath it
            setTimeout(function () {
              if (sticky.css('opacity') <= 0) // This check makes sure that the delayed transformation isn't triggered if the fade was cancelled
                sticky.css('transform', 'translate(0px, -500px)');
            }, 400);
          }

          sticky.css('transform', 'translate(0px, ' + ($scope.modalScroll - 47) +'px)');

        });
      };

      var sticky = angular.element($scope.stickto + ' .stickToTop');

      if(typeof $scope.stickto === 'undefined') {
        sticky.addClass('hidden');
      } else {
        sticky.removeClass('hidden');
        $scope.modalScroll = 0;
        $scope.hookScroll($scope.stickto);
      }


    }
  };
});
