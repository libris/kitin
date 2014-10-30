/**
 * recordService
 * Service to handle communcation with backend for records and drafts
 */
kitin.factory('recordService', function ($http, $q, editService, $rootScope, definitions) {

  var recordService = {

    libris: {
      /*  get
      *   Get record from whelk API
      *   If no record id is requested a new record is returned by type
      *   @param    type    {String}    Type of record
      *   @param    id      {String}    Record id (Optional)
      */
      get: function (type, id) {
        var deferer = $q.defer();
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

        return deferer.promise;
      },

      /*  save
      *
      */
      save: function(type, id, recordData, recordEtag) {
        var deferer = $q.defer();
        var recordDataCopy = angular.copy(recordData);
        delete recordDataCopy['new'];
        delete recordDataCopy['draft'];
        editService.undecorate(recordDataCopy).then(function(undecoratedRecord) {
          $http.put($rootScope.WRITE_API_PATH + '/' + type + '/' + id, undecoratedRecord,
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
        delete recordDataCopy['new'];
        delete recordDataCopy['draft'];
        editService.undecorate(recordDataCopy).then(function(undecoratedRecord) {
          $http.post($rootScope.WRITE_API_PATH + '/' + type, undecoratedRecord)
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
          $http.post($rootScope.WRITE_API_PATH + '/_format?to=application\/x-marc-json', undecoratedRecord
          /*{ !TODO change to API_PATH and add header when authentication is implemented in whelk
            headers: {
              'Content-Type': 'application/ld+json'
            }
          }*/
          ).success(function(data, status, headers) {
            deferer.resolve(data);
          });
        });
        return deferer.promise;
      }
    },

    draft: {
      get: function (draftId, mainType, aggregateLevel) {
        var deferer = $q.defer();
        if(draftId) {
          $http.get("/draft/" + draftId).success(function (data, status, headers) {
            editService.decorate(data).then(function(decoratedRecord) {
              deferer.resolve({
                recdata: data,
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
            },
            "new": true
          };
          editService.decorate(struct).then(function(decoratedRecord) {
            deferer.resolve({
              recdata: decoratedRecord
            });
          });
        }

        return deferer.promise;
      },

      save: function(type, draftId, draftData, etag) {
        var deferer = $q.defer();
        etag = etag ? etag : '';
        var draftDataCopy = angular.copy(draftData);
        editService.undecorate(draftDataCopy).then(function(undecoratedRecord) {
          $http.put("/draft/" + [type, draftId].join('/'), undecoratedRecord, {headers: {"If-match":etag } })
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

      create: function(type, draftId, draftData, etag) {
        var deferer = $q.defer();
        etag = etag ? etag : '';
        var draftDataCopy = angular.copy(draftData);
        editService.undecorate(draftDataCopy).then(function(undecoratedRecord) {
          $http.post("/draft/" + [type, draftId].join('/') , undecoratedRecord, {headers: {"If-match":etag } })
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

      delete: function(type, draftId) {
        var deferer = $q.defer();
        $http.delete("/draft/" + [type, draftId].join('/')).success(function(data, status, headers) {
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
        //sigel = 'SLB'; // TODO: <--------------------------------  Haxxor shit, remove
        $rootScope.holdingPromise = $http.get($rootScope.API_PATH + '/hold/_search?q=*+about.holdingFor.@id:' + recordId.replace(/\//g, '\\/') + '+about.offers.heldBy.notation:' + sigel).success(function(data, status, headers) {
          if (data.list.length > 0) {

            var holding = data.list[0];
            recordService.holding.getEtag(holding.data['@id']).then(function(etag) {
              if (etag) {
                holding.etag = etag;
              }
              deferer.resolve(holding);
            });
          } else {
            deferer.resolve(null);
          }
        }).error(function(data, status, headers) {
            deferer.reject(status);
        });
        return deferer.promise;
      },

      create: function(type) {
        var deferer = $q.defer();
        var recordSkeletonTypeMap = definitions.recordSkeletonTypeMap;
        recordSkeletonTypeMap.then(function(skeletonTypeMap) {
          deferer.resolve({
            data: {
              about: skeletonTypeMap.main.HeldMaterial
            }
          });
        });
        return deferer.promise;
      },

      save: function(holding) {
        var deferer = $q.defer();
        var etag = holding.etag;
        if (holding.data['@id'] && etag) {
          $http.put($rootScope.WRITE_API_PATH + holding.data['@id'], holding.data, {headers: {'If-match': etag}}).success(function(data, status, headers) {
            if (headers('etag')) {
              holding.etag = headers('etag');
            }
            deferer.resolve(holding);
          }).error(function(data, status, headers) {
            deferer.reject(status);
          });
        } else {
          // Holding has no ID, assume it's new
          $http.post($rootScope.WRITE_API_PATH + '/hold', holding.data).success(function(data, status, headers) {
            holding.data = data;
            if (headers('etag')) {
              holding.etag = headers('etag');
            }
            deferer.resolve(holding);
          }).error(function(data, status, headers) {
            deferer.reject(status);
          });
        }
        return deferer.promise;
      },

      del: function(holding) {
        var deferer = $q.defer();
        var holdingId = holding.data['@id'];
        var etag = holding.etag;
        $http['delete']($rootScope.WRITE_API_PATH + holdingId, {headers: {'If-match': etag}}).success(function(data, success, headers, also) {

          holding = data;
          deferer.resolve(holding);
        }).error(function(data, status, headers) {

          deferer.reject(status);
        });
        return deferer.promise;
      },

      getEtag: function(holdingId) {
        var deferer = $q.defer();
        if (holdingId) {
          $http.get($rootScope.API_PATH + holdingId).success(function(data, status, headers) {
            var etag = headers('etag') ? headers('etag') : null;
            deferer.resolve(etag);
          }).error(function(data, status, headers) {

          });
        } else {
          deferer.resolve(null);
        }
        return deferer.promise;
      }
    }
  };

  return recordService;
});
