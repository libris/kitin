"use strict";

describe("edit service", function () {
  var editService, recordService, $rootScope, $httpBackend, record_bib_7149593;

  beforeEach(module("kitin"));

  beforeEach(inject(function (_$rootScope_, _editService_, _recordService_) {
    editService = _editService_;
    recordService = _recordService_;
    $rootScope = _$rootScope_;
    $rootScope.promises = {
      bib: {}
    };
    $rootScope.modifications = {
      bib: {},
      auth: {}
    };



  }));


  it("merge two objects", function () {
    var record = readJSON('test/js/mocks/bib_7149593.json');
    var template = { test: { kalle: '67' }, test2: '23'};
    //var mergedObject = editService.mergeRecordAndTemplate(record, template);
    //expect(mergedObject).toEqual();
  });

  it("decorate record", function () {
    var record = readJSON('test/js/mocks/bib_7149593.json');
    editService.decorate(record);
    expect(record).toEqual({test: '12', test2: '23'});
  });

});