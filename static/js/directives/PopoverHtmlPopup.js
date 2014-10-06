angular.module("template/popover/popover-html.html", []).run(["$templateCache", function($templateCache) {
    $templateCache.put("template/popover/popover-html.html",
            "<div class=\"popover {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
            "  <div class=\"arrow\"></div>\n" +
            "\n" +
            "  <div class=\"popover-inner\">\n" +
            "      <h3 class=\"popover-title\" ng-bind=\"title\" ng-show=\"title\"></h3>\n" +
            "      <div class=\"popover-content\" ng-bind-html=\"content\">    </div>\n" +
            "  </div>\n" +
            "</div>\n" +
            "");
}]);

kitin.directive( 'popoverHtmlPopup', function() {

  return {
          restrict: 'EA',
          replace: true,
          scope: { title: '@', content: '@', placement: '@', animation: '&', isOpen: '&' },
          templateUrl: 'template/popover/popover-html.html'
      };
});