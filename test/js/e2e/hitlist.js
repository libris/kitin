describe('Kitin hitlist', function() {
  var kitinSearch = require('./SearchPageObject.js');
  kitinSearch.home();
  kitinSearch.doSearch('*', 'bib');

  beforeEach(function() {
    
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

  it('should be able to modify hitlist with facettes', function () {
    var resultTextPre = element(by.css('.crumbs')).getText();
  	element.all(by.repeater('item in facet.items')).then(function(items) {
  		items[0].element(by.css('a')).click();
  	});
    var resultTextPost = element(by.css('.crumbs')).getText();
  	expect(resultTextPost).not.toEqual(resultTextPre);
  });

});