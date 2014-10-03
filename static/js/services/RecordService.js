/**
 * recordService
 * Service to handle communcation with backend for records and drafts
 */
kitin.factory('recordService', function ($http, $q, editService, $rootScope) {

  return {

    record: {
      /*  get
      *   Get record from whelk API
      *   If no record id is requested a new record is returned by type
      *   @param    type    {String}    Type of record
      *   @param    id      {String}    Record id (Optional)
      */
      get: function (type, id, mainType, aggregateLevel) {
        var deferer = $q.defer();

        if (id) {
          // open record
          var path = $rootScope.API_PATH + '/' + type + '/' + id;
          $http.get(path).success(function (struct, status, headers) {
            editService.decorate(struct).then(function(decoratedRecord) {
              deferer.resolve({
                recdata: decoratedRecord,
                etag: headers('etag')
              });
            });
          });

        } else {
          // new record
          var struct = {
            "@type": "Record",
            "about": {
              "@type": [mainType, aggregateLevel],
            }
          };
          editService.decorate(struct).then(function(decoratedRecord) {
            deferer.resolve({
              recdata: decoratedRecord
            });
          });
        }

        return deferer.promise;
      },

      /*  save
      *
      */
      save: function(type, id, recordData, recordEtag) {
        var deferer = $q.defer();
        var recordDataCopy = angular.copy(recordData);
        editService.undecorate(recordDataCopy).then(function(undecoratedRecord) {
          $http.put($rootScope.LOCAL_API_PATH + '/' + type + '/' + id, undecoratedRecord,
              {
                headers: {"If-match":recordEtag}
              })
            .success(function(savedRecord, status, headers) {
              editService.decorate(savedRecord).then(function(decoratedRecord) {
                deferer.resolve({
                  recdata: decoratedRecord,
                  etag: headers('etag')
                });
              });
          });
        });
        return deferer.promise;
      },

      create: function(type, recordData) {
        var deferer = $q.defer();
        var recordDataCopy = angular.copy(recordData);
        
        editService.undecorate(recordDataCopy).then(function(undecoratedRecord) {
          $http.post($rootScope.LOCAL_API_PATH + '/' + type, undecoratedRecord)
            .success(function(createdRecord, status, headers) {
              editService.decorate(createdRecord).then(function(decoratedRecord) {
                deferer.resolve({
                  recdata: decoratedRecord,
                  etag: headers('etag')
                });
              });
          });
        });
        return deferer.promise;
      },

      convertToMarc: function(data) {
        var deferer = $q.defer();
        editService.undecorate(data).then(function(undecoratedRecord) {
          $http.post($rootScope.API_PATH + '/_format?to=application\/x-marc-json', undecoratedRecord).success(function(data, status, headers) {
            deferer.resolve(data);
          });
        });
        return deferer.promise;
      }
    },

    draft: {
      get: function (draftId) {
        var deferer = $q.defer();
        $http.get("/draft/" + draftId).success(function (data, status, headers) {
          editService.decorate(data.document).then(function(decoratedRecord) {
            data.document = decoratedRecord;
            deferer.resolve({
              recdata: data,
              etag: headers('etag')
            });
          });
        });
        return deferer.promise;
      },

      save: function(type, draftId, draftData, etag) {
        var deferer = $q.defer();
        etag = etag ? etag : '';
        var draftDataCopy = angular.copy(draftData);
        editService.undecorate(draftDataCopy).then(function(undecoratedRecord) {
          $http.put("/draft/" + type + '/' + draftId, undecoratedRecord, {headers: {"If-match":etag } })
            .success(function(data, status, headers) {
              editService.decorate(data).then(function(decoratedRecord) {

                deferer.resolve({
                  recdata: decoratedRecord,
                  etag: headers('etag')
                });
              });
            });
        });
        return deferer.promise;
      },

      create: function(type, draftData, etag) {
        var deferer = $q.defer();
        etag = etag ? etag : '';
        var draftDataCopy = angular.copy(draftData);
        editService.undecorate(draftDataCopy).then(function(undecoratedRecord) {
          $http.post("/draft/" + type, undecoratedRecord, {headers: {"If-match":etag } })
            .success(function(data, status, headers) {
              editService.decorate(data.document).then(function(decoratedRecord) {
                data.document = decoratedRecord;
                deferer.resolve(data);
              });
            });
        });
        return deferer.promise;
      },

      delete: function(type, draftId) {
        var deferer = $q.defer();
        $http.delete("/draft/" + type + '/' + draftId).success(function(data, status, headers) {
          deferer.resolve(data);
        });
        return deferer.promise;
      }
    },

    drafts: {
      get: function() {
        var deferer = $q.defer();
        $http.get('/drafts').success(function(data, status, headers) {
          deferer.resolve(data);
        });
        return deferer.promise;
      }
    },

    holding: {
      get: function(recordId, userData) {
        var deferer = $q.defer();
        var sigel = userData.userSigel;
        //sigel = 'KVIN'; // TODO: <--------------------------------  Haxxor shit, remove
        $http.get($rootScope.API_PATH + '/hold/_search?q=*+about.holdingFor.@id:' + recordId.replace(/\//g, '\\/') + '+about.offers.heldBy.notation:' + sigel).success(function(data, status, headers) {
          console.log('DATA SHOULD LOOK LIKE THIS:', data.list);
          deferer.resolve({
            data: data,
            etag: headers('etag')
          });
        }).error(function(data, status, headers) {
          console.log('RecordService failed getting holding.');
        });
        return deferer.promise;
      },

      create: function() {
        // Get a holdings skeleton from server
        // Source at <Project root>/examples/templates/holdings.json
        var deferer = $q.defer();
        $http.get('/holding/bib/new').success(function(data, status, headers) {
          console.log(data);
          deferer.resolve({
            data: data,
            etag: headers('etag')
          });
        }).error(function(data, status, headers) {
          console.log('RecordService failed creating holding.');
        });
        return deferer.promise;
      },

      save: function(holding, etag) {
        console.log(holding, etag);
        var deferer = $q.defer();
        if (holding['@id'] && etag) {
          $http.put($rootScope.API_PATH + holding['@id'], holding, {headers: {'Content-Type': 'application/ld+json', 'If-match':etag}}).success(function(data, status, headers) {
            console.log(data, headers());
            deferer.resolve({
              data: data,
              etag: headers('etag')
            });
          }).error(function(data, status, headers) {
            console.log('RecordService failed saving holding.');
          });
        } else {
          // Holding has no ID, assume it's new
          $http.post($rootScope.API_PATH + '/hold', holding, {headers: {'Content-Type': 'application/ld+json'}}).success(function(data, status, headers) {
            console.log('DATA:', data, 'STATUS:', status, 'HEADERS:', headers());
            var identifier = headers('location');
            if (identifier) {
              identifier = '/hold/' + identifier.split('/').slice(-2)[1];
              data['@id'] = identifier;
            }
            deferer.resolve({
              data: data,
              etag: headers('etag')
            });
          }).error(function(data, status, headers) {
            console.log('RecordService failed saving new holding.');
          });
        }
        return deferer.promise;
      },

      getEtag: function(itemId) {
        var deferer = $q.defer();
        //$http.get($rootScope.API_PATH + '/hold/'+ itemId.split('/').slice(-2)[1]).success(function(data, status, headers) {
          $http.get($rootScope.API_PATH + itemId).success(function(data, status, headers) {
            var etag = headers('etag') ? headers('etag') : null;
          deferer.resolve({
            etag: etag
          });
        }).error(function(data, status, headers) {
          console.log('RecordService failed getting eTag for holding.');
        });
        return deferer.promise;
      }
    }
  };
});
