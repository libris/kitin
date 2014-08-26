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
        var deferer = $q.defer(), path, handleStruct;

        if (id) {
          // open record
          path = $rootScope.API_PATH + '/' + type + '/' + id;
          handleStruct = editUtil.decorate.bind(editUtil);
        } else {
          // new record
          path = '/record/template/text.monograph';
          handleStruct = function (struct) {
            struct.about['@type'] = [mainType, aggregateLevel];
            return editUtil.decorate(struct);
          };
        }

        $http.get(path).success(function (struct, status, headers) {
          deferer.resolve({
            recdata: handleStruct(struct),
            etag: headers('etag')
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
        $http.put($rootScope.API_PATH + '/' + type + "/" + id, editUtil.undecorate(recordDataCopy),
            {
              headers: {"If-match":etag}
            })
          .success(function(savedRecord, status, headers) {
            deferer.resolve({
              recdata: editUtil.decorate(savedRecord),
              etag: headers('etag')
            });
        });
        return deferer.promise;
      },

      create: function(type, recordData) {
        var deferer = $q.defer();
        var recordDataCopy = angular.copy(recordData);
        $http.post($rootScope.API_PATH, editUtil.undecorate(recordDataCopy))
          .success(function(createdRecord, status, headers) {
            deferer.resolve({
              recdata: editUtil.decorate(createdRecord),
              etag: headers('etag')
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
          data.document = editUtil.decorate(data.document);
          deferer.resolve({
            recdata: data,
            etag: headers('etag')
          });
        });
        return deferer.promise;
      },

      save: function(type, draftId, draftData, etag) {
        var deferer = $q.defer();
        etag = etag ? etag : '';
        var draftDataCopy = angular.copy(draftData);
        $http.put("/draft/" + type + '/' + draftId, editUtil.undecorate(draftDataCopy), {headers: {"If-match":etag } })
          .success(function(data, status, headers) {
            deferer.resolve({
              recdata: editUtil.decorate(data),
              etag: headers('etag')
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
            data.document = editUtil.decorate(data.document);
            deferer.resolve(data);
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
