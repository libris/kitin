angular.module('kitin').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('/snippets/auth-completion-template',
    "<div class=\"auth\">\n" +
    "<% if (nameRepr(data) !== \", \") { %>\n" +
    "    <h4>\n" +
    "      <span class=\"name\"><%= nameRepr(data) %></span>\n" +
    "      <span class=\"date\"><%= [data.birthYear, data.deathYear].join('–') %></span>\n" +
    "      <% if (isLinked(data)) { %>\n" +
    "        <span class=\"what\" data-ng-if=\"isAuth(object)\"><i class=\"fa fa-bookmark\"></i> Aukt.</span>\n" +
    "      <% } %>\n" +
    "    </h4>\n" +
    "    <span class=\"title\"><%= data.personTitle %></span>\n" +
    "    <% if (data.hasPersona && data.hasPersona.length) { %>\n" +
    "      <span class=\"persona\">Se även:\n" +
    "        <b><%= data.hasPersona.map(nameRepr).join('</b>, <b>') %></b>\n" +
    "      </span>\n" +
    "    <% } %>\n" +
    "    <% if (data.note && data.note.length) { %>\n" +
    "      <ul class=\"about\">\n" +
    "        <li><%= data.note.map(truncate).join('</li><li>') %></li>\n" +
    "      </ul>\n" +
    "    <% } %>\n" +
    "  <% } else { %>\n" +
    "    <h4>\n" +
    "      Ny icke auktoriserad person\n" +
    "    </h4>\n" +
    "  <% } %>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/bib-completion-template',
    "<div class=\"auth\">\n" +
    "  <h4>\n" +
    "    <span class=\"name\"><%= data.instanceTitle.titleValue %></span>\n" +
    "  </h4>\n" +
    "</div>"
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


  $templateCache.put('/snippets/render-non-auth-tag',
    "<a href=\"#\">\n" +
    "  <i class=\"fa fa-bookmark\" data-ng-if=\"isAuth(object)\"></i>\n" +
    "  {{ object }}\n" +
    "</a>\n" +
    "<i data-ng-if=\"!editable.on\" data-ng-click=\"doRemove($index)\" class=\"no\">&times;</i>"
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
    "  <a data-ng-if=\"!editable.on\" class=\"delete\" href=\"#\"\n" +
    "     data-ng-click=\"doRemove($index)\"><i class=\"fa fa-times\"></i></a>\n" +
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
    "    <div class=\"title\"><strong>{{ object.instanceTitle.titleValue + object.instanceTitle.subtitle }}</strong></div>\n" +
    "    <div class=\"creator\">{{ object.responsibilityStatement }}</div>\n" +
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
    "<div data-link-search>\n" +
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
    "<!-- \n" +
    "  save-buttons\n" +
    "  Publish and save draft buttons\n" +
    "-->\n" +
    "\n" +
    "<button class=\"btn-link\" id=\"draft\" data-ng-click=\"saveDraft()\"\n" +
    "        title=\"{{lastSavedLabel('Senast sparad: %s')}}\">Spara utkast</button>\n" +
    "\n" +
    "<button class=\"btn btn-dark btn-submit\" id=\"publish\" data-ng-disabled=\"disableButtons\" data-ng-click=\"save()\"\n" +
    "  title=\"{{lastPublishedLabel('Senast publicerad: %s')}}\">Publicera</button>\n" +
    "  \n" +
    "<p class=\"message\" data-ng-show=\"modifications.message\">{{ modifications.message }}</p>\n" +
    "<div style=\"clear:both\"></div>"
  );


  $templateCache.put('/snippets/select-language-template',
    "<div class=\"auth\">\n" +
    "  <h4>\n" +
    "  <span class=\"name\"><%= data.prefLabel %></span><span class=\"date\"> <%= data.langCode %></span>\n" +
    "  </h4>\n" +
    "</div>"
  );


  $templateCache.put('/snippets/select-role-template',
    "<div class=\"auth\">\n" +
    "  <h4>\n" +
    "  <span class=\"name\"><%= data.label %></span><span class=\"date\"> <%= data.notation %></span>\n" +
    "  </h4>\n" +
    "</div>"
  );
}])