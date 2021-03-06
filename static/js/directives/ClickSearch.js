kitin.directive('clickSearch', function(editService){
  return {
      restrict: 'A',
      scope: true,
      link: function(scope, element, attrs) {
        var container = element.closest('.search');
        scope.onclick = function(e) {
          container.addClass('active');
          setTimeout(function() {
            container.find('input').focus();
          },4);
        };
        scope.onblur = function(e) {
          container.removeClass('active').find('input').val('');
        };
      }
  };
});
