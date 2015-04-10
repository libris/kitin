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
    // Small test record
    var record = {
      about: {
        language: [
          {
            '@type': 'Language',
            prefLabel: 'Testspråk 1'
          }
        ]
      }
    };
    // Small test template
    var template = { 
        about: {
          '@type': ['Text', 'Monograph'],
          language: [ 
            {
              '@type': 'Language',
              prefLabel: 'Testspråk 2'
            }
          ],
          note: 'test note',
          influencedByByType: {
            Person: [],
            Meeting: [],
            Organization: []
          }
        }
    };
    // Do the merge
    var mergedObject = editService.mergeRecordAndTemplate(record, template);

    // Set-up expected result
    var expectedMergedObject = JSON.parse(JSON.stringify(record)); // Make a copy of record
    //expectedMergedObject.about.language.push(template.about.language[0]);
    expectedMergedObject.about.note = template.about.note;
    expectedMergedObject.about['@type'] = template.about['@type'];
    expectedMergedObject.about.influencedByByType = template.about.influencedByByType;

    // test it
    expect(mergedObject).toEqual(expectedMergedObject);
  });

  it("decorate @type in thing", function () {
    var thing = {
      obj: { '@type': 'test' },
      arr: [ { '@type': 'test' } ]
    };
    var skeleton = {
      test: { val1: 1, val2: 2 }
    };
    var result = {
      obj: { '@type': 'test', val1: 1, val2: 2 },
      arr: [ { '@type': 'test', val1: 1, val2: 2 } ]
    };

    editService.expandTypes(thing, skeleton);
    expect(thing).toEqual(result);
  });

  it("decorate holding", function () {
    var holding = readJSON('test/js/mocks/hold_sek_for_7149593.json');
    // What should be a decorated record, for now just a copy of orignial record
    var holdingDecorated = readJSON('test/js/mocks/hold_sek_for_7149593_decorated.json');
    editService.decorate(holding);
    //expect(holding).toEqual(holdingDecorated);
  });

  it("decorate record", function () {
    var record = readJSON('test/js/mocks/bib_7149593.json');
    // What should be a decorated record, for now just a copy of orignial record
    editService.decorate(record);
    //expect(record).toEqual({test: '12', test2: '23'});
  });

});