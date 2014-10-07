kitin.directive('customPopover', function($compile) {
  var tpl = '<div><strong>{{object.prefLabel}} ({{object.langCode}})</strong><br>{{object.matches}}</div>';
  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {
      scope.$watch('tt_isOpen', function(isOpen) {
        elem.closest('li').toggleClass('open', isOpen);
        if ( isOpen ) {
          scope.object = JSON.parse(attrs.object);
          var el = angular.element(tpl);
          var compiled = $compile(el);
          elem.next().find('.popover-content').append(el);
          compiled(scope);
          scope.parsed = el.html();
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