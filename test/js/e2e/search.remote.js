describe('Kitin Remote search', function() {
  var kitinSearch = require('./SearchPageObject.js');

  beforeEach(function() {
    
  });

  it('should be able to search correct source', function() {
    kitinSearch.home();
    kitinSearch.doSearch('sverige', 'remote');
    expect(browser.getCurrentUrl()).toContain('search/remote');
  });

  it('should be able to display detailed hitlist', function () {
  	var detailedSwitch = element(by.css('.hitlist-viewswitch .detailed'));
  	detailedSwitch.click();
  	expect(element.all(by.repeater('record in state.search.result.items')).count()).toEqual(10);

  	element.all(by.repeater('record in state.search.result.items')).then(function(items) {
   		var post = items[0];
   		var details = post.element(by.className('details'));
   		var widget = post.element(by.className('widget'));
   		var row = post.element(by.className('hitlist-row'));
   		expect(details.isPresent()).toBeTruthy();
   		expect(widget.isPresent()).toBeTruthy();
   		expect(row.isPresent()).toBeFalsy();
		});
  });

  it('should be able to display compact hitlist', function () {
  	var compactSwitch = element(by.css('.hitlist-viewswitch .compact'));
  	compactSwitch.click();
  	expect(element.all(by.repeater('record in state.search.result.items')).count()).toEqual(50);

  	element.all(by.repeater('record in state.search.result.items')).then(function(items) {
   		var post = items[0];
   		var details = post.element(by.className('details'));
   		var widget = post.element(by.className('widget'));
   		var row = post.element(by.className('hitlist-row'));
   		expect(row.isPresent()).toBeTruthy();
   		expect(details.isPresent()).toBeFalsy();
   		expect(widget.isPresent()).toBeFalsy();
		});
  });

  it('should be able to display bib view modal with remote settings', function() {
    var detailedSwitch = element(by.css('.hitlist-viewswitch .detailed'));
    detailedSwitch.click();
    var buttonHoldings;
    element.all(by.css('.bib-url')).first().click();
    var modal = element(by.className('bib-modal'));
    expect(modal.isPresent()).toBeTruthy();
    expect(element(by.css('.bib-modal .button-holdings')).isPresent()).toBeFalsy();
    element(by.css('.bib-modal button.close')).click();
  });

});