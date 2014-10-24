angular.module('kitin').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('/snippets/comment-header-row-template',
    "<td>\n" +
    "  <span class=\"lbl\" translate>LABEL.record.about.comment</span>\n" +
    "</td>"
  );


  $templateCache.put('/snippets/comment-row-template',
    "<td>\n" +
    "  <div class=\"label\">\n" +
    "    <textarea ng-model=\"objects[$index]\" data-ui-jq=\"autosize\" data-inplace class=\"ng-pristine ng-valid\" type=\"text\"></textarea>\n" +
    "  </div>\n" +
    "</td>\n" +
    "<td class=\"controls\">\n" +
    "  <button class=\"btn-link deleter\" data-ng-click=\"removeTableRow($index)\">\n" +
    "    <i class=\"fa fa-times\"></i>\n" +
    "  </button>\n" +
    "</td>"
  );


  $templateCache.put('/snippets/general-identifier-header-row-template',
    "<td><span class=\"lbl\" translate>LABEL.record.about.identifers.generalIdentifier.identifierValue</span></td>\n" +
    "<td><span class=\"lbl\" translate>LABEL.record.about.identifers.generalIdentifier.identifierNote</span></td>\n" +
    "<td><span class=\"lbl\" translate>LABEL.record.about.identifers.generalIdentifier.identifierScheme</span></td>\n" +
    "<td><span class=\"lbl\" translate>LABEL.record.about.identifers.generalIdentifier.identifierStatus</span></td>"
  );


  $templateCache.put('/snippets/general-identifier-row-template',
    "<td>\n" +
    "  <div class=\"label\">\n" +
    "    <input ng-model=\"object['identifierValue']\" data-inplace class=\"ng-pristine ng-valid\" type=\"text\" />\n" +
    "  </div>\n" +
    "</td>\n" +
    "<td>\n" +
    "  <div class=\"label\">\n" +
    "    <input ng-model=\"object['identifierNote']\" data-inplace class=\"ng-pristine ng-valid\" type=\"text\" />\n" +
    "  </div>\n" +
    "</td>\n" +
    "<td>\n" +
    "  <div class=\"label\">\n" +
    "    <input ng-model=\"object['identifierScheme']['@id']\" data-inplace class=\"ng-pristine ng-valid\" type=\"text\" />\n" +
    "  </div>\n" +
    "</td>\n" +
    "<td>\n" +
    "  <div class=\"label\">\n" +
    "    <input ng-model=\"object['identifierStatus']\" data-inplace class=\"ng-pristine ng-valid\" type=\"text\" />\n" +
    "  </div>\n" +
    "</td>\n" +
    "<td class=\"controls\">\n" +
    "  <button class=\"btn-link deleter\" data-ng-click=\"removeTableRow($index)\">\n" +
    "    <i class=\"fa fa-times\"></i>\n" +
    "  </button>\n" +
    "</td>"
  );


  $templateCache.put('/snippets/hitlist-compact-auth',
    "<div class=\"hitlist-item auth compact\">\n" +
    "  <div class=\"title\">\n" +
    "    <strong>{{ object.controlledLabel + object.prefLabel + object.name + object.uniformTitle | chop }}</strong>\n" +
    "  </div>\n" +
    "  <div class=\"creator\">\n" +
    "    {{ object.name | chop }}\n" +
    "  </div>\n" +
    "  <div class=\"about\">\n" +
    "    <span title=\"about\">{{ object.about['@type'] }}</span>\n" +
    "  </div>\n" +
    "</div>"
  );


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


  $templateCache.put('/snippets/holdings-button',
    " <div class=\"holding\">\n" +
    "  <a class=\"btn btn-purple btn-hld\" data-ng-controller=\"ModalCtrl\" data-ng-click=\"openHoldingsModal($event, recordId)\">\n" +
    "    <span data-ng-if=\"!record.holdings.holding\"><i class=\"fa fa-inverse fa-plus\"></i> Bestånd</span>\n" +
    "    <span data-ng-if=\"record.holdings.holding\"><i class=\"fa fa-inverse fa-check\"></i> Bestånd</span>\n" +
    "  </a>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/influentialRelation-header-row-template',
    "<td>\n" +
    "    <span class=\"lbl\" translate>LABEL.record.about.influentialRelation</span>\n" +
    "</td>"
  );


  $templateCache.put('/snippets/influentialRelation-row-template',
    "<td>\n" +
    "  <div class=\"label\">\n" +
    "    <textarea ng-model=\"objects[$index].uniformTitle\" data-inplace class=\"ng-pristine ng-valid\" type=\"text\"></textarea>\n" +
    "  </div>\n" +
    "</td>\n" +
    "<td class=\"controls\">\n" +
    "  <button class=\"btn-link deleter\" data-ng-click=\"removeTableRow($index)\">\n" +
    "    <i class=\"fa fa-times\"></i>\n" +
    "  </button>\n" +
    "</td>"
  );


  $templateCache.put('/snippets/isbn-header-row-template',
    "<td><!--TODO fix labels and error messages for identifiers-->\n" +
    "  <span class=\"lbl-inline lbl\"\n" +
    "        data-ng-hide=\"subform.isbn_name.$error.invalid_value || subform.isbn_name.$error.invalid_length\"><span translate>LABEL.record.about.identifers.isbn.identifierValue</span>                      \n" +
    "  </span>\n" +
    "  <span class=\"lbl-inline lbl error-label\"\n" +
    "        data-ng-show=\"subform.isbn_name.$error.invalid_value || subform.isbn_name.$error.invalid_length\" translate>LABEL.record.about.identifers.isbn.identifierValue \n" +
    "  <span class=\"error_message\" data-ng-show=\"subform.isbn_name.$error.invalid_value\">(Fel numeriskt värde)</span>\n" +
    "  <span class=\"error_message\" data-ng-show=\"subform.isbn_name.$error.invalid_length\">(Fel längd)</span>\n" +
    "  </span>\n" +
    "</td>\n" +
    "<td><span class=\"lbl\" translate>LABEL.record.about.identifers.isbn.identifierNote</span></td>"
  );


  $templateCache.put('/snippets/isbn-row-template',
    "<td>\n" +
    "  <div class=\"label\">\n" +
    "    <input data-inplace type=\"text\" data-inplace name=\"isbn_name\" data-ng-model=\"object['identifierValue']\" data-isbn-pattern=\"^$|^[0-9-xX]*$\" isbnvalidator/>\n" +
    "  </div>\n" +
    "</td>\n" +
    "<td>\n" +
    "  <div class=\"label\">\n" +
    "    <input data-inplace ng-model=\"object['identifierNote']\" data-inplace class=\"ng-pristine ng-valid\" type=\"text\" />\n" +
    "  </div>\n" +
    "</td>\n" +
    "<td class=\"controls\">\n" +
    "  <button class=\"btn-link deleter\" data-ng-click=\"removeTableRow($index)\">\n" +
    "    <i class=\"fa fa-times\"></i>\n" +
    "  </button>\n" +
    "</td>"
  );


  $templateCache.put('/snippets/issn-header-row-template',
    "<td><span class=\"lbl\" translate>LABEL.record.about.identifers.issn.identifierValue</span></td>\n" +
    "<td><span class=\"lbl\" translate>LABEL.record.about.identifers.issn.identifierNote</span></td>"
  );


  $templateCache.put('/snippets/issn-row-template',
    "<td>\n" +
    "  <div class=\"label\">\n" +
    "    <input ng-model=\"object['identifierValue']\" data-inplace class=\"ng-pristine ng-valid\" type=\"text\" />\n" +
    "  </div>\n" +
    "</td>\n" +
    "<td>\n" +
    "  <div class=\"label\">\n" +
    "    <input ng-model=\"object['identifierNote']\" data-inplace class=\"ng-pristine ng-valid\" type=\"text\" />\n" +
    "  </div>\n" +
    "</td>\n" +
    "<td class=\"controls\">\n" +
    "  <button class=\"btn-link deleter\" data-ng-click=\"removeTableRow($index)\">\n" +
    "    <i class=\"fa fa-times\"></i>\n" +
    "  </button>\n" +
    "</td>"
  );


  $templateCache.put('/snippets/languageNote-header-row-template',
    "<td>\n" +
    "  <span class=\"lbl\" translate>LABEL.record.about.languageNote</span>\n" +
    "</td>"
  );


  $templateCache.put('/snippets/languageNote-row-template',
    "<td>\n" +
    "  <div class=\"label\">\n" +
    "    <textarea ng-model=\"objects[$index]\" data-inplace class=\"ng-pristine ng-valid\" type=\"text\"></textarea>\n" +
    "  </div>\n" +
    "</td>\n" +
    "<td class=\"controls\">\n" +
    "  <button class=\"btn-link deleter\" data-ng-click=\"removeTableRow($index)\">\n" +
    "    <i class=\"fa fa-times\"></i>\n" +
    "  </button>\n" +
    "</td>"
  );


  $templateCache.put('/snippets/messages',
    "<div id=\"system-message-container\">\n" +
    "  <alert ng-repeat=\"message in systemMessages track by $index\" type=\"message.type\" close=\"closeSystemMessage($index)\">{{message.msg}}</alert>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/modal-create-new',
    "<div class=\"modal-header\">\n" +
    "  <button type=\"button\" class=\"close\" ng-click=\"close()\" aria-hidden=\"true\">&times;</button>\n" +
    "  <h2 id=\"rlModalLabel\">Skapa ny katalogpost</h2>\n" +
    "</div>\n" +
    "<div class=\"modal-body cols\">\n" +
    "<tabset>\n" +
    "  <tab>\n" +
    "    <tab-heading>Bibliografisk post</tab-heading>\n" +
    "    <div class=\"col4\"\n" +
    "        data-ng-repeat=\"typeGroup in typeGroups\"\n" +
    "        data-ng-include=\"'render-new-type-group'\">\n" +
    "    </div>\n" +
    "  </tab>\n" +
    "</tabset>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <a class=\"btn btn-green\"\n" +
    "     href=\"/edit/draft/bib/new?type={{ createNew.mainType }}&amp;aggregateLevel={{ createNew.aggregateLevel }}\"\n" +
    "     data-ng-click=\"close()\"\n" +
    "     >Skapa <i class=\"fa fa-arrow-circle-right\"></i></a>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/modal-edit-auth',
    "<div class=\"modal-header\">\n" +
    " <button type=\"button\" class=\"close\" ng-click=\"close()\" aria-hidden=\"true\">&times;</button>\n" +
    "  <h4 class=\"modal-title\">Auktoritetspost ({{ instance['@type'] }})</h4>\n" +
    "</div>\n" +
    "<div class=\"modal-body\" data-ng-controller=\"EditCtrl\">    \n" +
    "  <div ng-include=\"'/partials/edit/auth'\"></div>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/modal-edit-bib',
    "<div class=\"modal-header\">\n" +
    " <button type=\"button\" class=\"close\" ng-click=\"close()\" aria-hidden=\"true\">&times;</button>\n" +
    "  <h4 class=\"modal-title\">Bibliotekspost ({{ instance['@type'] }})</h4>\n" +
    "</div>\n" +
    "<div class=\"modal-body\" data-ng-controller=\"EditCtrl\">    \n" +
    "  <div ng-include=\"'/partials/edit/bib'\"></div>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/modal-holdings',
    "<div class=\"modal-header holdings\">\n" +
    "  <button type=\"button\" class=\"close\" ng-click=\"close()\" aria-hidden=\"true\">&times;</button>\n" +
    "  <h4 class=\"modal-title\" translate>LABEL.gui.terms.HOLDINGS</h4>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"modal-body holdings\">\n" +
    "  <form data-ng-show=\"holding.data['@id'] || !holding['etag']\">\n" +
    "    <section class=\"offer\" data-ng-repeat=\"offer in holding.data.about.offers track by $index\">\n" +
    "      <div class=\"cols\">\n" +
    "        <div class=\"col6\">\n" +
    "          <div class=\"label\">\n" +
    "            <span class=\"lbl\" translate>LABEL.holding.about.offers.shelfLocation</span>\n" +
    "            <input data-inplace type=\"text\" data-ng-model=\"offer.shelfLocation\"/>\n" +
    "          </div>\n" +
    "          <div class=\"label\">\n" +
    "            <span class=\"lbl\" translate>LABEL.holding.about.offers.classificationPart</span>\n" +
    "            <input data-inplace type=\"text\" data-ng-model=\"offer.classificationPart\"/>\n" +
    "          </div>\n" +
    "          <div class=\"label\">\n" +
    "            <span class=\"lbl\" translate>LABEL.holding.about.offers.shelfControlNumber</span>\n" +
    "            <input data-inplace type=\"text\" data-ng-model=\"offer.shelfControlNumber\"/>\n" +
    "          </div>\n" +
    "          <div class=\"label\">\n" +
    "            <span class=\"lbl\" translate>LABEL.holding.about.offers.shelfLabel</span>\n" +
    "            <input data-inplace type=\"text\" data-ng-model=\"offer.shelfLabel\"/>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "        <div class=\"col6\">\n" +
    "          <div class=\"label\">\n" +
    "            <span class=\"lbl\" translate>LABEL.holding.about.offers.availability</span>\n" +
    "            <input data-inplace type=\"text\" data-ng-model=\"offer.availability\"/>\n" +
    "          </div>\n" +
    "          <div class=\"label\">\n" +
    "            <span class=\"lbl\" translate>LABEL.holding.about.offers.copyNumber</span>\n" +
    "            <input data-inplace type=\"text\" data-ng-model=\"offer.copyNumber\"/>\n" +
    "          </div>\n" +
    "          <div class=\"label\">\n" +
    "            <span class=\"lbl\" translate>LABEL.holding.about.offers.copyNote</span>\n" +
    "            <textarea data-inplace data-ui-jq=\"autosize\" spellcheck=\"false\" data-ng-model=\"offer.copyNote\"></textarea>\n" +
    "          </div>\n" +
    "          <div class=\"label\">\n" +
    "            <span class=\"lbl\" translate>LABEL.holding.about.offers.editorialNote</span>\n" +
    "            <textarea data-inplace data-ui-jq=\"autosize\" spellcheck=\"false\" data-ng-model=\"offer.editorialNote\"></textarea>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "        <div class=\"col12\">\n" +
    "          <button class=\"btn btn-link pull-right\" data-ng-if=\"holding.data.about.offers.length > 1\" data-ng-click=\"deleteOffer(holding, $index)\"><i class=\"fa fa-trash-o\"></i> Radera lokalsignum</button>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </section>\n" +
    "  </form>\n" +
    "\n" +
    "  <hrdata-ng-show=\"holding\">\n" +
    "\n" +
    "  <div class=\"alert alert-success\" role=\"alert\" data-ng-show=\"!holding\">\n" +
    "    {{ \"Beståndet raderat\" }}\n" +
    "  </div>\n" +
    "  \n" +
    "  <div class=\"alert alert-error\" role=\"alert\" data-ng-show=\"holding.data.about.offers.length < 1\">\n" +
    "    {{ \"Beståndet saknar lokalsignum\" }}\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"modal-alerts\" data-ng-show=\"alerts.length > 0\">\n" +
    "    <alert data-ng-repeat=\"alert in alerts\" type=\"{{alert.type}}\" close=\"closeAlert($index)\">{{alert.msg}}</alert>\n" +
    "  </div>\n" +
    "\n" +
    "  <div>\n" +
    "    <button class=\"btn btn-flat btn-purple-light\" data-ng-click=\"addOffer(holding)\" data-ng-show=\"holding\"><i class=\"fa fa-plus\"></i> Lägg till lokalsignum</button>\n" +
    "  </div>\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"modal-footer holdings submit\">\n" +
    "  <div class=\"status pull-left\">\n" +
    "    <div data-ng-if=\"modifications.saved\">Inga osparade ändringar.</div>\n" +
    "    <div data-ng-if=\"!modifications.saved\">Du har inte sparat dina ändringar.</div>\n" +
    "  </div>\n" +
    "  <button class=\"btn-link\" id=\"delete-hld\" data-ng-click=\"deleteHolding(holding)\" data-ng-show=\"holding.data['@id']\"><i class=\"fa fa-trash-o\"></i> Radera bestånd</button>\n" +
    "  <button class=\"btn btn-purple btn-submit\" id=\"save-hld\" data-ng-click=\"saveHolding(holding)\" data-ng-show=\"holding\">Spara bestånd</button>\n" +
    "  <button class=\"btn btn-purple btn-submit\" id=\"save-hld\" data-ng-click=\"close()\" data-ng-show=\"!holding\">Stäng</button>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/modal-release',
    "<div class=\"modal-header\">\n" +
    "  <button type=\"button\" class=\"close\" ng-click=\"close()\" aria-hidden=\"true\">&times;</button>\n" +
    "  <h2 id=\"rlModalLabel\">Release Notes</h2>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "  <h4>2014-07-02</h4>\n" +
    "  <ul>\n" +
    "    <li>Förenklad träfflista.</li>\n" +
    "    <li>Förbättrad funktionalitet för att lägga till fält i post.</li>\n" +
    "    <li>Tillägg av oauktoriserade uppslag.</li>\n" +
    "    <li>Hantering av laddnings- och systemfelsmeddelanden.</li>\n" +
    "  </ul>\n" +
    "  <h4>2014-06-02</h4>\n" +
    "  <p>Gränssnitt</p>\n" +
    "  <ul>\n" +
    "    <li>Förbättrad autosuggest för språk, länder, personer och ämnesord.</li>\n" +
    "    <li>Påbörjat arbete med implementering av värden från fasta fält.</li>\n" +
    "    <li>Förbättrat flöde och mallhantering för katalogisering av monografi.</li>\n" +
    "  </ul>\n" +
    "  <h4>2014-05-19</h4>\n" +
    "  <p>Gränssnitt</p>\n" +
    "  <ul>\n" +
    "    <li>Ny sökruta med tydligare information i vilken delmängd man söker i.</li>\n" +
    "    <li>Träfflistan har nu tydligare information om antal träffar, samt en direktknapp \"till toppen\".</li>\n" +
    "    <li>\"Sticky\" footer i redigeringsläget där postinformation kan rymmas.</li>\n" +
    "    <li>Påbörjat ombyggnad av \"taggning\" för språk, länder och ämnesord, samt andra definitionslistor</li>\n" +
    "    <li>En \"åter träfflistan\" länk har ersatt sökrutan i redigeringsläget för att spara utrymme.</li>\n" +
    "  </ul>\n" +
    "  <h4>2014-04-15</h4>\n" +
    "  <p>Gränssnitt</p>\n" +
    "  <ul>\n" +
    "    <li>Sökning och hämtning av poster i externa databaser (remotesök).</li>\n" +
    "    <li>Sortering och fler avgränsningsmöjligheter i träfflistan.</li>\n" +
    "    <li>Fler detaljer i fullposten, bla fler titeltyper, bärarspecifika detaljer och anmärkningar.</li>\n" +
    "    <li>Första iteration för att lägga till fält i vissa sektioner.</li>\n" +
    "  </ul>\n" +
    "  <h4>2013-12-18</h4>\n" +
    "  <p>Gränssnitt</p>\n" +
    "  <ul>\n" +
    "    <li>Semifunktionell prototyp av personhantering med tillägg av roller (förändringar av roller påverkar ännu inte den data som sparas).</li>\n" +
    "    <li>Ny hantering av definitionslistor (för t.ex. språk-, lands- och roll-/funktionskoder), med uppdaterad data.</li>\n" +
    "    <li>Enhetlig teknik för sökning av auktoriteter och definitioner.</li>\n" +
    "    <li>Förbättringar av sökning på personer och ämnen (ännu inget stöd för att skapa lokal definition av ett ämne).</li>\n" +
    "    <li>Minskade marginaler i sidhuvud och marginaler för att ge en mer kompakt arbetsyta.</li>\n" +
    "    <li>Förbättrat utseende i JSON-LD-vyn.</li>\n" +
    "  </ul>\n" +
    "  <p>Libris XL</p>\n" +
    "  <ul>\n" +
    "    <li>Fortsatt arbete med att hitta och skapa länkar till extraherade entiteter, nu inklusive  Organization och Work</li>\n" +
    "    <li>ElasticSearch, tokenisering i index och möjlighet att ställa in konfigurering specifikt per indextyp</li>\n" +
    "    <li>Förberedelse inför möjlighet att göra sökning mot externa kataloger via Z39.50. API som gör sökning mot metaproxy (där en testinstans i ett första steg söker mot LC Library of Congress, ESTER Estland och NLE Spanien) och returnerar metadata i JSON-LD.</li>\n" +
    "  </ul>\n" +
    "  <h4>2013-11-18</h4>\n" +
    "  <p>Gränssnitt</p>\n" +
    "  <ul>\n" +
    "    <li>Omstrukturerad layout efter användartester för att förbättra arbetsflöde och översikt</li>\n" +
    "    <li>Auktoritetssök, med grundläggande vy för att se aukt. post, fler detaljer finns under JSON-LD fliken.</li>\n" +
    "  </ul>\n" +
    "  <p>Libris XL</p>\n" +
    "  <ul>\n" +
    "    <li>Vi har förbättrat katalogsystemets infrastruktur för inläsning, lagring, bearbetning och indexering av metadata samt arbetat med optimering av APIer och uppslag för relaterat metadata baserat på länkar.</li>\n" +
    "  </ul>\n" +
    "  <h4>2013-10-25</h4>\n" +
    "  <p>Auktoritetsdata</p>\n" +
    "  <ul>\n" +
    "    <li>Länkar från bib-data till auth-data</li>\n" +
    "    <li>Uttryck namn+titel som verksentitet med huvuduppslag</li>\n" +
    "  </ul>\n" +
    "  <p>Libris XL</p>\n" +
    "  <ul>\n" +
    "    <li>Interpunktion rensas i vanligt förekommande fält</li>\n" +
    "    <li>Förbättrad infrastruktur (sök-API, dokumenthantering, OAI-PMH-import)</li>\n" +
    "  </ul>\n" +
    "  <p>Gränssnitt: JSON-LD-fliken</p>\n" +
    "  <ul>\n" +
    "    <li>Ihopvikbara block (klicka på etiketten)</li>\n" +
    "    <li>Navigerbara <code>@id</code>-länkar</li>\n" +
    "  </ul>\n" +
    "  <hr />\n" +
    "  <h4>2013-10-11</h4>\n" +
    "  <p>Ämnesord</p>\n" +
    "  <ul>\n" +
    "    <li>Se kontrollerade ämnesord uppdelat på system</li>\n" +
    "    <li>Lägga till och ta bort ämnesord (dock ej redigera redan tillagda)</li>\n" +
    "    <li>Rudimentär förslagsfunktion för att navigera och välja bland ämnesord</li>\n" +
    "  </ul>\n" +
    "  <p>Personauktoriteter är under rekonstruktion för att möjliggöra länkar (till skillnad från bara strängar) mellan auktoritetsposter och bibliografiska poster.\n" +
    "  </p>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/modal-remote',
    "<div class=\"modal-header\">\n" +
    "  <button type=\"button\" class=\"close\" ng-click=\"remoteDatabaseFilterQuery = ''; close()\">×</button>\n" +
    "  <h3 id=\"remoteModalLabel\">Remotekällor</h3>\n" +
    "  <div class=\"input-group col-md-4\">\n" +
    "    <input ng-model=\"remoteDatabaseFilterQuery\" placeholder=\"filtrera databaser\" class=\"form-control\">\n" +
    "    <span class=\"input-group-btn\">\n" +
    "      <button class=\"btn btn-default\" ng-click=\"remoteDatabaseFilterQuery = ''\">\n" +
    "        <i class=\"fa fa-times-circle\"></i>\n" +
    "      </button>\n" +
    "    </span>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "  <!--<div>\n" +
    "    Sortera:\n" +
    "    <ul>\n" +
    "      <li ng-click=\"orderRemoteDatabases = 'alternativeName'; groupRemoteDatabases = false;\">Bokstavsordning</li>\n" +
    "      <li ng-click=\"orderRemoteDatabases = 'country'; groupRemoteDatabases = true;\">Länder</li>\n" +
    "    <ul>\n" +
    "  </div>-->\n" +
    "  <div class=\"container-fluid\" ng-init=\"orderRemoteDatabases = 'alternativeName'; groupRemoteDatabases = false;\">\n" +
    "  <div class=\"row\">\n" +
    "    <dl class=\"col-md-6\" data-ng-repeat=\"database in orderedRemoteDatabases = ((state.remoteDatabases | orderBy: orderRemoteDatabases)) | filter:remoteDatabaseFilterQuery\">\n" +
    "      <dd>\n" +
    "        <h4 ng-if=\"groupRemoteDatabases && orderedRemoteDatabases[$index-1][orderRemoteDatabases] !== database[orderRemoteDatabases]\">\n" +
    "          {{database.country}}\n" +
    "        </h4>\n" +
    "        <a href=\"#\" class=\"database-name\"  ng-class=\"{'active':database.selected}\" ng-click=\"database.selected = !database.selected\">\n" +
    "          {{ database.alternativeName }}\n" +
    "        </a>\n" +
    "        <a href=\"{{database.address}}\" target=\"_blank\">\n" +
    "          <i class=\"fa fa-external-link\"></i>\n" +
    "        </a>\n" +
    "        <i data-ng-show=\"database.comment\" class=\"fa fa-info-circle database-comment\" title=\"{{ database.comment }}\"></i>\n" +
    "      </dd>\n" +
    "    </dl>\n" +
    "  </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button class=\"btn btn-green\" ng-click=\"remoteDatabaseFilterQuery = ''; close()\">OK</button>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/render-bib-search',
    "<!-- \n" +
    "render-bib-search\n" +
    "\n" +
    "Generic bib-search input field, used for reference fields\n" +
    "\n" +
    "-->\n" +
    "\n" +
    "<div class=\"label find-entity\">\n" +
    "  <div class=\"add-item search\">\n" +
    "    <div data-click-search>\n" +
    "      <span class=\"add-link\" ng-click=\"onclick($event)\"><i class=\"fa fa-plus\"></i> Lägg till {{ label }}</span>\n" +
    "      <span class=\"toggler\">  \n" +
    "        <span class=\"search-field\">\n" +
    "          <i class=\"fa fa-search\"></i>\n" +
    "          <input ng-blur=\"onblur($event)\" data-inplace class=\"input-large authdependant embedded\" type=\"text\"\n" +
    "            placeholder=\"Sök {{ label }}\"\n" +
    "            data-kitin-search-entity\n" +
    "            data-make-reference-on-item-select=\"true\"\n" +
    "            data-service-url=\"{{API_PATH}}/bib/_search\"\n" +
    "            data-filter=\"\"\n" +
    "            data-completion-template-id=\"bib-completion-template\">\n" +
    "        </span>\n" +
    "        <span class=\"linkchoice\">\n" +
    "          eller <a href=\"#\">Skapa ny</a>\n" +
    "        </span>\n" +
    "      </span>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/render-classification',
    "<a href=\"#\">\n" +
    "  <i class=\"fa fa-bookmark\" data-ng-if=\"isAuth(object)\"></i> {{ object.notation }}\n" +
    "</a> \n" +
    "<i data-ng-if=\"!editable.on\" data-ng-click=\"doRemove($index)\" class=\"no\">&times;</i>"
  );


  $templateCache.put('/snippets/render-country',
    "<a href=\"#\">\n" +
    "  <i class=\"fa fa-bookmark\" data-ng-if=\"isAuth(object)\"></i>\n" +
    "  {{ object.prefLabel }}\n" +
    "  <span data-ng-show=\"object.notation\">({{ object.notation }})</span>\n" +
    "</a>\n" +
    "<i data-ng-if=\"!editable.on\" data-ng-click=\"doRemove($index)\" class=\"no\">&times;</i>"
  );


  $templateCache.put('/snippets/render-generic-linked-entity',
    "<!-- \n" +
    "  render-generic-linked-entity\n" +
    "  \n" +
    "  Linked entity used in lists\n" +
    "\n" +
    "-->\n" +
    "\n" +
    "<a href=\"#\">\n" +
    "  <i class=\"fa fa-bookmark\" data-ng-if=\"isAuth(object)\"></i>\n" +
    "  {{ (object.prefLabel || object.prefLabel-en) }}\n" +
    "</a>\n" +
    "<i data-ng-if=\"!editable.on\" data-ng-click=\"doRemove($index)\" class=\"no\">&times;</i>"
  );


  $templateCache.put('/snippets/render-generic-non-auth-add',
    "<input data-inplace class=\"input-large authdependant embedded\" type=\"text\"\n" +
    "  placeholder=\"Lägg till\"\n" +
    "  data-kitin-search-entity\n" +
    "  data-completion-template-id=\"non-auth-completion-template\"\n" +
    "  data-allow-non-auth=\"true\">"
  );


  $templateCache.put('/snippets/render-generic-select',
    "<!-- \n" +
    "  render-generic-select\n" +
    "  Generic select dropdown for linked entities\n" +
    "-->\n" +
    "\n" +
    "<select \n" +
    "  data-kitin-select-entity\n" +
    "  data-selected-item-variable=\"selectedItem.data.about\"\n" +
    "  ng-options=\"(item.data.about.prefLabel || item.data.about.prefLabel-en) for item in objects | orderBy:'data.about.prefLabel'\">\n" +
    "</select>"
  );


  $templateCache.put('/snippets/render-generic-tag-entity',
    "<!-- \n" +
    "  render-generic-tag-entity  \n" +
    "  Generic tag, used for subject-fields\n" +
    "-->\n" +
    "\n" +
    "<ul class=\"tags\">\n" +
    "  <li>\n" +
    "    <a href=\"#\">\n" +
    "      <i class=\"fa fa-bookmark\" data-ng-if=\"isAuth(object)\"></i>\n" +
    "      {{ object.prefLabel }}\n" +
    "    </a>\n" +
    "    <i data-ng-if=\"!editable.on\" data-ng-click=\"doRemove($index)\" class=\"no\">&times;</i>\n" +
    "  </li>\n" +
    "</ul>"
  );


  $templateCache.put('/snippets/render-language',
    "<div class=\"tag-linked\"\n" +
    "  data-ng-controller=\"PopoverCtrl\" \n" +
    "  data-popover=\"{{loading}}\" \n" +
    "  data-object=\"{{object}}\" \n" +
    "  data-popover-title=\"{{object.prefLabel}}\" \n" +
    "  data-custom-popover=\"language\">\n" +
    "    <i class=\"fa fa-bookmark\" data-ng-if=\"isAuth(object)\"></i>\n" +
    "    {{ object.prefLabel }}\n" +
    "    <span data-ng-show=\"object.langCode\">({{ object.langCode }})</span>\n" +
    "    <i data-ng-if=\"!editable.on\" data-ng-click=\"doRemove($index)\" class=\"no\">&times;</i>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/render-marc-object',
    "<span data-ng-repeat=\"(key, value) in object\" data-ng-init=\"obj = object[key]\">\n" +
    "  <ng:switch on=\"typeOf(obj)\">\n" +
    "    <span data-ng-switch-when=\"object\">\n" +
    "      <code data-ng-if=\"key.length === 3\">{{ key }}</code>\n" +
    "      <span data-ng-init=\"object = obj\" data-ng-include=\"'/snippets/render-marc-object'\"></span>\n" +
    "    </span>\n" +
    "    <span data-ng-switch-when=\"string\">\n" +
    "        <code>{{ key }}</code>\n" +
    "        <span>{{ obj }}</span>\n" +
    "    </span>\n" +
    "  </ng:switch>\n" +
    "</span>"
  );


  $templateCache.put('/snippets/render-new-type-group',
    "<h3>{{ typeGroup.label }}</h3>\n" +
    "<div data-ng-repeat=\"class in typeGroup.classes\">\n" +
    "  <div class=\"label\" data-ng-class=\"{'text-muted': class.deprecated}\">\n" +
    "    <input type=\"radio\" name=\"{{ typeGroup.name }}\"\n" +
    "           data-ng-model=\"createNew[typeGroup.name]\"\n" +
    "           data-ng-value=\"getTermToken(class)\" />\n" +
    "    {{ class.get('label') }}\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/render-non-auth-tag',
    "<a href=\"#\">\n" +
    "  <i class=\"fa fa-bookmark\" data-ng-if=\"isAuth(object)\"></i>\n" +
    "  {{ object }}\n" +
    "</a>\n" +
    "<i data-ng-if=\"!editable.on\" data-ng-click=\"doRemove($index)\" class=\"no\">&times;</i>"
  );


  $templateCache.put('/snippets/render-object',
    "<div class=\"header\" data-ng-if=\"object[TYPE] || object[ID]\">\n" +
    "  <span class=\"type\" data-ng-if=\"object[TYPE]\"\n" +
    "        data-ng-repeat=\"typekey in ensureArray(object[TYPE])\"\n" +
    "        data-ng-click=\"openTermDef(typekey)\">{{ typekey }} </span>\n" +
    "  <span data-ng-if=\"object[ID]\">\n" +
    "    <a href=\"{{ toJsonLdLink(object[ID]) }}\">&lt;{{ object[ID] }}&gt; </a>\n" +
    "  </span>\n" +
    "</div>\n" +
    "<div data-ng-repeat=\"key in jsonLdKeys(object)\"\n" +
    "     data-ng-init=\"obj = object[key]\" data-ng-if=\"key[0] != '@'\">\n" +
    "  <ng:switch on=\"typeOf(obj)\">\n" +
    "    <div data-ng-switch-when=\"object\"\n" +
    "         data-ng-init=\"collapsed = (key == '_marcUncompleted')\"\n" +
    "         data-ng-class=\"{collapsed: collapsed, array: lodash.isArray(obj)}\">\n" +
    "      <div class=\"label\" class=\"entitylink\">\n" +
    "        <span data-ng-click=\"openTermDef(key)\">{{ key }}</span>\n" +
    "        <i data-ng-click=\"collapsed=!collapsed\"> </i>\n" +
    "      </div>\n" +
    "      <section data-ng-init=\"object = obj;\n" +
    "            linked = obj[ID] &amp;&amp; obj[ID].indexOf('_:') != 0 &amp;&amp; key != 'about'\"\n" +
    "          data-ng-include=\"'/snippets/render-object'\"\n" +
    "          data-ng-class=\"{linked: linked}\" class=\"entity\"></section>\n" +
    "    </div>\n" +
    "    <span data-ng-switch-when=\"string\">\n" +
    "      <code data-ng-click=\"openTermDef(key)\">{{ key }}</code>\n" +
    "      <input data-ng-if=\"!linked\" data-ng-model=\"obj\" type=\"text\" />\n" +
    "      <span data-ng-if=\"linked\">{{ obj }}</span>\n" +
    "    </span>\n" +
    "  </ng:switch>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/render-person-name',
    "<span data-ng-if=\"person.givenName || person.familyName\" class=\"name\">\n" +
    "  {{ person.givenName }} {{ person.familyName }}\n" +
    "</span>\n" +
    "<span data-ng-if=\"person.name\" class=\"name\">\n" +
    "  {{ person.name }}\n" +
    "</span>\n" +
    "<span data-ng-if=\"person.personTitle\">\n" +
    "  ( <span ng-repeat=\"personTitle in person.personTitle\">{{ personTitle }} </span>)\n" +
    "</span>\n" +
    "<span data-ng-if=\"person.birthYear || person.deathYear\">\n" +
    "  <span class=\"timeSpan\">{{ person.birthYear }}-{{ person.deathYear }}</span>\n" +
    "</span>"
  );


  $templateCache.put('/snippets/render-person',
    "<div data-ng-if=\"isLinked(object) && !isEmpty(object)\" class=\"entity person linked\">\n" +
    "  <div class=\"main\">\n" +
    "    <span onload=\"person = object\" data-ng-include=\"'/snippets/render-person-name'\"></span>\n" +
    "    <a data-ng-if=\"isLinked(object)\" class=\"btn-link auth\" data-ng-controller=\"ModalCtrl\" data-ng-click=\"openAuthModal(person['@id'])\">\n" +
    "      <i class=\"fa fa-bookmark\"></i> Aukt.\n" +
    "    </a>\n" +
    "  </div>\n" +
    "  <div data-ng-include=\"'/snippets/roles'\"></div>\n" +
    "  <a data-ng-if=\"!editable.on\" class=\"delete\" href=\"#\"\n" +
    "     data-ng-click=\"doRemove($index)\"><i class=\"fa fa-times\"></i></a>\n" +
    "</div>\n" +
    "<div data-ng-if=\"!isLinked(object)\" class=\"entity person embedded\"\n" +
    "      data-ng-init=\"editable = {on: !(object.controlledLabel || object.givenName || object.name)}\">\n" +
    "  <div data-ng-hide=\"editable.on\">\n" +
    "      <div class=\"label\" >\n" +
    "        <span onload=\"person = object\" data-ng-include=\"'/snippets/render-person-name'\"></span><a class=\"auth\" href=\"#\" data-ng-click=\"editable.on = !editable.on\">Ändra</a>\n" +
    "      </div>\n" +
    "  </div>\n" +
    "  <div data-ng-show=\"editable.on\">\n" +
    "    <a class=\"delete\" href=\"#\" data-ng-click=\"doRemove($index)\"><i class=\"fa fa-times\"></i></a>\n" +
    "    <div class=\"label\">\n" +
    "      <span class=\"lbl\">{{ \"Förnamn\" }}</span>\n" +
    "      <input data-inplace class=\"\" type=\"text\" placeholder=\"Förnamn\"\n" +
    "             data-ng-model=\"object.givenName\" />\n" +
    "    </div>\n" +
    "    <div class=\"label\">\n" +
    "      <span class=\"lbl\">{{ \"Släktnamn\" }}</span>\n" +
    "      <input data-inplace class=\"\" type=\"text\" placeholder=\"Släktnamn\"\n" +
    "             data-ng-model=\"object.familyName\" />\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div data-ng-show=\"editable.on\">\n" +
    "    <div class=\"label\">\n" +
    "      <span class=\"lbl\">{{ \"Född\" }}</span>\n" +
    "      <input data-inplace class=\"authdependant\" type=\"text\" placeholder=\"ÅÅÅÅ\"\n" +
    "             data-ng-model=\"object.birthYear\" />\n" +
    "\n" +
    "    </div>\n" +
    "    <div class=\"label\">\n" +
    "      <span class=\"lbl\">{{ \"Död\" }}</span>\n" +
    "      <input data-inplace class=\"authdependant\" type=\"text\" placeholder=\"ÅÅÅÅ\" \n" +
    "             data-ng-model=\"object.deathYear\" />\n" +
    "    </div>\n" +
    "    <!--\n" +
    "    <div data-ng-controller=\"ModalCtrl\">\n" +
    "      <button class=\"btn btn-primary\" data-ng-click=\"openAuthModal($event)\">Aukt.</button>\n" +
    "    </div>\n" +
    "    -->\n" +
    "  </div>\n" +
    "  <div data-ng-include=\"'/snippets/roles'\"></div>\n" +
    "  <a data-ng-if=\"!editable.on\" class=\"delete\" href=\"#\" data-ng-click=\"doRemove($index)\">\n" +
    "    <i class=\"fa fa-trash\"></i>\n" +
    "  </a>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/render-referenced-entity',
    "<!-- \n" +
    "  render-referenced-entity\n" +
    "  Render generic linked bib reference tag.\n" +
    "-->\n" +
    "\n" +
    "<a href=\"?m={{object.describedBy['@id']}}\">\n" +
    "  <i class=\"fa fa-bookmark\" data-ng-if=\"isAuth(object.describedBy)\"></i>\n" +
    "  <span class=\"name\">{{ object.title || object.uniformTitle}}</span>\n" +
    "  {{ object.issn }}\n" +
    "</a>\n" +
    "<i data-ng-if=\"!editable.on\" data-ng-click=\"doRemove($index)\" class=\"no\">&times;</i>"
  );


  $templateCache.put('/snippets/render-relation-referenced-entity',
    "<!--\n" +
    "<a href=\"?m={{object.describedBy['@id']}}\">\n" +
    "  <i class=\"fa fa-bookmark\" data-ng-if=\"isAuth(object.describedBy)\"></i>\n" +
    "  <span class=\"name\">{{ object.title }}</span>\n" +
    "  {{ object.issn }}\n" +
    "</a>\n" +
    "<i data-ng-if=\"!editable.on\" data-ng-click=\"doRemove($index)\" class=\"no\">&times;</i>\n" +
    "-->\n" +
    "\n" +
    "<div class=\"entity relation linked\">\n" +
    "  <div class=\"main\">\n" +
    "    <div class=\"title\"><strong>{{ object.title }}</strong></div>\n" +
    "    <div class=\"date\">\n" +
    "      <span title=\"Utgivningsår\" data-ng-repeat=\"publication in object.publication | limitTo:1\" data-ng-show=\"publication.providerDate\">\n" +
    "        {{publication.providerDate}}\n" +
    "      </span>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"notes\">\n" +
    "    <span class=\"lbl\" translate>LABEL.record.about.relation.linkNote</span>\n" +
    "    <input data-inplace class=\"ng-pristine ng-valid\" type=\"text\" ng-model=\"object.linkNote\" />\n" +
    "  </div>\n" +
    "  <a data-ng-if=\"!editable.on\" class=\"delete\" href=\"#\"\n" +
    "     data-ng-click=\"doRemove($index)\"><i class=\"fa fa-times\"></i></a>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/render-role',
    "{{ object.label }} <em>({{ object.notation }})</em>\n" +
    "<a href=\"#\" data-ng-click=\"doRemove($index)\"><i class=\"no\">&times;</i></a>"
  );


  $templateCache.put('/snippets/render-search-box',
    "<div class=\"label find-entity\">\n" +
    "  <div class=\"add-item search\">\n" +
    "    <div data-click-search>\n" +
    "      <span class=\"add-link\" ng-click=\"onclick($event)\"><i class=\"fa fa-plus\"></i> Lägg till {{ label }}</span>\n" +
    "      <span class=\"toggler\">  \n" +
    "        <span class=\"search-field\">\n" +
    "          <i class=\"fa fa-search\"></i>\n" +
    "          <input ng-blur=\"onblur($event)\" class=\"input-large\" type=\"text\" placeholder=\"Sök {{ label }}\"\n" +
    "                data-kitin-search-entity\n" +
    "                data-service-url=\"{{API_PATH}}/auth/_search\"\n" +
    "                data-filter=\"{ \n" +
    "                    'filters' : ['about.@type:Person', 'about.@type:Meeting', 'about.@type:Organization' ] } \"\n" +
    "                data-completion-template-id=\"auth-completion-template\" \n" +
    "                data-allow-non-auth=\"true\"/>\n" +
    "        </span>\n" +
    "        <span class=\"linkchoice\">\n" +
    "          eller <a href=\"#\">Skapa ny</a>\n" +
    "        </span>\n" +
    "      </span>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/render-search-classification',
    ""
  );


  $templateCache.put('/snippets/render-search-country',
    "<i class=\"fa fa-search\"></i>\n" +
    "<input data-inplace class=\"input-large authdependant embedded\" type=\"text\"\n" +
    "        placeholder=\"Lägg till land\"\n" +
    "        data-no-value=\"{{ object.prefLabel }} ({{ object.notation }})\"\n" +
    "        data-kitin-search-entity\n" +
    "        data-service-url=\"{{API_PATH}}/def/_search\"\n" +
    "        data-filter=\"{ filter: 'about.@type:Country'}\"\n" +
    "        data-completion-template-id=\"select-country-template\" placeholder=\"+ Lägg till land\">"
  );


  $templateCache.put('/snippets/render-search-language',
    "<div data-click-search>\n" +
    "  <span class=\"add-link\" ng-click=\"onclick($event)\"><i class=\"fa fa-plus\"></i></span>\n" +
    "  <span class=\"search-field toggler\">\n" +
    "    <i class=\"fa fa-search\"></i>\n" +
    "    <input data-inplace class=\"input-large authdependant embedded\" type=\"text\" ng-blur=\"onblur($event)\"\n" +
    "      data-no-value=\"{{ object.prefLabel }} ({{ object.langCode }})\"\n" +
    "      data-kitin-search-entity\n" +
    "      data-service-url=\"{{API_PATH}}/def/_search\"\n" +
    "      data-filter=\"{ filter: 'about.@type:Language'}\"\n" +
    "      data-completion-template-id=\"select-language-template\" placeholder=\"Sök språk\">\n" +
    "  </span>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/render-search-role',
    "<div data-click-search>\n" +
    "  <span class=\"add-link\" data-ng-click=\"onclick($event)\"><i class=\"fa fa-plus\"></i> Lägg till roll</span>\n" +
    "  <span class=\"search-field toggler\">\n" +
    "    <i class=\"fa fa-search\"></i>\n" +
    "    <input data-inplace type=\"text\" placeholder=\"Sök roller\" ng-blur=\"onblur($event)\"\n" +
    "          data-service-url=\"{{API_PATH}}/relator/_search\"\n" +
    "          data-kitin-search-entity\n" +
    "          data-completion-template-id=\"select-role-template\"\n" +
    "          />\n" +
    "  </span>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/roles',
    "<ul data-kitin-link-entity\n" +
    "    class=\"tags\"\n" +
    "    data-service-url=\"{{API_PATH}}/auth\"\n" +
    "    data-filter=\"{ filter: 'about.@type:ObjectProperty' }\"\n" +
    "    data-subject=\"object\"\n" +
    "    data-link-multiple=\"'_reifiedRoles'\" data-type=\"ObjectProperty\"\n" +
    "    data-view-template=\"/snippets/render-role\"\n" +
    "    data-search-template=\"/snippets/render-search-role\">\n" +
    "</ul>"
  );


  $templateCache.put('/snippets/save-buttons',
    "<button class=\"btn-link\" id=\"draft\" data-ng-click=\"saveDraft()\"\n" +
    "  title=\"{{lastSavedLabel('Senast sparad: %s')}}\">Spara utkast</button>\n" +
    "<button class=\"btn btn-dark btn-submit\" id=\"publish\" data-ng-disabled=\"disableButtons\" data-ng-click=\"save()\"\n" +
    "  title=\"{{lastPublishedLabel('Senast publicerad: %s')}}\">Publicera</button>"
  );


  $templateCache.put('/snippets/search-subject',
    "<i class=\"fa fa-search\"></i> \n" +
    "<input data-kitin-search-entity\n" +
    "      data-filter=\"{{search_filter}}\"\n" +
    "      data-service-url=\"{{API_PATH}}/auth/_search\"\n" +
    "      data-completion-template-id=\"{{search_completion_template}}\" type=\"text\" placeholder=\"\"\n" +
    "      data-allow-non-auth=\"{{scheme.allowNonAuth}}\">"
  );


  $templateCache.put('/snippets/searchfield',
    "<div class=\"nav-back\" ng-show=\"state.search.q\">\n" +
    "  <a data-nav-back><i class=\"fa fa-arrow-circle-left\"></i> Tillbaka till träfflistan</a>\n" +
    "</div>\n" +
    "\n" +
    "<div data-ng-controller=\"SearchFormCtrl\">\n" +
    "  <div class=\"searchfield\">\n" +
    "    <form data-ng-submit=\"state.search.q ? search() : false\" method=\"GET\" name=\"search_form\">\n" +
    "      <input id=\"search\" name=\"q\" type=\"text\" autofocus\n" +
    "             value=\"{{ state.search.q }}\" placeholder=\"{{ state.searchType.placeholder }}\"\n" +
    "      autocomplete=\"off\" role=\"textbox\"\n" +
    "      aria-autocomplete=\"list\" aria-haspopup=\"true\" data-ng-model=\"state.search.q\">\n" +
    "      <div class=\"btn-group dropdown\" data-is-open=\"isopen\">\n" +
    "        <a class=\"btn btn-grey search-source dropdown-toggle\">\n" +
    "          <span class=\"btn-label\">{{ state.searchType.label }}</span>\n" +
    "          <span class=\"fa fa-caret-down\"></span>\n" +
    "        </a>\n" +
    "        <ul class=\"dropdown-menu\">\n" +
    "          <li data-ng-repeat=\"opt in searchTypes\">\n" +
    "            <a data-ng-class=\"{selected: opt.key == state.searchType.key}\"\n" +
    "               data-ng-click=\"setSearchType(opt.key)\">{{ opt.label }}</a>\n" +
    "          </li>\n" +
    "        </ul>\n" +
    "        <button class=\"btn btn-green\" type=\"submit\"><i class=\"fa fa-search\"></i></button>\n" +
    "      </div>\n" +
    "      <div class=\"remote-search\" data-ng-show=\"state.searchType.key == 'remote'\">\n" +
    "        <!-- List seleceted remote databases -->\n" +
    "        <ul class=\"remotesource\">\n" +
    "          <li data-ng-repeat=\"database in state.remoteDatabases | filter:{selected: true} | orderBy:'alternativeName'\"><i class=\"fa fa-check\"> </i>\n" +
    "           {{ database.database }}\n" +
    "            <span class=\"hitcount\" data-ng-show=\"database.hitCount\">({{ database.hitCount }})</span>\n" +
    "            <span data-ng-show=\" ! $last \">,</span>\n" +
    "          </li>\n" +
    "        </ul>\n" +
    "        <div data-ng-controller=\"ModalCtrl\">\n" +
    "          <a href=\"#\" data-ng-click=\"openRemoteModal()\">Fler källor</a>\n" +
    "        </div>            \n" +
    "      </div>\n" +
    "    </form>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/source-comment-template',
    "<div class=\"col12\">\n" +
    "  <h4 data-ng-model=\"record.source\">\n" +
    "    <a href=\"\" ng-click=\"entry.showThis = !entry.showThis\"> \n" +
    "      Källor ({{record.source.length}} st) \n" +
    "      <i class=\"fa fa-caret-right\"></i>\n" +
    "    </a>\n" +
    "  </h4>\n" +
    "  <div class=\"datatable\" data-ng-target=\"source\" data-ng-show=\"entry.showThis\">\n" +
    "    <table>\n" +
    "      <thead>\n" +
    "        <tr>\n" +
    "          <td><span class=\"lbl\">{{ \"Källa\" }}</span></td>\n" +
    "          <td><span class=\"lbl\">{{ \"Källtext\" }}</span></td>\n" +
    "          <td></td>\n" +
    "        </tr>\n" +
    "      </thead>\n" +
    "      <tbody>\n" +
    "        <tr data-ng-repeat=\"source in record.source track by $index\" class=\"\">\n" +
    "          <td>\n" +
    "            <div class=\"label\">\n" +
    "              <input data-inplace type=\"text\" data-ng-model=\"source.label\"/>\n" +
    "            </div>\n" +
    "          </td>\n" +
    "          <td class=\"last\">\n" +
    "            <div class=\"label\">\n" +
    "              <input data-inplace type=\"text\" data-ng-model=\"source.citation\"/>\n" +
    "            </div>\n" +
    "          </td>\n" +
    "          <td class=\"controls\">\n" +
    "            <button class=\"btn-link deleter\" data-ng-click=\"removeObject(record, 'source', $index)\">\n" +
    "              <i class=\"fa fa-times\"></i>\n" +
    "            </button>\n" +
    "          </td>\n" +
    "        </tr>\n" +
    "      </tbody>\n" +
    "      <tfoot>\n" +
    "        <tr>\n" +
    "          <td colspan=\"2\">\n" +
    "            <button class=\"add-thing btn-link\" data-ng-click=\"addObject(record, 'source', 'label', 'citation')\">{{ 'Lägg till källa' }} </button>\n" +
    "          </td>\n" +
    "        </tr>\n" +
    "      </tfoot>\n" +
    "    </table>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/view-subject',
    "<a ng-init=\"subjectLabel = (object.prefLabel || object.uniformTitle || object.controlledLabel  || object.notation || object.name)\" ng-show=\"subjectLabel\" href=\"#\"><i class=\"fa fa-bookmark\" data-ng-if=\"isAuth(object)\"></i> {{ subjectLabel }}</a> \n" +
    "\n" +
    "  \n" +
    "<!-- Broader terms should not be shown for general subjects... used for?\n" +
    "<a data-ng-repeat=\"broader in object.broader\" href=\"#\">\n" +
    "  {{broader.prefLabel}}\n" +
    "  <span data-ng-show=\"broader.notation\">({{ broader.notation }}) </span>\n" +
    "  <span class=\"subject-delimiter\" data-ng-hide=\"$last\">--</span>\n" +
    " </a> \n" +
    "-->\n" +
    "\n" +
    "<i data-ng-click=\"doRemove($index)\" class=\"no\">&times;</i>"
  );
}])