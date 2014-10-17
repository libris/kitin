angular.module('kitin').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('/snippets/hitlist-compact-bib',
    "<div class=\"hitlist-item bib compact\">\n" +
    "  <div class=\"title\">\n" +
    "    <strong>{{object.instanceTitle.titleValue + object.instanceTitle.subtitle | chop }}</strong>\n" +
    "  </div>\n" +
    "  <div class=\"creator\">\n" +
    "    {{ object.responsibilityStatement | chop }}\n" +
    "  </div>\n" +
    "  <div class=\"date\">\n" +
    "    <span title=\"Utgivningsår\" data-ng-repeat=\"publication in object.publication | limitTo:1\" data-ng-show=\"publication.providerDate\">\n" +
    "      {{publication.providerDate}}\n" +
    "    </span>\n" +
    "  </div>\n" +
    "</div>"
  );
}])