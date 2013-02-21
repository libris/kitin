'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('Kitin App', function() {

  describe('Search view', function() {

    beforeEach(function() {
      browser().navigateTo('/search');
    });


    it('should have a search bar', function() {
      expect(element('#search').attr('type')).toEqual("text");
    });
  });
});
