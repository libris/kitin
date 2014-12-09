angular.module('kitin').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('/snippets/hitlist-compact-auth',
    "<div class=\"hitlist-row auth compact\">\n" +
    "  <div class=\"icon\">\n" +
    "    <i class=\"fa {{utils.getIconByType(record, recType)}}\"></i>\n" +
    "  </div>\n" +
    "  <div class=\"title\">\n" +
    "    <a href=\"/edit/libris{{record['@id']}}\" data-ng-click=\"editPost(recType, record)\">{{ utils.composeTitle(record, recType) | chop:60 }}</a>\n" +
    "  </div>\n" +
    "  <div class=\"about\">\n" +
    "    {{ utils.composeInfo(record, recType) | chop:100 }}\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/hitlist-compact-bib',
    "<div class=\"hitlist-row bib compact\">\n" +
    "  <div class=\"title\">\n" +
    "    <a href=\"/edit/libris{{record['@id']}}\">{{ utils.composeTitle(record) | chop:80}}</a>\n" +
    "  </div>\n" +
    "  <div class=\"creator\">\n" +
    "    {{ utils.composeCreator(record) | chop:40 }}\n" +
    "  </div>\n" +
    "  <div class=\"publication\">\n" +
    "    <span data-ng-repeat=\"publication in record.about.publication | limitTo:1\">\n" +
    "      {{ utils.composeDate(publication.providerDate) }}\n" +
    "    </span>\n" +
    "  </div>\n" +
    "  <div class=\"identifier-code\">\n" +
    "    <span data-ng-repeat=\"identifier in record.about.identifier | limitTo:1\">\n" +
    "      {{ identifier.identifierValue | chop:20 }}\n" +
    "    </span>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/jsonld-object',
    "<div class=\"header\" data-ng-if=\"object[TYPE] || object[ID]\">\n" +
    "  <span class=\"type\" data-ng-if=\"object[TYPE]\"\n" +
    "        data-ng-repeat=\"typekey in ensureArray(object[TYPE])\"\n" +
    "        data-ng-click=\"openTermDef(typekey)\">{{ typekey }} </span>\n" +
    "  <span data-ng-if=\"object[ID]\">\n" +
    "    <a href=\"{{ toJsonLdLink(object[ID]) }}\">&lt;{{ object[ID] }}&gt; </a>\n" +
    "  </span>\n" +
    "</div>\n" +
    "<div data-ng-repeat=\"key in jsonLdKeys(object)\"\n" +
    "     data-ng-init=\"obj = object[key]\"\n" +
    "     data-ng-if=\"key[0] != '@'\">\n" +
    "  <ng:switch on=\"typeOf(obj)\">\n" +
    "    <div data-ng-switch-when=\"object\"\n" +
    "         data-ng-init=\"collapsed = (key == '_marcUncompleted')\"\n" +
    "         data-ng-class=\"{collapsed: collapsed, array: lodash.isArray(obj)}\">\n" +
    "      <div class=\"label entitylink\">\n" +
    "        <span data-ng-click=\"openTermDef(key)\">{{ key }}</span>\n" +
    "        <i data-ng-click=\"collapsed=!collapsed\"> </i>\n" +
    "      </div>\n" +
    "      <section data-ng-init=\"object = obj;\n" +
    "            linked = obj[ID] &amp;&amp; obj[ID].indexOf('_:') != 0 &amp;&amp; key != 'about'\"\n" +
    "          data-ng-include=\"'/snippets/jsonld-object'\"\n" +
    "          data-ng-class=\"{linked: linked}\" class=\"entity\"></section>\n" +
    "    </div>\n" +
    "    <span data-ng-switch-when=\"string\">\n" +
    "      <code data-ng-click=\"openTermDef(key)\">{{ key }}</code>\n" +
    "      <input data-ng-if=\"!linked\" data-ng-model=\"obj\" type=\"text\" />\n" +
    "      <span data-ng-if=\"linked\">{{ obj }}</span>\n" +
    "    </span>\n" +
    "  </ng:switch>\n" +
    "</div>\n"
  );


  $templateCache.put('/snippets/marc-object',
    "<span data-ng-repeat=\"(key, value) in object\" data-ng-init=\"obj = object[key]\">\n" +
    "  <ng:switch on=\"typeOf(obj)\">\n" +
    "    <span data-ng-switch-when=\"object\">\n" +
    "      <code data-ng-if=\"key.length === 3\">{{ key }}</code>\n" +
    "      <span data-ng-init=\"object = obj\" data-ng-include=\"'/snippets/marc-object'\"></span>\n" +
    "    </span>\n" +
    "    <span data-ng-switch-when=\"string\">\n" +
    "        <code class=\"code\" >{{ key }}</code>\n" +
    "        <span>{{ obj }}</span>\n" +
    "    </span>\n" +
    "  </ng:switch>\n" +
    "</span>"
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
    "        data-ng-include=\"'/snippets/new-type-group'\">\n" +
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
    "  <h4 class=\"modal-title\">Auktoritetspost ({{ record.about['@type'] }})</h4>\n" +
    "</div>\n" +
    "<div class=\"modal-body\" data-ng-controller=\"EditBaseCtrl\">    \n" +
    "  <div ng-include=\"'/partials/edit/auth'\"></div>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/modal-edit-bib',
    "<div class=\"modal-header\">\n" +
    " <button type=\"button\" class=\"close\" ng-click=\"close()\" aria-hidden=\"true\">&times;</button>\n" +
    "  <h4 class=\"modal-title\">Bibliotekspost ({{ instance['@type'] }})</h4>\n" +
    "</div>\n" +
    "<div class=\"modal-body\" data-ng-controller=\"EditBaseCtrl\">    \n" +
    "  <div ng-include=\"'/partials/edit/bib'\"></div>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/modal-holdings',
    "<div class=\"modal-header holdings\">\n" +
    "  <button type=\"button\" class=\"close\" ng-click=\"close()\" aria-hidden=\"true\">&times;</button>\n" +
    "  <h4 class=\"modal-title\"><span translate>LABEL.gui.terms.HOLDINGS</span> ({{userData.userSigel}})</h4>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"modal-body holdings\">\n" +
    "  <div data-cg-busy=\"{promise:promises.holding.loading, message:'Laddar bestånd...', minDuration: 800}\"></div>\n" +
    "  <div data-cg-busy=\"{promise:promises.holding.saving, message:'Sparar bestånd...', minDuration: 800}\"></div>\n" +
    "  \n" +
    "  <accordion class=\"other-holdings\" ng-show=\"false\">\n" +
    "    <accordion-group is-open=\"showOtherHoldings\">\n" +
    "      <accordion-heading>\n" +
    "        Visa bestånd för andra bibliotek (beta) <i class=\"pull-right fa\" ng-class=\"{'fa-chevron-down': showOtherHoldings, 'fa-chevron-right': !showOtherHoldings}\"></i>\n" +
    "      </accordion-heading>\n" +
    "      <accordion close-others=\"true\">\n" +
    "        <accordion-group data-ng-repeat=\"otherHolding in otherHoldings\" is-open=\"offer.open\">\n" +
    "          <accordion-heading>\n" +
    "              {{otherHolding.about.heldBy.notation}} <i class=\"pull-right fa\" ng-class=\"{'fa-chevron-down': offer.open, 'fa-chevron-right': !offer.open}\"></i>\n" +
    "          </accordion-heading>\n" +
    "          <div data-ng-repeat=\"offer in otherHolding.about.offers\" class=\"other-offer\">\n" +
    "            <span class=\"offer-value\" data-ng-repeat=\"(property, value) in offer\" data-ng-show=\"property != '@type' && property != 'open'&& property != 'heldBy'\">{{property}}: {{value}}<span data-ng-show=\"!$last\">, </span></span>\n" +
    "          </div>\n" +
    "        </accordion-group>\n" +
    "      </accordion>\n" +
    "    </accordion-group>\n" +
    "  </accordion>\n" +
    "  \n" +
    "  <h4>{{ utils.composeTitle(record) | chop:80}}, {{ utils.composeCreator(record) | chop:40 }} {{ utils.composeDate(publication.providerDate) }}</h4>\n" +
    "\n" +
    "  <form data-ng-show=\"holding['@id'] || !holding['etag']\" name=\"holdingForm\">\n" +
    "    <section class=\"offer form-container\" data-ng-repeat=\"offer in holding.about.offers track by $index\">\n" +
    "      <div class=\"cols\">\n" +
    "          <kitin-group label=\"Lokalsignum\" initially-visible>\n" +
    "            <!-- Fake Sigel drop-down until we decide how to handle multiple sigels for single users -->\n" +
    "            <div class=\"label\">\n" +
    "              <span class=\"lbl\">Sigel</span>\n" +
    "              <span class=\"inp\">\n" +
    "                <div class=\"entity tags\">\n" +
    "                  <span class=\"select\">\n" +
    "                    <select>\n" +
    "                      <option data-ng-selected=\"true\" value=\"{{userSigel}}\" data-ng-bind=\"userSigel\"></option>\n" +
    "                    </select>\n" +
    "                    <i class=\"fa fa-caret-down\"></i>\n" +
    "                  </span>\n" +
    "                </div>\n" +
    "              </span>\n" +
    "            </div>\n" +
    "\n" +
    "            <kitin-textrow label-prefix=\"LABEL.holdings.\" model=\"offer.shelfLocation\" change-model=\"holding\"></kitin-textrow>\n" +
    "            <kitin-textrow label-prefix=\"LABEL.holdings.\" model=\"offer.classificationPart\" change-model=\"holding\"></kitin-textrow>\n" +
    "            <kitin-textrow label-prefix=\"LABEL.holdings.\" model=\"offer.shelfControlNumber\" change-model=\"holding\"></kitin-textrow>\n" +
    "            <kitin-textrow label-prefix=\"LABEL.holdings.\" model=\"offer.shelfLabel\" change-model=\"holding\"></kitin-textrow>\n" +
    "            <kitin-textrow label-prefix=\"LABEL.holdings.\" model=\"offer.availability\" change-model=\"holding\"></kitin-textrow>\n" +
    "            <kitin-textrow label-prefix=\"LABEL.holdings.\" model=\"offer.copyNumber\" change-model=\"holding\"></kitin-textrow>\n" +
    "            <kitin-textrow label-prefix=\"LABEL.holdings.\" model=\"offer.copyNote\" change-model=\"holding\"></kitin-textrow>\n" +
    "            <kitin-textrow label-prefix=\"LABEL.holdings.\" model=\"offer.editorialNote\" change-model=\"holding\"></kitin-textrow>\n" +
    "          </kitin-group>\n" +
    "\n" +
    "        <div class=\"col12\">\n" +
    "          <button class=\"btn btn-link pull-right\" data-ng-if=\"holding.about.offers.length > 1\" data-ng-click=\"deleteOffer(holding, $index)\"><i class=\"fa fa-trash-o\"></i> {{ \"Radera lokalsignum\" }}</button>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </section>\n" +
    "  </form>\n" +
    "\n" +
    "  <hr data-ng-show=\"holding\">\n" +
    "\n" +
    "  <div class=\"alert alert-success\" role=\"alert\" data-ng-show=\"modifications.holding.deleted\">\n" +
    "    {{ \"Beståndet raderat\" }}\n" +
    "  </div>\n" +
    "  \n" +
    "  <div class=\"alert alert-error\" role=\"alert\" data-ng-show=\"holding.about.offers.length < 1\">\n" +
    "    {{ \"Beståndet saknar lokalsignum\" }}\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"modal-alerts\" data-ng-show=\"alerts.length > 0\">\n" +
    "    <alert data-ng-repeat=\"alert in alerts\" type=\"{{alert.type}}\" close=\"closeAlert($index)\">{{alert.msg}}</alert>\n" +
    "  </div>\n" +
    "\n" +
    "  <div>\n" +
    "    <button class=\"btn btn-flat btn-purple-light\" data-ng-click=\"addOffer(holding)\" data-ng-show=\"holding\"><i class=\"fa fa-plus\"></i> {{ \"Lägg till lokalsignum\" }}</button>\n" +
    "  </div>\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"modal-footer holdings submit\">\n" +
    "  <div class=\"status pull-left\">\n" +
    "    <div data-ng-if=\"modifications.holding.saved\">{{ \"Inga osparade ändringar.\" }}</div>\n" +
    "    <div data-ng-if=\"!modifications.holding.saved && !isNew\">{{ \"Du har inte sparat dina ändringar.\" }}</div>\n" +
    "    <div data-ng-if=\"!modifications.holding.saved && isNew\">{{ \"Nyskapat bestånd, inte sparat.\" }}</div>\n" +
    "  </div>\n" +
    "  <button class=\"btn-link\" id=\"delete-hld\" data-ng-click=\"deleteHolding(holding)\" data-ng-show=\"holding['@id']\"><i class=\"fa fa-trash-o\"></i> {{ \"Radera bestånd\" }}</button>\n" +
    "  <button class=\"btn btn-purple btn-submit\" data-ng-click=\"saveHolding(holding)\" data-ng-show=\"holding\" data-ng-disabled=\"modifications.holding.saved\">\n" +
    "    <span data-ng-if=\"!modifications.holding.saved\">{{ \"Spara bestånd\" }}</span>\n" +
    "    <span data-ng-if=\"modifications.holding.saved\">{{ \"Bestånd sparat\" }} <i class=\"fa fa-check\"></i></span>\n" +
    "  </button>\n" +
    "  <button class=\"btn btn-purple btn-submit\" data-ng-click=\"close()\" data-ng-show=\"!holding\">{{ \"Stäng\" }}</button>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/modal-marc',
    "<div class=\"modal-header marc\">\n" +
    "  <button type=\"button\" class=\"close\" ng-click=\"close()\" aria-hidden=\"true\">&times;</button>\n" +
    "  <h4 class=\"modal-title\">MARC förhandsgranskning</h4>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"modal-body marc\">\n" +
    "    <div data-cg-busy=\"{promise:promises.marc, message:'Laddar marcformat...', minDuration: 800}\"></div>\n" +
    "    <section class=\"marc\">\n" +
    "      <table>\n" +
    "        <tr>\n" +
    "          <td data-ng-if=\"record.leader\">\n" +
    "            <code>000</code>\n" +
    "          </td>\n" +
    "          <td></td>\n" +
    "          <td></td>\n" +
    "          <td colspan=\"3\">\n" +
    "            <span>{{record.leader}}</span>\n" +
    "          </td>\n" +
    "        </tr>\n" +
    "        <tr data-ng-repeat=\"field in record.fields\" ng-init=\"pair = lodash.pairs(field)[0]; key = pair[0]; value = pair[1]\">\n" +
    "          <td>\n" +
    "            <code>{{key}}</code>\n" +
    "          </td>\n" +
    "          <td class=\"ind\">\n" +
    "            {{value.ind1}}\n" +
    "          </td>\n" +
    "          <td class=\"ind\">\n" +
    "            {{value.ind2}}\n" +
    "          </td>\n" +
    "          <td>\n" +
    "            <span ng-if=\"typeOf(value) === 'string'\">{{value}}</span>\n" +
    "            <span data-ng-init=\"object = value.subfields\" data-ng-include=\"'/snippets/marc-object'\"></span>\n" +
    "          </td>\n" +
    "        </tr>\n" +
    "      </table>\n" +
    "    </section>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"modal-footer holdings submit\"></div>"
  );


  $templateCache.put('/snippets/modal-release',
    "<div class=\"modal-header\">\n" +
    "  <button type=\"button\" class=\"close\" ng-click=\"close()\" aria-hidden=\"true\">&times;</button>\n" +
    "  <h2 id=\"rlModalLabel\">Release Notes</h2>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "  <h4>2014-10-06</h4>\n" +
    "  <ul>\n" +
    "    <li>Formuläret för editering av bib-poster har tillfälligt blivit lite stökigt.<br>\n" +
    "        Arbete pågår för fullt med att bygga om formuläret, från dem tidigare två spalterna, till tre nya kolumner.<br>\n" +
    "        Rubrik-, inmatnings- och actionkolumn, vilket kommer göra att formuläret blir lättare att följa.<br>\n" +
    "        Ny uppdatering av formuläret kommer inom kort.</li>\n" +
    "    <li>Antalet sökbara poster har begränsats för att förenkla release och tester av klienten.</li>\n" +
    "  </ul>\n" +
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
    "        <a href=\"\" class=\"database-name\"  ng-class=\"{'active':database.selected}\" ng-click=\"database.selected = !database.selected\">\n" +
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


  $templateCache.put('/snippets/modal-vocabview',
    "<div class=\"modal-header\">\n" +
    "  <h2>{{ getLeaf(term[ID]) }}\n" +
    "    (<span>{{ ensureArray(term[TYPE]).join(\", \") }}</span>)</h2>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "  <p>\n" +
    "    {{ term.label }}\n" +
    "    <em data-ng-if=\"term.comment\">&mdash; {{ term.comment }}</em>\n" +
    "  </p>\n" +
    "  <ng:switch on=\"term[TYPE]\">\n" +
    "    <div data-ng-switch-when=\"Class\">\n" +
    "      <dl>\n" +
    "        <dt>Baserad på:</dt>\n" +
    "        <dd>\n" +
    "          <ul>\n" +
    "            <li data-ng-repeat=\"bc in term.get('subClassOf')\"\n" +
    "                data-ng-init=\"lkey = getLeaf(bc[ID])\">\n" +
    "              <a data-ng-click=\"viewTerm(lkey)\">{{ lkey }}</a>\n" +
    "            </li>\n" +
    "          </ul>\n" +
    "        </dd>\n" +
    "        <dt>Egenskaper:</dt>\n" +
    "        <dd>\n" +
    "          <ul>\n" +
    "            <li data-ng-repeat=\"domain in term.subjects('domainIncludes')\"\n" +
    "                data-ng-init=\"lkey = getLeaf(domain[ID])\">\n" +
    "              <a data-ng-click=\"viewTerm(lkey)\">{{ lkey }}</a>\n" +
    "            </li>\n" +
    "          </ul>\n" +
    "        </dd>\n" +
    "        <dt>Pekas till via:</dt>\n" +
    "        <dd>\n" +
    "          <ul>\n" +
    "            <li data-ng-repeat=\"range in term.subjects('rangeIncludes')\"\n" +
    "                data-ng-init=\"lkey = getLeaf(range[ID])\">\n" +
    "              <a data-ng-click=\"viewTerm(lkey)\">{{ lkey }}</a>\n" +
    "            </li>\n" +
    "          </ul>\n" +
    "        </dd>\n" +
    "        <dt>Mer specifika typer:</dt>\n" +
    "        <dd>\n" +
    "          <ul>\n" +
    "            <li data-ng-repeat=\"sc in term.subjects('subClassOf')\"\n" +
    "                data-ng-init=\"lkey = getLeaf(sc[ID])\">\n" +
    "              <a data-ng-click=\"viewTerm(lkey)\">{{ lkey }}</a>\n" +
    "            </li>\n" +
    "          </ul>\n" +
    "        </dd>\n" +
    "      </dl>\n" +
    "    </div>\n" +
    "    <div data-ng-switch-default>\n" +
    "      <dl>\n" +
    "        <dt>Baserad på:</dt>\n" +
    "        <dd>\n" +
    "          <ul>\n" +
    "            <li data-ng-repeat=\"bp in term.get('subPropertyOf')\"\n" +
    "                data-ng-init=\"lkey = getLeaf(bp[ID])\">\n" +
    "              <a data-ng-click=\"viewTerm(lkey)\">{{ lkey }}</a>\n" +
    "            </li>\n" +
    "          </ul>\n" +
    "        </dd>\n" +
    "        <dt>Är egenskap på:</dt>\n" +
    "        <dd>\n" +
    "          <ul>\n" +
    "            <li data-ng-repeat=\"domain in term.get('domainIncludes')\"\n" +
    "                data-ng-init=\"lkey = getLeaf(domain[ID])\">\n" +
    "              <a data-ng-click=\"viewTerm(lkey)\">{{ lkey }}</a>\n" +
    "            </li>\n" +
    "          </ul>\n" +
    "        </dd>\n" +
    "        <dt>Pekar på:</dt>\n" +
    "        <dd>\n" +
    "          <ul>\n" +
    "            <li data-ng-repeat=\"range in term.get('rangeIncludes')\"\n" +
    "                data-ng-init=\"lkey = getLeaf(range[ID])\">\n" +
    "              <a data-ng-click=\"viewTerm(lkey)\">{{ lkey }}</a>\n" +
    "            </li>\n" +
    "          </ul>\n" +
    "        </dd>\n" +
    "      </dl>\n" +
    "    </div>\n" +
    "  </ng:switch>\n" +
    "</div>\n"
  );


  $templateCache.put('/snippets/new-type-group',
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


  $templateCache.put('/snippets/person-name',
    "<strong data-ng-if=\"person.givenName || person.familyName\" class=\"name\">\n" +
    "  {{ person.givenName }} {{ person.familyName }}\n" +
    "</strong>\n" +
    "<strong data-ng-if=\"person.name\" class=\"name\">\n" +
    "  {{ person.name }}\n" +
    "</strong>\n" +
    "<em data-ng-if=\"person.personTitle\">\n" +
    "  (<span ng-repeat=\"personTitle in person.personTitle\">{{ personTitle }} </span>)\n" +
    "</em>\n" +
    "<span data-ng-if=\"person.birthYear || person.deathYear\">\n" +
    "  <span class=\"timeSpan\">{{ person.birthYear }}-{{ person.deathYear }}</span>\n" +
    "</span>"
  );


  $templateCache.put('/snippets/searchfield',
    "\n" +
    "<div data-ng-controller=\"SearchFormCtrl\">\n" +
    "\n" +
    "  <div class=\"nav-back\" data-ng-show=\"state.search.q\">\n" +
    "    <a href=\"\" data-ng-click=\"search(true)\"><i class=\"fa fa-arrow-circle-left\"></i> <span translate>LABEL.gui.search.RETURN_TO_HITLIST</span></a>\n" +
    "  </div>\n" +
    "  \n" +
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
    "          <a href=\"\" data-ng-click=\"openRemoteModal()\">Fler källor</a>\n" +
    "        </div>            \n" +
    "      </div>\n" +
    "    </form>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/source-comment-template',
    "<kitin-group label=\"'Källor (' + record.source.length + ' st)'\">\n" +
    "  <kitin-table \n" +
    "    model=\"record.source\"\n" +
    "    labels=\"['Källa','Källtext']\">\n" +
    "      <kitin-td><kitin-textarea model=\"item.label\"></kitin-textarea></kitin-td>\n" +
    "      <kitin-td><kitin-textarea model=\"item.citation\"></kitin-textarea></kitin-td>\n" +
    "  </kitin-table>\n" +
    "</kitin-group>"
  );


  $templateCache.put('/snippets/view-classification',
    "<a href=\"\">\n" +
    "  <i class=\"fa fa-bookmark\" data-ng-if=\"isAuth(object)\"></i> {{ object.notation }}\n" +
    "</a>"
  );


  $templateCache.put('/snippets/view-country',
    "<a href=\"{{API_PATH + object['@id']}}\" target=\"_blank\">\n" +
    "  {{ object.prefLabel }}\n" +
    "  <span data-ng-show=\"object.notation\">({{ object.notation }})</span>\n" +
    "</a>"
  );


  $templateCache.put('/snippets/view-generic-linked-entity',
    "<!-- \n" +
    "  \n" +
    "  Linked entity used in lists\n" +
    "\n" +
    "-->\n" +
    "\n" +
    "<a href=\"{{API_PATH + object['@id']}}\" target=\"_blank\">\n" +
    "  <i class=\"fa fa-bookmark\" data-ng-if=\"isAuth(object)\"></i>\n" +
    "  {{ (object.prefLabel || object.prefLabel-en || object['@id']) }}\n" +
    "</a>"
  );


  $templateCache.put('/snippets/view-language',
    "\n" +
    "<a ng-if=\"isLinked(object)\" href=\"{{API_PATH + object['@id']}}\" target=\"_blank\">\n" +
    "  <strong>{{ object.prefLabel }}</strong>\n" +
    "  <span data-ng-show=\"object.langCode\">({{ object.langCode }})</span>\n" +
    "</a>\n" +
    "\n" +
    "<span ng-if=\"!isLinked(object)\">\n" +
    "  <span>{{ object.label }}</span>\n" +
    "</span>"
  );


  $templateCache.put('/snippets/view-meeting',
    "<div class=\"meeting main\">\n" +
    "  <div data-ng-if=\"isLinked(object) && !isEmpty(object)\" >\n" +
    "    <span>{{object.name}}</span>\n" +
    "    <a data-ng-if=\"isLinked(object)\" class=\"btn-link auth\" data-ng-controller=\"ModalCtrl\" data-ng-click=\"openAuthModal(object['@id'])\">\n" +
    "      <i class=\"fa fa-bookmark\"></i> Aukt.\n" +
    "    </a>\n" +
    "  </div>\n" +
    "  <div data-ng-if=\"!isLinked(object)\"\n" +
    "        data-ng-init=\"editable = {on: !object.name}\">\n" +
    "    <div data-ng-hide=\"editable.on\">\n" +
    "        <span>{{object.name}}</span> <a class=\"auth\" href=\"\" data-ng-click=\"editable.on = !editable.on\">Ändra</a>\n" +
    "    </div>\n" +
    "    <div data-ng-show=\"editable.on\">\n" +
    "      <div class=\"label\">\n" +
    "        <span class=\"lbl\">{{ \"Namn\" }}</span>\n" +
    "        <kitin-textarea model=\"object.name\"></kitin-textarea>\n" +
    "      </div>\n" +
    "      <kitin-entity label=\"'Plats'\" model=\"object\" link=\"'language'\" type=\"Place\">\n" +
    "        <kitin-search service-url=\"/auth/_search\" \n" +
    "                      template-id=\"subject-completion-template\" \n" +
    "                      filter=\"about.@type:Place\"\n" +
    "                      placeholder=\"Lägg till plats\"\n" +
    "                      allow-non-auth=\"Ny icke auktoriserad plats\">\n" +
    "        </kitin-search>\n" +
    "      </kitin-entity>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/view-organization',
    "<div class=\"orgnization main\">\n" +
    "  <div data-ng-if=\"isLinked(object) && !isEmpty(object)\" >\n" +
    "    <span>{{object.name}}</span>\n" +
    "    <a data-ng-if=\"isLinked(object)\" class=\"btn-link auth\" data-ng-controller=\"ModalCtrl\" data-ng-click=\"openAuthModal(object['@id'])\">\n" +
    "      <i class=\"fa fa-bookmark\"></i> Aukt.\n" +
    "    </a>\n" +
    "  </div>\n" +
    "  <div data-ng-if=\"!isLinked(object)\"\n" +
    "        data-ng-init=\"editable = {on: !(object.controlledLabel || object.givenName || object.name)}\">\n" +
    "    <div data-ng-hide=\"editable.on\">\n" +
    "        <span>{{object.name}}</span> <a class=\"auth\" href=\"\" data-ng-click=\"editable.on = !editable.on\">Ändra</a>\n" +
    "    </div>\n" +
    "    <div data-ng-show=\"editable.on\">\n" +
    "      <div class=\"label\">\n" +
    "        <span class=\"lbl\">{{ \"Namn\" }}</span>\n" +
    "        <input data-track-change class=\"\" type=\"text\" placeholder=\"Namn\"\n" +
    "               data-ng-model=\"object.name\" />\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/view-person',
    "<div class=\"person main\">\n" +
    "  <div data-ng-if=\"isLinked(object) && !isEmpty(object)\" >\n" +
    "    <span onload=\"person = object\" data-ng-include=\"'/snippets/person-name'\"></span>\n" +
    "    <a data-ng-if=\"isLinked(object)\" class=\"btn-link auth\" data-ng-controller=\"ModalCtrl\" data-ng-click=\"openAuthModal(person['@id'])\">\n" +
    "      <i class=\"fa fa-bookmark\"></i> Aukt.\n" +
    "    </a>\n" +
    "  </div>\n" +
    "  <div data-ng-if=\"!isLinked(object)\"\n" +
    "        data-ng-init=\"editable = {on: !(object.controlledLabel || object.givenName || object.name)}\">\n" +
    "    <div data-ng-hide=\"editable.on\">\n" +
    "        <span onload=\"person = object\" data-ng-include=\"'/snippets/person-name'\"></span><a class=\"auth\" href=\"\" data-ng-click=\"editable.on = !editable.on\">Ändra</a>\n" +
    "    </div>\n" +
    "    <div data-ng-show=\"editable.on\">\n" +
    "      <div class=\"label\">\n" +
    "        <span class=\"lbl\">{{ \"Förnamn\" }}</span>\n" +
    "        <input data-track-change class=\"\" type=\"text\" placeholder=\"Förnamn\"\n" +
    "               data-ng-model=\"object.givenName\" />\n" +
    "      </div>\n" +
    "      <div class=\"label\">\n" +
    "        <span class=\"lbl\">{{ \"Släktnamn\" }}</span>\n" +
    "        <input data-track-change class=\"\" type=\"text\" placeholder=\"Släktnamn\"\n" +
    "               data-ng-model=\"object.familyName\" />\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    <div data-ng-show=\"editable.on\">\n" +
    "      <div class=\"label\">\n" +
    "        <span class=\"lbl\">{{ \"Född\" }}</span>\n" +
    "        <input data-track-change class=\"authdependant\" type=\"text\" placeholder=\"ÅÅÅÅ\"\n" +
    "               data-ng-model=\"object.birthYear\" />\n" +
    "\n" +
    "      </div>\n" +
    "      <div class=\"label\">\n" +
    "        <span class=\"lbl\">{{ \"Död\" }}</span>\n" +
    "        <input data-track-change class=\"authdependant\" type=\"text\" placeholder=\"ÅÅÅÅ\" \n" +
    "               data-ng-model=\"object.deathYear\" />\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <kitin-entity multiple hide-title model=\"record.about._reifiedRoles\" type=\"ObjectProperty\" view=\"/snippets/view-role\">\n" +
    "    <kitin-search service-url=\"/relator/_search\" filter=\"about.@type:ObjectProperty\" template-id=\"select-role-template\" placeholder=\"Lägg till roll\"></kitin-search>\n" +
    "  </kitin-entity>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/view-referenced-bib-entity',
    "<div class=\"main\">\n" +
    "  <div class=\"title\">{{ object.title }}</div>\n" +
    "  <div class=\"date\">\n" +
    "    <span title=\"Utgivningsår\" data-ng-repeat=\"publication in object.publication | limitTo:1\" data-ng-show=\"publication.providerDate\">\n" +
    "      {{publication.providerDate}}\n" +
    "    </span>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"notes\">\n" +
    "  <label>\n" +
    "    <em><span translate>LABEL.record.about.relation.linkNote</span>:</em>\n" +
    "    <input data-track-change type=\"text\" ng-model=\"object.linkNote\" />\n" +
    "  </label>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/view-role',
    "{{ object.label }} <em>({{ object.notation }})</em>"
  );


  $templateCache.put('/snippets/view-subject',
    "<a ng-init=\"subjectLabel = (object.prefLabel || object.uniformTitle || object.controlledLabel  || object.notation || object.name)\" ng-show=\"subjectLabel\" href=\"\">\n" +
    "  <i class=\"fa fa-bookmark\" data-ng-if=\"isAuth(object)\"></i> {{ subjectLabel }}</a> \n" +
    "\n" +
    "<!-- Broader terms should not be shown for general subjects... used for?-->\n" +
    "<a data-ng-repeat=\"broader in object.broader\" href=\"\">\n" +
    "  {{broader.prefLabel}}\n" +
    "  <span data-ng-show=\"broader.notation\">({{ broader.notation }}) </span>\n" +
    "  <span class=\"subject-delimiter\" data-ng-hide=\"$last\">--</span>\n" +
    " </a> \n" +
    "\n" +
    "\n" +
    "<i data-ng-click=\"doRemove($index)\" class=\"no\">&times;</i>"
  );
}])