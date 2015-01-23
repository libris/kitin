angular.module('kitin').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('/snippets/display-auth',
    "<li class=\"node auth\" ng-class=\"{{model['@type']}}\" ng-switch=\"model['@type']\">\n" +
    "  <span ng-switch-when=\"Person\">\n" +
    "    <i class=\"fa fa-fw fa-user\"></i>\n" +
    "    {{ model.name }} {{ model.familyName }}{{ model.familyName ? ', ' + model.givenName : model.givenName }}{{ model.birthYear ? ', ' + model.birthYear + '-' : '' }}{{ model.deathYear }}\n" +
    "  </span>\n" +
    "  <span ng-switch-when=\"UniformWork\">\n" +
    "    <i class=\"fa fa-fw fa-book\"></i>\n" +
    "    {{ model.title }}\n" +
    "  </span>\n" +
    "  <span ng-switch-when=\"Concept\">\n" +
    "    <i class=\"fa fa-fw fa-lightbulb-o\"></i>\n" +
    "    {{ model.name }}\n" +
    "  </span>\n" +
    "  <span ng-switch-when=\"Place\">\n" +
    "    <i class=\"fa fa-fw fa-map-marker\"></i>\n" +
    "    {{ model.name }}\n" +
    "  </span>\n" +
    "  <span ng-switch-when=\"Event\">\n" +
    "    <i class=\"fa fa-fw fa-calendar\"></i>\n" +
    "    {{ model.name }}\n" +
    "  </span>\n" +
    "  <span ng-switch-when=\"Meeting\">\n" +
    "    <i class=\"fa fa-fw fa-comment\"></i>\n" +
    "    {{ model.name }}\n" +
    "  </span>\n" +
    "  <span ng-switch-when=\"Organization\">\n" +
    "    <i class=\"fa fa-fw fa-group\"></i>\n" +
    "    {{ model.name }}\n" +
    "  </span>\n" +
    "  <!-- <small>({{ 'LABEL.record.about.subjectByType[\\''+model['@type']+'\\']' | translate }})</small> -->\n" +
    "</li>"
  );


  $templateCache.put('/snippets/hitlist-compact-auth',
    "<div class=\"hitlist-row auth compact\">\n" +
    "  <div class=\"icon\">\n" +
    "    <i class=\"fa {{utils.getIconByType(record, recType)}}\"></i>\n" +
    "  </div>\n" +
    "  <div class=\"title\">\n" +
    "    <a href=\"/edit/libris{{record['@id']}}{{queryString}}\" data-ng-click=\"editPost(recType, record)\">{{ utils.composeTitle(record, recType) | chop:60 }}</a>\n" +
    "  </div>\n" +
    "  <div class=\"about\">\n" +
    "    {{ utils.composeInfo(record, recType) | chop:100 }}\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/hitlist-compact-bib',
    "<div class=\"hitlist-row bib compact\">\n" +
    "  <div class=\"title\">\n" +
    "    <a href=\"/edit/libris{{record['@id']}}{{queryString}}\">{{ utils.composeTitle(record) | chop:80}}</a>\n" +
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


  $templateCache.put('/snippets/hitlist-compact-remote',
    "<div class=\"hitlist-row bib compact\">\n" +
    "  <div class=\"title\">\n" +
    "    <a href=\"#\" data-ng-controller=\"ModalCtrl\" data-ng-click=\"openBibViewModal(record, true)\">{{ utils.composeTitle(record.data) | chop:80}}</a>\n" +
    "  </div>\n" +
    "  <div class=\"creator\">\n" +
    "    {{ utils.composeCreator(record.data) | chop:40 }}\n" +
    "  </div>\n" +
    "  <div class=\"publication\">\n" +
    "    <span data-ng-repeat=\"publication in record.data.about.publication | limitTo:1\">\n" +
    "      {{ utils.composeDate(publication.providerDate) }}\n" +
    "    </span>\n" +
    "  </div>\n" +
    "  <div class=\"identifier-code\">\n" +
    "    <span data-ng-repeat=\"identifier in record.data.about.identifier | limitTo:1\">\n" +
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


  $templateCache.put('/snippets/modal-bibview',
    "<div class=\"modal-header bibview\">\n" +
    "  <button type=\"button\" class=\"close\" ng-click=\"close()\" aria-hidden=\"true\">&times;</button>\n" +
    "  <h1 class=\"modal-title bibview\">Bibliotekspost\n" +
    "    <span data-ng-show=\"!isRemote\">({{ record['@id'] }})</span>\n" +
    "    <span data-ng-show=\"isRemote\">({{ \"Remote\" }})</span>\n" +
    "  </h1>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"modal-body bibview\">\n" +
    "    <span data-ng-if=\"isRemote && remoteDatabase != null\" class=\"database\">\n" +
    "      <i class=\"fa fa-institution\"></i> Källa: {{remoteDatabase}}\n" +
    "    </span>\n" +
    "    <span>{{ record.about.attributedTo.name }} {{ record.about.attributedTo.familyName }}{{ record.about.attributedTo.familyName ? ', ' + record.about.attributedTo.givenName : record.about.attributedTo.givenName }}{{ record.about.attributedTo.birthYear ? ', ' + record.about.attributedTo.birthYear + '-' : '' }}{{ record.about.attributedTo.deathYear }}</span>\n" +
    "    <h2>{{ record.about.instanceTitle.titleValue }} :</h2>\n" +
    "    <h3> {{ record.about.instanceTitle.subtitle }} / {{ utils.composeCreator(record) }}</h3>\n" +
    "    {{ getTypeLabel(record.about) }}\n" +
    "    <span data-ng-repeat=\"contentType in record.about.contentType\">| {{ contentType.prefLabel }} </span>\n" +
    "    <section>\n" +
    "\n" +
    "      <kitin-valuedisplay record=\"record\" ng-if=\"record.about.summary\" label=\"'LABEL.record.about.summary'\"></kitin-valuedisplay>\n" +
    "      <kitin-valuedisplay record=\"record\" ng-if=\"record.about.publication\" label=\"'LABEL.record.about.publication'\"></kitin-valuedisplay>\n" +
    "      <kitin-valuedisplay record=\"record\" ng-if=\"record.about.manufacture\" label=\"'LABEL.record.about.manufacture'\"></kitin-valuedisplay>\n" +
    "      <kitin-valuedisplay record=\"record\" ng-if=\"record.about.frequency\" label=\"'LABEL.record.about.frequency'\"></kitin-valuedisplay>\n" +
    "      <kitin-valuedisplay record=\"record\" ng-if=\"record.about.hasFormat\" label=\"'LABEL.record.about.hasFormat'\"></kitin-valuedisplay>\n" +
    "      <kitin-valuedisplay record=\"record\" ng-if=\"record.about.language && record.about.language[0].langCode !== 'zxx'\" label=\"'LABEL.record.about.language'\"></kitin-valuedisplay>\n" +
    "      <kitin-valuedisplay record=\"record\" ng-if=\"record.about.originalLanguage\" label=\"'LABEL.record.about.originalLanguage'\"></kitin-valuedisplay>\n" +
    "      <kitin-valuedisplay record=\"record\" ng-if=\"record.about.identifier || record.controlNumber\" label=\"'LABEL.record.about.identifierValue'\"></kitin-valuedisplay>\n" +
    "      <kitin-valuedisplay record=\"record\" ng-if=\"record.about.attributedTo\" label=\"'LABEL.record.about.attributedTo'\"></kitin-valuedisplay>\n" +
    "      <kitin-valuedisplay record=\"record\" ng-if=\"record.about.influencedBy\" label=\"'LABEL.record.about.influencedBy'\"></kitin-valuedisplay>\n" +
    "      <kitin-valuedisplay record=\"record\" ng-if=\"record.about.classification\" label=\"'LABEL.record.about.classification'\"></kitin-valuedisplay>\n" +
    "      <kitin-valuedisplay record=\"record\" ng-if=\"record.about.comment\" label=\"'LABEL.record.about.comment'\"></kitin-valuedisplay>\n" +
    "      <kitin-valuedisplay record=\"record\" ng-if=\"record.about.isPartOf\" label=\"'LABEL.record.about.isPartOf'\"></kitin-valuedisplay>\n" +
    "      <kitin-valuedisplay record=\"record\" ng-if=\"record.bibliography\" label=\"'LABEL.record.bibliography.bibliography'\"></kitin-valuedisplay>\n" +
    "      <kitin-valuedisplay record=\"record\" ng-if=\"record.about.subject\" label=\"'LABEL.record.about.subject'\"></kitin-valuedisplay>\n" +
    "      <kitin-valuedisplay record=\"record\" ng-if=\"record.about.alternateFormat\" label=\"'LABEL.record.about.relatedTitles'\"></kitin-valuedisplay>\n" +
    "\n" +
    "\n" +
    "    </section>\n" +
    "</div>\n" +
    "<div class=\"modal-footer submit bibview\">\n" +
    "  <div data-ng-show=\"!isRemote\">\n" +
    "    <button class=\"btn btn-purple btn-hld\" data-ng-if=\"!record.holdings.holding\" data-ng-controller=\"ModalCtrl\" data-ng-click=\"openHoldingsModal($event, record)\">\n" +
    "      <span><i class=\"fa fa-inverse fa-plus\"></i> Bestånd</span>\n" +
    "    </button>\n" +
    "    <button class=\"btn btn-purple-light btn-hld\" data-ng-if=\"record.holdings.holding\" data-ng-controller=\"ModalCtrl\" data-ng-click=\"openHoldingsModal($event, record)\">\n" +
    "      <span><i class=\"fa fa-inverse fa-check\"></i> Bestånd</span>\n" +
    "    </button>\n" +
    "  </div>\n" +
    "  <button class=\"btn btn-green btn-copy-remote\" data-ng-click=\"importRecord(record)\" data-ng-show=\"isRemote\">\n" +
    "    <span><i class=\"fa fa-inverse fa-plus\"></i> {{ \"Kopiera\" }}</span>\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('/snippets/modal-cookies',
    "<div class=\"modal-header\">\n" +
    "  <button type=\"button\" class=\"close\" ng-click=\"close()\" aria-hidden=\"true\">&times;</button>\n" +
    "  <h4 class=\"modal-title cookies\">Information om cookies</h2>\n" +
    "</div>\n" +
    "<div class=\"modal-body cookies\">\n" +
    "  <p>\n" +
    "    LIBRIS katalogisering använder sig av cookies.<br/>\n" +
    "    <br/>\n" +
    "    Cookies är små filer som lagras på besökarens dator för att webbservern ska kunna upprätthålla information om användaren inom en viss tidsperiod.\n" +
    "    LIBRIS katalogisering använder sig av s.k. sessionscookies som sparar information om den inloggade användaren temporärt, så länge som webbläsarsessionen varar.<br/>\n" +
    "    <br/>\n" +
    "    Informationen som lagras ser till att tjänsten vet vilken användare som är inloggad och vilka bibliotek som han/hon katalogiserar för.\n" +
    "    Funktionen \"håll mig inloggad\" sparar en permanent cookie som är aktiv i 31 dagar.<br/>\n" +
    "    <br/>\n" +
    "    Post- och telestyrelsen, som är tillsynsmyndighet på området, lämnar ytterligare information om Cookies på sin webbplats, <a href=\"http://www.pts.se\" target=\"_blank\" title=\"Extern länk till Post- och telestyrelsen\">www.pts.se <i class=\"fa fa-external-link\"></i></a>.\n" +
    "  </p>\n" +
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
    "  <h4 class=\"top\">{{ utils.composeTitle(record) | chop:80}}, {{ utils.composeCreator(record) | chop:40 }} {{ utils.composeDate(publication.providerDate) }}</h4>\n" +
    "\n" +
    "  <accordion class=\"other-holdings\" ng-show=\"otherHoldings.length > 0\">\n" +
    "    <accordion-group is-open=\"showOtherHoldings\">\n" +
    "      <accordion-heading>\n" +
    "        Visa bestånd för andra bibliotek (beta) <i class=\"pull-right fa\" ng-class=\"{'fa-chevron-down': showOtherHoldings, 'fa-chevron-right': !showOtherHoldings}\"></i>\n" +
    "      </accordion-heading>\n" +
    "      <accordion class=\"other-holdings-inner\" close-others=\"true\">\n" +
    "        <accordion-group data-ng-repeat=\"otherHolding in otherHoldings\" is-open=\"offer.open\">\n" +
    "          <accordion-heading>\n" +
    "              {{otherHolding.about.heldBy.notation}} <i class=\"pull-right fa\" ng-class=\"{'fa-chevron-down': offer.open, 'fa-chevron-right': !offer.open}\"></i>\n" +
    "          </accordion-heading>\n" +
    "          <div data-ng-repeat=\"offer in otherHolding.about.offers\" class=\"other-offer\">\n" +
    "            <div class=\"offer-header\">Lokalsignum {{$index + 1}}:</div>\n" +
    "            <span class=\"offer-value\" data-ng-repeat=\"(property, value) in offer\" data-ng-show=\"property != '@type' && property != 'open'\">\n" +
    "              <span class=\"prop\">{{'LABEL.holdings.offer.' + property | translate}}:</span><span class=\"val\"><span>{{property == 'heldBy' ? otherHolding.about.heldBy.notation : value}}</span></span>\n" +
    "            </span>\n" +
    "            <hr ng-show=\"!$last\">\n" +
    "          </div>\n" +
    "        </accordion-group>\n" +
    "      </accordion>\n" +
    "    </accordion-group>\n" +
    "  </accordion>\n" +
    "\n" +
    "  <h4>Ditt bestånd</h4>\n" +
    "\n" +
    "  <form data-ng-show=\"holding['@id'] || !holding['etag']\" name=\"holdingForm\">\n" +
    "    \n" +
    "\n" +
    "    <!-- OFFERS (852) -->\n" +
    "    <section class=\"offer form-container\">\n" +
    "      <div data-ng-repeat=\"offer in holding.about.offers track by $index\">\n" +
    "        <kitin-group label=\"Lokalsignum\">\n" +
    "          <!-- Fake Sigel drop-down until we decide how to handle multiple sigels for single users -->\n" +
    "          <div class=\"label\">\n" +
    "            <span class=\"lbl\">Sigel</span>\n" +
    "            <span class=\"inp\">\n" +
    "              <div class=\"entity tags\">\n" +
    "                <span class=\"select\">\n" +
    "                  <select>\n" +
    "                    <option data-ng-selected=\"true\" value=\"{{userSigel}}\" data-ng-bind=\"userSigel\"></option>\n" +
    "                  </select>\n" +
    "                  <i class=\"fa fa-caret-down\"></i>\n" +
    "                </span>\n" +
    "              </div>\n" +
    "            </span>\n" +
    "          </div>\n" +
    "\n" +
    "          <kitin-table label-prefix=\"LABEL.holdings.\" model=\"offer.shelfLocation\" change-model=\"holding\">\n" +
    "            <kitin-td><kitin-textarea model=\"model[$index]\" change-model=\"holding\"></kitin-textarea></kitin-td>\n" +
    "          </kitin-table>\n" +
    "          <kitin-textrow label-prefix=\"LABEL.holdings.\" model=\"offer.classificationPart\" change-model=\"holding\"></kitin-textrow>\n" +
    "          <kitin-textrow label-prefix=\"LABEL.holdings.\" model=\"offer.shelfControlNumber\" change-model=\"holding\"></kitin-textrow>\n" +
    "          <kitin-textrow label-prefix=\"LABEL.holdings.\" model=\"offer.shelfLabel\" change-model=\"holding\"></kitin-textrow>\n" +
    "          <kitin-textrow label-prefix=\"LABEL.holdings.\" model=\"offer.availability\" change-model=\"holding\"></kitin-textrow>\n" +
    "          <kitin-textrow label-prefix=\"LABEL.holdings.\" model=\"offer.copyNumber\" change-model=\"holding\"></kitin-textrow>\n" +
    "          <kitin-textrow label-prefix=\"LABEL.holdings.\" model=\"offer.copyNote\" change-model=\"holding\"></kitin-textrow>\n" +
    "          <kitin-table label-prefix=\"LABEL.holdings.\" model=\"offer.editorialNote\" change-model=\"holding\">\n" +
    "            <kitin-td><kitin-textarea model=\"model[$index]\" change-model=\"holding\"></kitin-textarea></kitin-td>\n" +
    "          </kitin-table>\n" +
    "\n" +
    "          <div class=\"button-bar right\">\n" +
    "            <button class=\"btn btn-link\" data-ng-if=\"holding.about.offers.length > 1\" data-ng-click=\"deleteOffer(holding, $index)\"><i class=\"fa fa-trash-o\"></i> {{ \"Radera lokalsignum\" }}</button>\n" +
    "          </div>        \n" +
    "        </kitin-group>\n" +
    "      </div>\n" +
    "      <div class=\"button-bar\">\n" +
    "        <button class=\"btn btn-link\" data-ng-click=\"addOffer(holding)\" data-ng-show=\"holding\"><i class=\"fa fa-plus\"></i> {{ \"Lägg till lokalsignum\" }}</button>\n" +
    "      </div>\n" +
    "    </section>\n" +
    "    \n" +
    "    \n" +
    "    <!-- IS PRIMARY TOPIC OF (856) START -->\n" +
    "    <section class=\"form-container\">\n" +
    "      <div data-ng-repeat=\"document in holding.about.isPrimaryTopicOf track by $index\">\n" +
    "        <kitin-group label=\"'Elektronisk adress och åtkomst'\">\n" +
    "          <kitin-textrow model=\"document['@id']\" label.prefix=\"LABEL.\" label=\"document[@'id']\" change-model=\"holding\"></kitin-textrow>\n" +
    "\n" +
    "          <kitin-textrow model=\"document.description\" change-model=\"holding\"></kitin-textrow>\n" +
    "\n" +
    "          <kitin-textrow model=\"document.altLabel\" change-model=\"holding\"></kitin-textrow>\n" +
    "\n" +
    "          <kitin-textrow model=\"document.comment\" change-model=\"holding\"></kitin-textrow>\n" +
    "\n" +
    "          <kitin-table model=\"document.editorialNote\" change-model=\"holding\">\n" +
    "            <kitin-td><kitin-textarea model=\"model[$index]\" change-model=\"holding\"></kitin-textarea></kitin-td>\n" +
    "          </kitin-table>\n" +
    "          \n" +
    "          <div class=\"button-bar right\">\n" +
    "            <button class=\"btn btn-link\" data-ng-if=\"holding.about.isPrimaryTopicOf.length > 1\" data-ng-click=\"deletePrimaryTopicOf(holding, $index)\"><i class=\"fa fa-trash-o\"></i> {{ \"Radera elektronisk adress\" }}</button>\n" +
    "          </div>\n" +
    "        </kitin-group>\n" +
    "      </div>\n" +
    "      <div class=\"button-bar\">\n" +
    "        <button class=\"btn btn-link\" data-ng-click=\"addPrimaryTopicOf(holding)\" data-ng-show=\"holding\"><i class=\"fa fa-plus\"></i> {{ \"Lägg till elektronisk adress \" }}</button>\n" +
    "      </div>\n" +
    "    </section>\n" +
    "    <!-- / IS PRIMARY TOPIC OF END -->\n" +
    "\n" +
    "\n" +
    "    <!-- WORK EXAMPLE BY TYPE (562 - Product) START -->\n" +
    "    <section class=\"form-container\">\n" +
    "      <div data-ng-repeat=\"item in holding.about.workExampleByType.Product track by $index\">\n" +
    "\n" +
    "          <kitin-group label=\"'Identifiering av exemplar, kopia eller version'\">\n" +
    "\n" +
    "            <kitin-table model=\"item.itemCondition\" change-model=\"holding\">\n" +
    "              <kitin-td><kitin-textarea model=\"model[$index]\" change-model=\"holding\"></kitin-textarea></kitin-td>\n" +
    "            </kitin-table>\n" +
    "\n" +
    "            <kitin-table model=\"item.copyIdentification\" change-model=\"holding\">\n" +
    "              <kitin-td><kitin-textarea model=\"model[$index]\" change-model=\"holding\"></kitin-textarea></kitin-td>\n" +
    "            </kitin-table>\n" +
    "\n" +
    "            <kitin-table model=\"item.versionIdentification\" change-model=\"holding\">\n" +
    "              <kitin-td><kitin-textarea model=\"model[$index]\" change-model=\"holding\"></kitin-textarea></kitin-td>\n" +
    "            </kitin-table>\n" +
    "\n" +
    "            <kitin-table model=\"item.presentationFormat\" change-model=\"holding\">\n" +
    "              <kitin-td><kitin-textarea model=\"model[$index]\" change-model=\"holding\"></kitin-textarea></kitin-td>\n" +
    "            </kitin-table>\n" +
    "\n" +
    "            <kitin-table model=\"item.inventoryLevel\" change-model=\"holding\">\n" +
    "              <kitin-td><kitin-textarea model=\"model[$index]\" change-model=\"holding\"></kitin-textarea></kitin-td>\n" +
    "            </kitin-table>\n" +
    "\n" +
    "            <kitin-textrow model=\"item.materialsSpecified\" change-model=\"holding\"></kitin-textrow>\n" +
    "            \n" +
    "            <div class=\"button-bar right\">\n" +
    "              <button class=\"btn btn-link\" data-ng-click=\"deleteWorkExample(holding, 'Product', $index)\"><i class=\"fa fa-trash-o\"></i> {{ \"Radera identifiering\" }}</button>\n" +
    "            </div>\n" +
    "          </kitin-group>\n" +
    "      </div>\n" +
    "      <div class=\"button-bar\">\n" +
    "        <button class=\"btn btn-link\" data-ng-click=\"addWorkExample(holding, 'Product')\" data-ng-show=\"holding\"><i class=\"fa fa-plus\"></i> {{ \"Lägg till identifiering \" }}</button>\n" +
    "      </div>\n" +
    "    </section>\n" +
    "        \n" +
    "    <!-- WORK EXAMPLE BY TYPE (866 - SomeProducts) START -->\n" +
    "    <section class=\"form-container\">\n" +
    "      <div data-ng-repeat=\"item in holding.about.workExampleByType.SomeProducts track by $index\">\n" +
    "          <kitin-group label=\"'Huvudpublikation'\">\n" +
    "            \n" +
    "            <kitin-textrow model=\"item.scopeNote\" change-model=\"holding\" label=\"'Beståndsuppgift'\"></kitin-textrow>\n" +
    "\n" +
    "            <kitin-table model=\"item.editorialNote\" change-model=\"holding\">\n" +
    "              <kitin-td><kitin-textarea model=\"model[$index]\" change-model=\"holding\"></kitin-textarea></kitin-td>\n" +
    "            </kitin-table>\n" +
    "\n" +
    "            <kitin-table model=\"item.copyNote\" change-model=\"holding\">\n" +
    "              <kitin-td><kitin-textarea model=\"model[$index]\" change-model=\"holding\"></kitin-textarea></kitin-td>\n" +
    "            </kitin-table>\n" +
    "\n" +
    "            <div class=\"button-bar right\">\n" +
    "              <button class=\"btn btn-link\" data-ng-click=\"deleteWorkExample(holding, 'SomeProducts', $index)\"><i class=\"fa fa-trash-o\"></i> {{ \"Radera huvudpublikation\" }}</button>\n" +
    "            </div>\n" +
    "          </kitin-group>\n" +
    "      </div>\n" +
    "      <div class=\"button-bar\">\n" +
    "        <button class=\"btn btn-link\" data-ng-click=\"addWorkExample(holding, 'SomeProducts')\" data-ng-show=\"holding\"><i class=\"fa fa-plus\"></i> {{ \"Lägg till huvudpublikation \" }}</button>\n" +
    "      </div>\n" +
    "    </section>\n" +
    "    <!-- WORK EXAMPLE BY TYPE END -->\n" +
    "\n" +
    "\n" +
    "    <!-- ENCODING START \n" +
    "    <section class=\"form-container\">\n" +
    "      <kitin-group label=\"Encoding\">\n" +
    "        <div data-ng-repeat=\"enc in holding.about.encoding track by $index\">\n" +
    "          <kitin-table model=\"enc\" type=\"MediaObject\" change-model=\"holding\">\n" +
    "            <kitin-td>\n" +
    "              <div class=\"label\">\n" +
    "                <kitin-label label=\"'LABEL.holding.about.encoding.id'\"></kitin-label>\n" +
    "                <kitin-textarea model=\"enc['@id']\"></kitin-textarea>\n" +
    "              </div>\n" +
    "\n" +
    "              <div class=\"label\">\n" +
    "                <kitin-label label=\"'LABEL.holding.about.encoding.comment'\"></kitin-label>\n" +
    "                <kitin-textarea model=\"enc.comment\"></kitin-textarea>\n" +
    "              </div>\n" +
    "            </kitin-td>\n" +
    "          </kitin-table>\n" +
    "        </div>\n" +
    "      </kitin-group>\n" +
    "    </section>\n" +
    "    ENCODING END -->\n" +
    "\n" +
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
    "</div>\n" +
    "\n" +
    "<!-- <pre>{{holding}}</pre> -->\n" +
    "<!-- <pre>{{modifications.holding}}</pre> -->\n" +
    "\n" +
    "<div class=\"modal-footer holdings submit\">\n" +
    "  <div class=\"status pull-left\">\n" +
    "    <div data-ng-if=\"modifications.holding.saved\">{{ \"Inga osparade ändringar.\" }}</div>\n" +
    "    <div data-ng-if=\"!modifications.holding.saved && !isNew\">{{ \"Du har inte sparat dina ändringar.\" }}</div>\n" +
    "    <div data-ng-if=\"!modifications.holding.saved && isNew\">{{ \"Nyskapat bestånd, inte sparat.\" }}</div>\n" +
    "  </div>\n" +
    "  <button class=\"btn-link\" id=\"delete-hld\" data-ng-click=\"deleteHolding(holding)\" data-ng-show=\"holding['@id']\">\n" +
    "    <i class=\"fa fa-trash-o\"></i> {{ \"Radera bestånd\" }}\n" +
    "  </button>\n" +
    "  <button class=\"btn btn-purple btn-submit\" id=\"save-hld\" data-ng-click=\"saveHolding(holding)\" data-ng-show=\"holding\" data-ng-disabled=\"modifications.holding.saved\">\n" +
    "    <span data-ng-if=\"!modifications.holding.saved\">{{ \"Spara bestånd\" }}</span>\n" +
    "    <span data-ng-if=\"modifications.holding.saved\">{{ \"Bestånd sparat\" }} <i class=\"fa fa-check\"></i></span>\n" +
    "  </button>\n" +
    "  <button class=\"btn btn-purple btn-submit\" data-ng-click=\"close()\" data-ng-show=\"!holding\">{{ \"Stäng\" }}</button>\n" +
    "\n" +
    "  <div id=\"holdings-message-container\">\n" +
    "    <span class=\"delete-messages\" data-ng-class=\"classes.deleteStatus\">\n" +
    "      <span class=\"kitin-popover-trigger\" kitin-popover=\"Det gick inte att radera beståndet.\" kitin-popover-title=\"Något gick fel\" kitin-popover-placement=\"top\"></span>\n" +
    "    </span>\n" +
    "    <span class=\"save-messages\" data-ng-class=\"classes.saveStatus\">\n" +
    "      <span data-ng-if=\"!modifications.holding.saved\" class=\"kitin-popover-trigger\" kitin-popover=\"Det gick inte att spara beståndet.\" kitin-popover-title=\"Något gick fel\" kitin-popover-placement=\"top\"></span>\n" +
    "      <span data-ng-if=\"modifications.holding.saved\" class=\"kitin-popover-trigger\" kitin-popover=\"Beståndet finns nu registrerat i katalogen.\" kitin-popover-title=\"Beståndet sparades\" kitin-popover-placement=\"top\"></span>\n" +
    "    </span>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/modal-marc',
    "<div class=\"modal-header marc\">\n" +
    "  <button type=\"button\" class=\"close\" ng-click=\"close()\" aria-hidden=\"true\">&times;</button>\n" +
    "  <h4 class=\"modal-title\">MARC förhandsgranskning</h4>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"modal-body marc\">\n" +
    "    <div data-cg-busy=\"{promise:promises.marc.loading, message:'LABEL.gui.busy.LOADING_MARC', minDuration: 800}\"></div>\n" +
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
    "  <h4 class=\"modal-title rlModalLabel\">Release Notes</h4>\n" +
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


  $templateCache.put('/snippets/valuedisplay',
    "<div class=\"valuedisplay\">\n" +
    "  <span ng-switch on=\"label\">\n" +
    "    <kitin-label label=\"label\" ng-click=\"scope.collapse = !scope.collapse\"></kitin-label> <i class=\"fa\" ng-class=\"scope.collapse ? 'fa-fw fa-angle-right' : 'fa-fw fa-angle-down'\"></i>\n" +
    "    <div class=\"value\" ng-hide=\"scope.collapse\">\n" +
    "\n" +
    "      <ul class=\"summary\" ng-switch-when=\"LABEL.record.about.summary\">\n" +
    "        <li class=\"node\" ng-repeat=\"summary in record.about.summary\">\n" +
    "          {{ summary }}\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "\n" +
    "      <ul ng-switch-when=\"LABEL.record.about.publication\">\n" +
    "        <li class=\"node\" ng-repeat=\"publication in record.about.publication\">\n" +
    "          {{ publication.place.label ? publication.place.label + ', ' : '' }}{{ publication.providerName ? publication.providerName + ', ' : '' }}{{ publication.providerDate }}\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "\n" +
    "      <ul ng-switch-when=\"LABEL.record.about.manufacture\">\n" +
    "        <li class=\"node\" ng-repeat=\"manufacture in record.about.manufacture\">\n" +
    "          {{ manufacture.place.label ? manufacture.place.label + ', ' : '' }}{{ manufacture.providerName ? manufacture.providerName + ', ' : '' }}{{ manufacture.providerDate }}\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "\n" +
    "      <ul ng-switch-when=\"LABEL.record.about.frequency\">\n" +
    "        {{ record.about.frequency }}\n" +
    "      </ul>\n" +
    "\n" +
    "\n" +
    "      <ul ng-switch-when=\"LABEL.record.about.language\">\n" +
    "        <li class=\"node lang\" ng-if=\"language.prefLabel || language.langTag\" ng-repeat=\"language in record.about.language | orderBy:'langTag'\">\n" +
    "          <kitin-language-icon model=\"language\"></kitin-language-icon> {{ language.prefLabel }}\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "\n" +
    "      <ul ng-switch-when=\"LABEL.record.about.originalLanguage\">\n" +
    "        <li class=\"node lang\" ng-if=\"language.prefLabel || language.langTag\" ng-repeat=\"language in record.about.originalLanguage | orderBy:'langTag'\">\n" +
    "          <kitin-language-icon model=\"language\"></kitin-language-icon> {{ language.prefLabel }}\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "\n" +
    "      <ul ng-switch-when=\"LABEL.record.about.hasFormat\">\n" +
    "        <li class=\"node\" ng-repeat=\"format in record.about.hasFormat\">\n" +
    "          <span ng-if=\"format['@type']\">{{ 'LABEL.record.about.hasFormatByType[\\''+format['@type']+'\\']' | translate }}</span>\n" +
    "          {{ format.extent ? format.extent + ' : ' : '' }}{{ format.otherPhysicalDetails ? format.otherPhysicalDetails + \" ; \" : '' }}{{ format.dimensions }}\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "  \n" +
    "      <ul ng-switch-when=\"LABEL.record.about.identifierValue\">\n" +
    "        <li class=\"node identifier\" ng-if=\"record.controlNumber\">\n" +
    "          LIBRIS-ID: {{ record.controlNumber }}\n" +
    "        </li>\n" +
    "        <li class=\"node identifier\" ng-show=\"identifier.identifierValue\" ng-repeat=\"identifier in record.about.identifier\">\n" +
    "          {{ 'LABEL.record.about.identifierByIdentifierScheme[\\''+identifier.identifierScheme['@id']+'\\']' | translate }}: {{ identifier.identifierValue }}\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "\n" +
    "      <ul ng-switch-when=\"LABEL.record.bibliography.bibliography\">\n" +
    "        <li class=\"node\" ng-show=\"bibliography.notation\" ng-repeat=\"bibliography in record.bibliography\">\n" +
    "          {{ 'LABEL.record.bibliography.bibliographyByNotation[\\''+bibliography.notation+'\\']' | translate }} <small>({{ bibliography.notation }})</small>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "  \n" +
    "      <ul ng-switch-when=\"LABEL.record.about.attributedTo\">\n" +
    "        <kitin-display-auth model=\"record.about.attributedTo\"></kitin-display-auth>\n" +
    "      </ul>\n" +
    "  \n" +
    "      <ul ng-switch-when=\"LABEL.record.about.influencedBy\">\n" +
    "        <kitin-display-auth model=\"auth\" ng-repeat=\"auth in record.about.influencedBy\"></kitin-display-auth>\n" +
    "      </ul>\n" +
    "  \n" +
    "      <ul ng-switch-when=\"LABEL.record.about.classification\">\n" +
    "        <li class=\"node\" ng-repeat=\"class in record.about.classification\">\n" +
    "          {{ class.notation }} {{ class.notation && class.inScheme.notation ? '|' : '' }} <small>{{ class.inScheme.notation }}</small>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "  \n" +
    "      <ul ng-switch-when=\"LABEL.record.about.comment\">\n" +
    "        <li class=\"node\" ng-repeat=\"comment in record.about.comment\">\n" +
    "          {{ comment }}\n" +
    "        </li>\n" +
    "        <li class=\"node\" ng-repeat=\"annotation in record.about.hasAnnotation\">\n" +
    "          {{ annotation.note }}\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "\n" +
    "  \n" +
    "      <ul ng-switch-when=\"LABEL.record.about.isPartOf\">\n" +
    "        <li class=\"node\" ng-repeat=\"collection in record.about.isPartOf\">\n" +
    "          {{ collection.uniformTitle }}{{ collection.title }}{{ collection.controlledLabel ? ', ' + collection.controlledLabel : '' }}{{ collection.placePublisherAndDateOfPublication ? ', ' + collection.placePublisherAndDateOfPublication : '' }}\n" +
    "          <span ng-show=\"{{ collection.identifier | isArray }}\" ng-repeat=\"identifier in collection.identifier\"> ({{ 'LABEL.record.about.identifierByIdentifierScheme[\\''+identifier.identifierScheme['@id']+'\\']' | translate }} {{ identifier.identifierValue }}) </span>\n" +
    "          <span ng-if=\"collection.identifier\" ng-hide=\"{{ collection.identifier | isArray }}\"> ({{ 'LABEL.record.about.identifierByIdentifierScheme[\\''+collection.identifier.identifierScheme['@id']+'\\']' | translate }} {{ collection.identifier.identifierValue }}) </span>\n" +
    "          <span ng-repeat=\"note in collection.scopeNote\"> ({{ note }}) </span>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "\n" +
    "      <ul ng-switch-when=\"LABEL.record.about.subject\">\n" +
    "        <li class=\"node\" ng-repeat=\"subject in record.about.subject\">\n" +
    "          {{ subject.prefLabel }}\n" +
    "          <span ng-repeat=\"node in subject.broader\">{{ node.prefLabel }} <span ng-if=\"!$last\">-- </span></span>\n" +
    "          <small>{{ subject.inScheme.notation }}</small>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "\n" +
    "      <ul ng-switch-when=\"LABEL.record.about.relatedTitles\">\n" +
    "        <li class=\"node\" ng-repeat=\"format in record.about.alternateFormat\">\n" +
    "          <i>{{ 'LABEL.record.about.alternateFormat' | translate }}:</i>\n" +
    "          <span ng-repeat=\"note in format.linkNote track by $index\">{{ note }}</span>\n" +
    "          {{ format.controlledLabel }}\n" +
    "          {{ format.title }}\n" +
    "          {{ format.placePublisherAndDateOfPublication }}\n" +
    "\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "\n" +
    "  </div>\n" +
    "  </span>\n" +
    "</div>\n"
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
    "    <div class=\"toggler\">\n" +
    "        <button data-ng-hide=\"editable.on\" class=\"btn btn-link\" data-ng-click=\"editable.on = true\"><i class=\"fa fa-edit\"></i> Editera</button>\n" +
    "        <button data-ng-show=\"editable.on\" class=\"btn btn-link\" data-ng-click=\"editable.on = false\"><i class=\"fa fa-check\"></i> Klar</button>\n" +
    "    </div>\n" +
    "    <div class=\"non-editable\">\n" +
    "        <span><strong>{{object.name}}</strong></span> <span class=\"date\">{{object.date}}</span>\n" +
    "    </div>\n" +
    "    <div data-ng-show=\"editable.on\" class=\"editable\">\n" +
    "      <span class=\"arr\"></span>\n" +
    "      <div class=\"label\">\n" +
    "        <span class=\"lbl\">{{ \"Namn\" }}</span>\n" +
    "        <kitin-textarea model=\"object.name\"></kitin-textarea>\n" +
    "      </div>\n" +
    "      <div class=\"label\">\n" +
    "        <span class=\"lbl\">{{ \"Datum\" }}</span>\n" +
    "        <kitin-textarea model=\"object.date\"></kitin-textarea>\n" +
    "      </div>\n" +
    "      <div style=\"clear:both\"></div>\n" +
    "    </div>\n" +
    "    <kitin-entity label=\"'Plats'\" model=\"object\" link=\"'language'\" type=\"Place\">\n" +
    "      <kitin-search service-url=\"/auth/_search\" \n" +
    "                    template-id=\"subject-completion-template\" \n" +
    "                    filter=\"about.@type:Place\"\n" +
    "                    placeholder=\"Lägg till plats\"\n" +
    "                    allow-non-auth=\"Ny icke auktoriserad plats\">\n" +
    "      </kitin-search>\n" +
    "    </kitin-entity>\n" +
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
    "    <div class=\"toggler\">\n" +
    "        <button data-ng-hide=\"editable.on\" class=\"btn btn-link\" data-ng-click=\"editable.on = true\"><i class=\"fa fa-edit\"></i> Editera</button>\n" +
    "        <button data-ng-show=\"editable.on\" class=\"btn btn-link\" data-ng-click=\"editable.on = false\"><i class=\"fa fa-check\"></i> Klar</button>\n" +
    "    </div>\n" +
    "    <div class=\"non-editable\">\n" +
    "      <span><strong>{{object.name}}</strong></span>\n" +
    "    </div>\n" +
    "    <div data-ng-show=\"editable.on\" class=\"editable\">\n" +
    "      <span class=\"arr\"></span>\n" +
    "      <div class=\"label\">\n" +
    "        <span class=\"lbl\">{{ \"Namn\" }}</span>\n" +
    "        <input data-track-change class=\"\" type=\"text\" placeholder=\"Namn\"\n" +
    "               data-ng-model=\"object.name\" />\n" +
    "      </div>\n" +
    "      <div style=\"clear:both\"></div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/view-person',
    "<div class=\"person main\">\n" +
    "  <div data-ng-if=\"isLinked(object) && !isEmpty(object)\" >\n" +
    "    <strong data-ng-if=\"object.givenName || object.familyName\" class=\"name\">\n" +
    "      {{ object.givenName }} {{ object.familyName }}\n" +
    "    </strong>\n" +
    "    <strong data-ng-if=\"object.name\" class=\"name\">\n" +
    "      {{ object.name }}\n" +
    "    </strong>\n" +
    "    <em data-ng-if=\"object.personTitle\">\n" +
    "      (<span ng-repeat=\"personTitle in object.personTitle\">{{ personTitle }} </span>)\n" +
    "    </em>\n" +
    "    <span data-ng-if=\"object.birthYear || object.deathYear\">\n" +
    "      <span class=\"timeSpan\">{{ object.birthYear }}-{{ object.deathYear }}</span>\n" +
    "    </span>\n" +
    "    <a data-ng-if=\"isLinked(object)\" class=\"btn-link auth\" data-ng-controller=\"ModalCtrl\" data-ng-click=\"openAuthModal(person['@id'])\">\n" +
    "      <i class=\"fa fa-bookmark\"></i> Aukt.\n" +
    "    </a>\n" +
    "  </div>\n" +
    "  <div data-ng-if=\"!isLinked(object)\"\n" +
    "        data-ng-init=\"editable = {on: !(object.controlledLabel || object.givenName || object.name)}\">\n" +
    "    <div class=\"toggler\">\n" +
    "        <button data-ng-hide=\"editable.on\" class=\"btn btn-link\" data-ng-click=\"editable.on = true\"><i class=\"fa fa-edit\"></i> Editera</button>\n" +
    "        <button data-ng-show=\"editable.on\" class=\"btn btn-link\" data-ng-click=\"editable.on = false\"><i class=\"fa fa-check\"></i> Klar</button>\n" +
    "    </div>\n" +
    "    <div class=\"non-editable\">\n" +
    "      <strong data-ng-if=\"object.givenName || object.familyName\" class=\"name\">\n" +
    "        {{ object.givenName }} {{ object.familyName }}\n" +
    "      </strong>\n" +
    "      <strong data-ng-if=\"object.name\" class=\"name\">\n" +
    "        {{ object.name }}\n" +
    "      </strong>\n" +
    "      <em data-ng-if=\"object.personTitle\">\n" +
    "        (<span ng-repeat=\"personTitle in object.personTitle\">{{ personTitle }} </span>)\n" +
    "      </em>\n" +
    "      <span data-ng-if=\"object.birthYear || object.deathYear\">\n" +
    "        <span class=\"timeSpan\">{{ object.birthYear }}-{{ object.deathYear }}</span>\n" +
    "      </span>\n" +
    "    </div>\n" +
    "    <div data-ng-show=\"editable.on\" class=\"editable\">\n" +
    "      <span class=\"arr\"></span>\n" +
    "      <div class=\"label\">\n" +
    "        <span class=\"lbl\">{{ \"Förnamn\" }}</span>\n" +
    "        <input data-track-change class=\"\" type=\"text\" placeholder=\"Förnamn\"\n" +
    "               data-ng-model=\"object.givenName\" />\n" +
    "      </div>\n" +
    "      <div class=\"label\">\n" +
    "        <span class=\"lbl\">{{ \"Släktnamn\" }}</span>\n" +
    "        <input data-track-change class=\"\" type=\"text\" placeholder=\"Släktnamn\"\n" +
    "               data-ng-model=\"object.familyName\" />\n" +
    "      </div> \n" +
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
    "      <div style=\"clear:left\"></div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <kitin-entity multiple hide-title model=\"record.about._reifiedRoles\" type=\"ObjectProperty\" view=\"/snippets/view-role\">\n" +
    "    <kitin-search service-url=\"/relator/_search\" filter=\"about.@type:ObjectProperty\" template-id=\"select-role-template\" placeholder=\"Lägg till roll\">\n" +
    "    </kitin-search>\n" +
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


  $templateCache.put('/dialogs/busy',
    "<div class=\"cg-busy-default-wrapper\">\n" +
    "\n" +
    "   <div class=\"cg-busy-default-sign\">\n" +
    "\n" +
    "      <div class=\"cg-busy-default-spinner\">\n" +
    "         <div class=\"bar1\"></div>\n" +
    "         <div class=\"bar2\"></div>\n" +
    "         <div class=\"bar3\"></div>\n" +
    "         <div class=\"bar4\"></div>\n" +
    "         <div class=\"bar5\"></div>\n" +
    "         <div class=\"bar6\"></div>\n" +
    "         <div class=\"bar7\"></div>\n" +
    "         <div class=\"bar8\"></div>\n" +
    "         <div class=\"bar9\"></div>\n" +
    "         <div class=\"bar10\"></div>\n" +
    "         <div class=\"bar11\"></div>\n" +
    "         <div class=\"bar12\"></div>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"cg-busy-default-text\">{{$message | translate}}</div>\n" +
    "\n" +
    "   </div>\n" +
    "\n" +
    "</div>"
  );


  $templateCache.put('/dialogs/confirm',
    "<div class=\"modal-header dialog-header-confirm\" ng-class=\"classes.header\">\n" +
    "  <button type=\"button\" class=\"close\" ng-click=\"no()\">&times;</button>\n" +
    "  <h4 class=\"modal-title\">\n" +
    "    <span ng-class=\"classes.icon\"></span>{{header | translate}}\n" +
    "  </h4>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"modal-body\">{{message | translate}}</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-class=\"classes.yes\" ng-click=\"yes()\">{{yesText || \"LABEL.gui.dialogs.DIALOGS_YES\" | translate}}</button>\n" +
    "  <button type=\"button\" class=\"btn btn-primary\" ng-class=\"classes.no\" ng-click=\"no()\">{{noText || \"LABEL.gui.dialogs.DIALOGS_NO\" | translate}}</button>\n" +
    "</div>  "
  );


  $templateCache.put('/dialogs/popover',
    "<div class=\"popover {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
    "  <div class=\"arrow\"></div>\n" +
    "  <button type=\"button\" class=\"close\" ng-click=\"close()\">\n" +
    "    <span aria-hidden=\"true\"><i class=\"fa fa-times\"></i></span>\n" +
    "  </button>\n" +
    "  <div class=\"popover-inner\">\n" +
    "    <h3 class=\"popover-title\" ng-bind=\"title\" ng-show=\"title\"></h3>\n" +
    "    <div class=\"popover-content\" ng-bind=\"content\"></div>\n" +
    "  </div>\n" +
    "</div>"
  );
}])