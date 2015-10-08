/**
 * recordService
 * Service to handle communcation with backend for records and drafts
 */
kitin.factory('recordService', function ($http, $q, $rootScope, definitions, editService, utilsService) {

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
          // $rootScope.promises is used by angular-busy to show and hide loading/saving indicators
          $rootScope.promises.bib.loading = deferer.promise;
          $http.get(path, { headers: utilsService.noCacheHeaders})
            .success(function (struct, status, headers) {
              editService.decorate(struct).then(function(decoratedRecord) {
                deferer.resolve({
                  recdata: decoratedRecord,
                  etag: headers('etag')
                });
              });
            })
            .error(function(data, status, headers) {
              deferer.reject(status);
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
        $rootScope.promises.bib.saving = deferer.promise;
        editService.undecorate(recordDataCopy).then(function(undecoratedRecord) {
          $http.put($rootScope.WRITE_API_PATH + '/' + type + '/' + id, undecoratedRecord,
              {
                headers: {
                  'If-match': recordEtag,
                  'Authorization': 'Bearer ' +  $rootScope.OAUTH_ACCESS_TOKEN
                }
                
              })
            .success(function(savedRecord, status, headers) {
              editService.decorate(savedRecord).then(function(decoratedRecord) {
                deferer.resolve({
                  recdata: decoratedRecord,
                  etag: headers('etag')
                });
              });
            })
            .error(function(data, status, headers) {
              deferer.reject(status);
            });
        });
        return deferer.promise;
      },

      create: function(type, recordData) {
        var deferer = $q.defer();
        var recordDataCopy = angular.copy(recordData);
        delete recordDataCopy['new'];
        delete recordDataCopy['draft'];
        $rootScope.promises.bib.saving = deferer.promise;
        editService.undecorate(recordDataCopy).then(function(undecoratedRecord) {
          $http.post($rootScope.WRITE_API_PATH + '/' + type, undecoratedRecord)
            .success(function(createdRecord, status, headers) {
              editService.decorate(createdRecord).then(function(decoratedRecord) {
                deferer.resolve({
                  recdata: decoratedRecord,
                  etag: headers('etag')
                });
              });
            })
            .error(function(data, status, headers) {
              deferer.reject(status);
            });
        });
        return deferer.promise;
      },

      convertToMarc: function(data) {
        var deferer = $q.defer();
        $rootScope.promises.marc.loading = deferer.promise;
        editService.undecorate(angular.copy(data)).then(function(undecoratedRecord) {
          $http.post($rootScope.WRITE_API_PATH + '/_format?to=application\/x-marc-json', undecoratedRecord
          /*{ !TODO change to API_PATH and add header when authentication is implemented in whelk
            headers: {
              'Content-Type': 'application/ld+json'
            }
          }*/
          )
            .success(function(data, status, headers) {
              deferer.resolve(data);
            })
            .error(function(data, status, headers) {
              deferer.reject(status);
            });
        });
        return deferer.promise;
      }
    },

    draft: {
      get: function (draftId, mainType, aggregateLevel) {
        var deferer = $q.defer();
        $rootScope.promises.draft.loading = deferer.promise;
        if(draftId) {
          $http.get("/draft/" + draftId, { headers: utilsService.noCacheHeaders })
            .success(function (data, status, headers) {
              editService.decorate(data).then(function(decoratedRecord) {
                deferer.resolve({
                  recdata: data,
                  etag: headers('etag')
                });
              });
            })
            .error(function(data, status, headers) {
              deferer.reject(status);
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
        $rootScope.promises.draft.saving = deferer.promise;
        editService.undecorate(draftDataCopy).then(function(undecoratedRecord) {
          $http.put("/draft/" + [type, draftId].join('/'), undecoratedRecord, {headers: {"If-match":etag } })
            .success(function(data, status, headers) {
              editService.decorate(data).then(function(decoratedRecord) {
                deferer.resolve({
                  recdata: decoratedRecord,
                  etag: headers('etag')
                });
              });
            })
            .error(function(data, status, headers) {
              deferer.reject(status);
            });
        });
        return deferer.promise;
      },

      create: function(type, draftId, draftData, etag) {
        var deferer = $q.defer();
        etag = etag ? etag : '';
        var draftDataCopy = angular.copy(draftData);
        var pathSuffix = type;
        if (draftId) {
          pathSuffix = [type, draftId].join('/');
        }
        $rootScope.promises.draft.saving = deferer.promise;
        editService.undecorate(draftDataCopy).then(function(undecoratedRecord) {
          $http.post("/draft/" + pathSuffix , undecoratedRecord, {headers: {"If-match":etag } })
            .success(function(data, status, headers) {
              editService.decorate(data).then(function(decoratedRecord) {
                deferer.resolve({
                  recdata: decoratedRecord,
                  etag: headers('etag')
                });
              });
            })
            .error(function(data, status, headers) {
              deferer.reject(status);
            });
        });
        return deferer.promise;
      },

      delete: function(type, draftId) {
        var deferer = $q.defer();
        $rootScope.promises.draft.loading = deferer.promise;
        $http.delete("/draft/" + [type, draftId].join('/'))
          .success(function(data, status, headers) {
            deferer.resolve(data);
          })
          .error(function(data, status, headers) {
            deferer.reject(status);
          });
        return deferer.promise;
      }
    },

    drafts: {
      get: function() {
        var deferer = $q.defer();
        $rootScope.promises.draft.loading = deferer.promise;
        $http.get('/drafts', { headers: utilsService.noCacheHeaders })
          .success(function(data, status, headers) {
            deferer.resolve(data);
          })
          .error(function(data, status, headers) {
            deferer.reject(status);
          });
        return deferer.promise;
      }
    },

    holding: {
      search: function(recordId, quiet, record) {
        var deferer = $q.defer();
        var searchPath = '/hold/_search?q=*+about.holdingFor.@id:' + recordId.replace(/\//g, '\\/');
        $http.get($rootScope.API_PATH + searchPath, { headers: utilsService.noCacheHeaders, record: record })
          .success(function(data, status, headers, config) {
            deferer.resolve({ data: data, config: config });
          })
          .error(function(data, status, headers) {
            deferer.reject(status);
          });
        // ... unless we have explicitly requested a quiet lookup
        if (!quiet) $rootScope.promises.holding.loading = deferer.promise;
        return deferer.promise;
      },

      find: function(recordId, userData, quiet) {
        var deferer = $q.defer();
        var sigel = userData.get().sigel;
        
        // $rootScope.promises is used by angular-busy to show and hide loading/saving indicators ...
        recordService.holding.search(recordId, quiet).then(function(response) {
          if (response.data.items.length > 0) {
            var holdings = utilsService.findDeep(response.data.items, 'about.heldBy.notation', sigel);
            var userHoldings = holdings.matches;
            var otherHoldings = holdings.nonmatches;
            if (userHoldings) {
              // utilsService.findDeep returns an array of matches, get the first (and only) item in it.
              userHoldings = userHoldings[0];
              recordService.holding.get(userHoldings['@id']).then(function(response) {
                if (response.holding) {
                  userHoldings = response.holding;
                  if (response.etag) {
                    userHoldings.etag = response.etag;
                  }
                  deferer.resolve({
                    userHoldings: userHoldings,
                    otherHoldings: otherHoldings
                  });                
                } else {
                  deferer.reject({
                    msg: 'Hittade inget bestånd med önskat id.'
                  });
                }
              });
            } else {
              deferer.resolve({
                otherHoldings: otherHoldings
              });  
            }
          } else {
            deferer.resolve(false);
          }
        });
        return deferer.promise;
      },

      get: function(holdingId) {
        var deferer = $q.defer();
        $rootScope.promises.holding.loading = deferer.promise; // Show loading message
        if (holdingId) {
          $http.get($rootScope.API_PATH + holdingId, { headers: utilsService.noCacheHeaders})
            .success(function(holdingData, status, headers) {
              var etag = headers('etag') ? headers('etag') : null;
              editService.decorate(holdingData, []).then(function(decoratedHolding) {
                deferer.resolve({
                  holding: decoratedHolding,
                  etag: etag
                });
              });
            })
            .error(function(data, status, headers) {
              deferer.reject(status);
            });
        } else {
          var recordSkeletonTypeMap = definitions.recordSkeletonTypeMap;
          recordSkeletonTypeMap.then(function(skeletonTypeMap) {
            var newHolding = angular.copy(skeletonTypeMap.main['HoldingsRecord']);
            editService.decorate(newHolding, []).then(function(decoratedHolding) {
              deferer.resolve(decoratedHolding);
            });
          });
        }
        return deferer.promise;
      },

      create: function(holdingData) {
        var deferer = $q.defer();
        var holdingDataCopy = angular.copy(holdingData);
        $rootScope.promises.holding.saving = deferer.promise; // Show saving message
        editService.undecorate(holdingDataCopy).then(function(undecoratedHolding) {
          $http.post($rootScope.WRITE_API_PATH + '/hold', undecoratedHolding)
            .success(function(createdHolding, status, headers) {
              // Log
              if (typeof(_paq) !== 'undefined') _paq.push(['trackEvent', 'Holding', 'Created', createdHolding['@id']]);
              
              editService.decorate(createdHolding, []).then(function(decoratedHolding) {
                decoratedHolding.etag = headers('etag');
                deferer.resolve(decoratedHolding);
              });
            })
            .error(function(data, status, headers) {
              // Log
              var recordId = holdingData && holdingData.about && holdingData.about.holdingFor ? holdingData.about.holdingFor['@id'] : 'Missing holdingFor';
              if (typeof(_paq) !== 'undefined') _paq.push(['trackEvent', 'Holding', 'Failed create' + ' (STATUS '+status+')', recordId]);
              
              deferer.reject(status);
            });
        });
        return deferer.promise;
      },

      save: function(holdingData) {
        var deferer = $q.defer();
        var etag = holdingData.etag;
        var holdingDataCopy = angular.copy(holdingData);
        $rootScope.promises.holding.saving = deferer.promise; // Show saving message
        editService.undecorate(holdingDataCopy).then(function(undecoratedHolding) {
          delete undecoratedHolding.etag;
          $http.put($rootScope.WRITE_API_PATH + undecoratedHolding['@id'], undecoratedHolding, {headers: {'If-match': etag}})
            .success(function(savedHolding, status, headers) {
              // Log
              if (typeof(_paq) !== 'undefined') _paq.push(['trackEvent', 'Holding', 'Saved', savedHolding['@id']]);
              
              editService.decorate(savedHolding).then(function(decoratedHolding) {
                decoratedHolding.etag = headers('etag');
                deferer.resolve(decoratedHolding);
              });
            })
            .error(function(data, status, headers) {
              // Log
              var recordId = holdingData && holdingData.about && holdingData.about.holdingFor ? holdingData.about.holdingFor['@id'] : 'Missing holdingFor';
              if (typeof(_paq) !== 'undefined') _paq.push(['trackEvent', 'Holding', 'Failed save' + ' (STATUS '+status+')', recordId]);
              
              deferer.reject(status);
            });
        });
        return deferer.promise;
      },

      delete: function(holding) {
        var deferer = $q.defer();
        var holdingId = holding['@id'];
        var etag = holding.etag;
        $rootScope.promises.holding.loading = deferer.promise; // Show loading message
        $http['delete']($rootScope.WRITE_API_PATH + holdingId, {headers: {'If-match': etag}})
          .success(function(data, success, headers, also) {
            // Log
            if (typeof(_paq) !== 'undefined') _paq.push(['trackEvent', 'Holding', 'Deleted', holdingId]);
            
            holding = data;
            deferer.resolve(holding);
          })
          .error(function(data, status, headers) {
            // Log
            if (typeof(_paq) !== 'undefined') _paq.push(['trackEvent', 'Holding', 'Failed delete', holdingId]);
            
            deferer.reject(status);
          });
        return deferer.promise;
      }
    }
  };

  return recordService;
});
