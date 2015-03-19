describe('Kitin general', function() {
  var kitinSearch = require('./SearchPageObject.js');

  beforeEach(function() {
    kitinSearch.home();    
  });

  it('should be able to show cookies modal', function() {
    element(by.id('cookies-modal-link')).click();
    expect(element(by.css('.cookies-modal')).isPresent()).toBeTruthy();
  });
  it('should be able to show relase notes modal', function() {
    element(by.id('release-modal-link')).click();
    expect(element(by.css('.release-modal')).isPresent()).toBeTruthy();
  });

});