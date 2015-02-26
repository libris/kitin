"use strict";

describe("edit service", function () {
  var editService, recordService, $rootScope, $timeout, $httpBackend, $q;

  beforeEach(module("kitin"));

  beforeEach(inject(function (_$rootScope_, _$timeout_, _editService_, _recordService_) {
    editService = _editService_;
    recordService = _recordService_;
    $rootScope = _$rootScope_;

    $rootScope.promises = {
      bib: {}
    };
    $rootScope.modifications = {
      bib: {},
      auth: {}
    }

  }));

  it("should do something", function () {
    expect(true).toBe(false);
  });

});