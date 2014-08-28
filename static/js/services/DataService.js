/**
 * dataService
 * Service to handle communcation with backend.
 * Currently used for records and drafts
 */
kitin.factory('dataService', function ($http, $q, editUtil, $rootScope) {

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
            editUtil.decorate(struct).then(function(decoratedRecord) {
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
          editUtil.decorate(struct).then(function(decoratedRecord) {
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
        editUtil.decorate(savedRecord).then(function(decoratedRecord) {
          $http.put($rootScope.LOCAL_API_PATH + '/' + type + "/" + id, editUtil.undecorate(recordDataCopy),
              {
                headers: {"If-match":etag}
              })
            .success(function(savedRecord, status, headers) {
              deferer.resolve({
                recdata: decoratedRecord,
                etag: headers('etag')
              });
          });
        });
        return deferer.promise;
      },

      create: function(type, recordData) {
        var deferer = $q.defer();
        var recordDataCopy = angular.copy(recordData);
        
        $http.post($rootScope.LOCAL_API_PATH, editUtil.undecorate(recordDataCopy))
          .success(function(createdRecord, status, headers) {
            editUtil.decorate(createdRecord).then(function(decoratedRecord) {
              deferer.resolve({
                recdata: decoratedRecord,
                etag: headers('etag')
              });
            });
        });
        return deferer.promise;
      },

      convertToMarc: function(data) {
        var deferer = $q.defer();
        $http.post($rootScope.API_PATH + '/_format?to=application\/x-marc-json', editUtil.undecorate(data)).success(function(data, status, headers) {
          deferer.resolve(data);
        });
        return deferer.promise;
      }
    },

    draft: {
      get: function (draftId) {
        var deferer = $q.defer();
        $http.get("/draft/" + draftId).success(function (data, status, headers) {
          editUtil.decorate(data.document).then(function(decoratedRecord) {
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
        editUtil.decorate(data).then(function(decoratedRecord) {
          $http.put("/draft/" + type + '/' + draftId, editUtil.undecorate(draftDataCopy), {headers: {"If-match":etag } })
            .success(function(data, status, headers) {
              deferer.resolve({
                recdata: decoratedRecord,
                etag: headers('etag')
              });
            });
        });
        return deferer.promise;
      },

      create: function(type, draftData, etag) {
        var deferer = $q.defer();
        etag = etag ? etag : '';
        var draftDataCopy = angular.copy(draftData);
        $http.post("/draft/" + type, editUtil.undecorate(draftDataCopy), {headers: {"If-match":etag } })
          .success(function(data, status, headers) {
            editUtil.decorate(data.document).then(function(decoratedRecord) {
              data.document = decoratedRecord;
              deferer.resolve(data);
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
      get: function() {}
    }
  };
});
