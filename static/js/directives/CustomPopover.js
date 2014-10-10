kitin.directive('customPopover', function($compile) {

  // close on click outside 
  $('body').click(function(e) {

    var $target = $(e.target);

     $('*[popover], *[data-popover]').each(function () {

      var $pop = $(this).siblings('.popover').eq(0);

      if ( !$target.closest(this).length && !$target.closest($pop).length ) {
        $pop.remove();       
        angular.element(this).scope().tt_isOpen = false;
        $(this).closest('li').removeClass('open');
      }

    });
  });

  var tpl = '<div><strong>{{object.prefLabel}} ({{object.langCode}})</strong><br>{{object.matches}}</div>';

  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {

      scope.$watch('tt_isOpen', function(isOpen) {
        elem.closest('li').toggleClass('open', isOpen);
        if ( isOpen ) {
          scope.tooltip = elem.next();
          scope.object = JSON.parse(attrs.object);
          var el = angular.element(tpl);
          var compiled = $compile(el);
          scope.tooltip.find('.popover-content').append(el);
          compiled(scope);
        }
      });
    }
  };
});



angular.module("template/popover/popover.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/popover/popover.html",
      "<div class=\"popover {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
      "  <div class=\"arrow\"></div>\n" +
      "\n" +
      "  <div class=\"popover-inner\">\n" +
      "      <div class=\"popover-content\"></div>\n" +
      "  </div>\n" +
      "</div>\n" +
      "");
}]);