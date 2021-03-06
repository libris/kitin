var KitinSearch = function() {
  
  this.searchField = element(by.model('state.search.q'));
  this.globalMessageClose = element(by.css('#GLOBAL_ALERT button'));
  this.searchButton = element(by.css('.searchfield .btn-green'));
  this.searchDropDown = element(by.css('.searchfield .search-source'));
  this.searchDropDownMenu = element(by.css('.searchfield .dropdown-menu'));

  this.home = function() {
    browser.get('/');
  };

  this.getSearch = function(searchQuery, searchType) {
    searchType = searchType || 'bib';
    browser.get('/search/' + searchType + '?q=' + searchQuery);
  };

  this.doSearch = function(searchQuery, searchType) {
    searchType = searchType || 'bib';
    var typeIndices = {
      'auth': 0,
      'bib': 1,
      'remote': 2
    }

    this.globalMessageClose.click();

    var sField = this.searchField;
    var sButt = this.searchButton;

    sField.sendKeys(searchQuery);
    sButt.click();

    // var ddMenu = this.searchDropDownMenu;
    // var sField = this.searchField;
    // var sButt = this.searchButton;
    // this.searchDropDown.click().then(function() {
    //   ddMenu.all(by.css('li a')).then(function(elements) {
    //     elements[typeIndices[searchType]].click().then(function() {
    //       sField.sendKeys(searchQuery);
    //       sButt.click();
    //     });
    //   });
    // });
  };
};

module.exports = new KitinSearch();