describe('Kitin holdings modal', function() {
  var kitinSearch = require('./SearchPageObject.js');

  beforeEach(function() {
    
  });

  it('should be able to display holdings modal', function () {

    kitinSearch.home();
    kitinSearch.doSearch('*', 'bib');
    var detailedSwitch = element(by.css('.hitlist-viewswitch .detailed'));
    detailedSwitch.click();
  	var buttonHoldings;

    buttonHoldings = element.all(by.css('.button-holdings')).first();
    buttonHoldings.click();

    var modal = element(by.className('holdings-modal'));
    expect(modal.isPresent()).toBeTruthy();

  });

  it('should be able to add more fields', function () {
    var addOfferButton = element(by.css('.offer .add-bar button'));
    addOfferButton.click();
    addOfferButton.click();
    expect(element.all(by.repeater('offer in holding.about.offers')).count()).toEqual(3);
  });

  it('should be able to remove fields', function () {
    expect(element.all(by.repeater('offer in holding.about.offers')).count()).toEqual(3);
    element.all(by.repeater('offer in holding.about.offers')).then(function(items) {
      var removeOfferButton = items[0].element(by.css('.remove-bar button'));
      removeOfferButton.click();
      removeOfferButton.click();
    });
    expect(element.all(by.repeater('offer in holding.about.offers')).count()).toEqual(1);
  });

  it('should be able to collapse and expand groups', function () {
    expect(element.all(by.css('.offer .group-contents div.label:not(.ng-hide)')).count()).toEqual(3);
    element.all(by.repeater('offer in holding.about.offers')).then(function(items) {
      var expandButton = items[0].element(by.css('.group-title .btn-link'));
      browser.executeScript('$(\'.holdings-modal .modal-body\').scrollTop(0);').then(function() {
          expandButton.click();
      });
      expect(element.all(by.css('.offer .group-contents div.label:not(.ng-hide)')).count()).toEqual(9);
      expandButton.click();
      expect(element.all(by.css('.offer .group-contents div.label:not(.ng-hide)')).count()).toEqual(3);
    });
  });

  it('should provide help texts', function () {
    var helpElement = element.all(by.css('div:not(.ng-hide) .kitin-help')).first();
    var helpButton = helpElement.element(by.css('a'));
    expect(helpElement.isPresent()).toBeTruthy();
    helpButton.click();
    var popover = helpElement.element(by.css('.popover'));
    expect(popover.isPresent()).toBeTruthy();
    helpButton.click();
    expect(popover.isPresent()).toBeFalsy();
  });

  it('should be able to preview post in MARC', function () {
    element(by.id('preview-marc')).click();
    var modal = element(by.className('marc-modal'));
    expect(modal.isPresent()).toBeTruthy();
    element(by.css('.marc-modal button.close')).click();
  });

  it('should put clicked suggestion into textarea', function () {
      browser.executeScript('$(\'.holdings-modal .modal-body\').scrollTop(150);').then(function() {
          var suggestionDiv = element.all(by.css('div.suggestions')).first();
          var suggestionItem = suggestionDiv.element(by.css('.item'));
          var suggestionRow = suggestionDiv.element(by.xpath('..'));
          var suggestionInput = suggestionRow.element(by.tagName('textarea'));
          var suggestionText = suggestionItem.getText();
          suggestionItem.click();
          expect(suggestionInput.getAttribute('value')).toEqual(suggestionText);
      });
  });

  it('should warn if leaving without save', function () {
    element(by.css('.holdings-modal button.close')).click();
    expect(element(by.css('.modal-dialog .dialog-header-confirm')).isPresent()).toBeTruthy();
    element(by.css('.modal-dialog .btn-primary')).click();
  });

  it('should save when clicked on save', function () {
    var feedBackTextPre = element(by.css('div.status div')).getText();
    element(by.id('save-hld')).click();
    var feedBackTextPost = element(by.css('div.status div')).getText();
    expect(feedBackTextPost).not.toEqual(feedBackTextPre);
  });

  it('should warn before deletion', function () {
    element(by.id('delete-hld')).click();
    expect(element(by.css('.modal-dialog .dialog-header-confirm')).isPresent()).toBeTruthy();
  });

  it('should remove when remove dialog is accepted', function () {
    element(by.css('.modal-dialog .btn-default')).click();
    expect(element(by.css('.modal-dialog .dialog-header-confirm')).isPresent()).toBeFalsy();
    var alert = element(by.css('.holdings-modal .alert-success'));
    expect(alert.isPresent()).toBeTruthy();
  });



});