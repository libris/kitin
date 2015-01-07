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
          $rootScope.promises.bib.loading = $http.get(path, { headers: utilsService.noCacheHeaders})
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
        editService.undecorate(recordDataCopy).then(function(undecoratedRecord) {
          $rootScope.promises.bib.saving = $http.put($rootScope.WRITE_API_PATH + '/' + type + '/' + id, undecoratedRecord,
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
        editService.undecorate(data).then(function(undecoratedRecord) {
          $rootScope.promises.marc.loading = $http.post($rootScope.WRITE_API_PATH + '/_format?to=application\/x-marc-json', undecoratedRecord
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
        if(draftId) {
          $rootScope.promises.draft.loading = $http.get("/draft/" + draftId, { headers: utilsService.noCacheHeaders })
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
        editService.undecorate(draftDataCopy).then(function(undecoratedRecord) {
          $rootScope.promises.draft.saving = $http.put("/draft/" + [type, draftId].join('/'), undecoratedRecord, {headers: {"If-match":etag } })
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
        var promise = $http.get($rootScope.API_PATH + searchPath, { headers: utilsService.noCacheHeaders, record: record })
          .success(function(data, status, headers, config) {
            deferer.resolve({ data: data, config: config });
          })
          .error(function(data, status, headers) {
            deferer.reject(status);
          });
        // ... unless we have explicitly requested a quiet lookup
        if (!quiet) $rootScope.promises.holding.loading = promise;
        return deferer.promise;
      },

      find: function(recordId, userData, quiet) {
        var deferer = $q.defer();
        var sigel = userData.userSigel;
        
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
                  editService.decorate(response.holding).then(function(decoratedHolding) {
                    userHoldings = decoratedHolding;
                    if (response.etag) {
                      userHoldings.etag = response.etag;
                    }
                    deferer.resolve({
                      userHoldings: userHoldings,
                      otherHoldings: otherHoldings
                    });
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
        if (holdingId) {
          $http.get($rootScope.API_PATH + holdingId, { headers: utilsService.noCacheHeaders})
            .success(function(data, status, headers) {
              var etag = headers('etag') ? headers('etag') : null;
              editService.decorate(data).then(function(decoratedHolding) {
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
          deferer.resolve(null);
        }
        return deferer.promise;
      },

      create: function(type) {
        var deferer = $q.defer();
        var recordSkeletonTypeMap = definitions.recordSkeletonTypeMap;
        recordSkeletonTypeMap.then(function(skeletonTypeMap) {
          var newHolding = {
            '@type': 'Holding',
            'about': skeletonTypeMap.main.HeldMaterial
          };
          editService.decorate(newHolding).then(function(decoratedHolding) {
            deferer.resolve(decoratedHolding);
          });
        });
        return deferer.promise;
      },

      save: function(holding) {
        var deferer = $q.defer();
        var etag = holding.etag;
        var redecorate = function(data, deferer) {
          editService.decorate(data).then(function(decoratedData) {
            deferer.resolve(decoratedData);
          });
        };
        editService.undecorate(holding).then(function(undecoratedHolding) {
          if (undecoratedHolding['@id'] && etag) {
            delete undecoratedHolding.etag;
            $rootScope.promises.holding.saving = $http.put($rootScope.WRITE_API_PATH + undecoratedHolding['@id'], undecoratedHolding, {headers: {'If-match': etag}})
              .success(function(data, status, headers) {
                if (headers('etag')) {
                  undecoratedHolding.etag = headers('etag');
                }
                redecorate(undecoratedHolding, deferer);
              })
              .error(function(data, status, headers) {
                deferer.reject(status);
              });
          } else {
            // Holding has no ID, assume it's new
            $rootScope.promises.holding.saving = $http.post($rootScope.WRITE_API_PATH + '/hold', undecoratedHolding)
              .success(function(data, status, headers) {
                undecoratedHolding = data;
                if (headers('etag')) {
                  undecoratedHolding.etag = headers('etag');
                }
                redecorate(undecoratedHolding, deferer);
              })
              .error(function(data, status, headers) {
                deferer.reject(status);
              });
          }
        });
        return deferer.promise;
      },

      del: function(holding) {
        var deferer = $q.defer();
        var holdingId = holding['@id'];
        var etag = holding.etag;
        $http['delete']($rootScope.WRITE_API_PATH + holdingId, {headers: {'If-match': etag}})
          .success(function(data, success, headers, also) {
            holding = data;
            deferer.resolve(holding);
          })
          .error(function(data, status, headers) {
            deferer.reject(status);
          });
        return deferer.promise;
      }
    }
  };

  return recordService;
});
