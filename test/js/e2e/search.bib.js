describe('Kitin bib search', function() {
  var kitinSearch = require('./SearchPageObject.js');

  beforeEach(function() {
    
  });

  it('should be able to search correct source', function() {
    kitinSearch.home();
    kitinSearch.doSearch('*', 'bib');
    expect(browser.getCurrentUrl()).toContain('search/bib');
  });

});