describe('Kitin App', function() {
console.log(browser);
  describe('Search view', function() {
    beforeEach(function() {
      browser.navigateTo('/search');
    });

    it('should have a search bar', function() {
      expect(element('#search').attr('type')).toEqual("text");
    });
  });
});
