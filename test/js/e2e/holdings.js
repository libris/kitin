describe('Kitin holdings modal', function() {
  var kitinSearch = require('./SearchPageObject.js');
  kitinSearch.home();
  kitinSearch.doSearch('*', 'bib');

  beforeEach(function() {
    
  });

  it('should be able to display holdings modal', function () {

    var detailedSwitch = element(by.css('.hitlist-viewswitch .detailed'));
    detailedSwitch.click();
  	var buttonHoldings = element(by.className('button-holdings'));
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
      removeOfferButton = items[0].element(by.css('.remove-bar button'));
      removeOfferButton.click();
    });
    expect(element.all(by.repeater('offer in holding.about.offers')).count()).toEqual(1);
  });

});