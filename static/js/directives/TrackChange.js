kitin.directive('trackChange', function ($rootScope, $timeout) {
  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {

      // Some elements need to trigger a custom event 
      var customEvent = attrs.changeEvent || 'changed';
      var targetModel = attrs.trackChange || 'bib';

      var triggeredResponse = false;
      var trigger = function(someVar, event) {
        // Make sure we only trigger once
        if (triggeredResponse) return;
        $timeout(function() {
          $rootScope.modifications[targetModel].saved = false;
          $rootScope.modifications[targetModel].published = false;
          triggeredResponse = true;
        });
      };

      elem.keyup(function (event) { // or change (when leaving)
        trigger('Keyup', event);
      });

      elem.blur(function(event) {
        trigger('Selected', event);
      });

      elem.change(function(event) {
        trigger('Changed', event);
      });

      if (customEvent) {
        var customEventListener = scope.$on(customEvent, function(event, payload) {
          //console.log(event.name, payload);
          trigger(customEvent, event);
          // Done, stop listening. In the future, perhaps continue listening
          // but this is good enough for dirty checking.
          customEventListener();
        });
      }
    }
  };
});