/**
 * dataService
 * Service to handle communcation with backend.
 * Currently used for records and drafts
 */
kitin.factory('dataService', function ($http, $q, editUtil, $rootScope) {
  return {

    record: {
      get: function (type, id) {
        var record = $q.defer();
        var path = '/record/template/' + type; // new record
        if(id) {
          path = $rootScope.API_PATH + '/' + type + '/' + id;
        }
        var me = this;
        $http.get(path).success(function (struct, status, headers) {
          record['recdata'] = editUtil.decorate(struct);
          record['etag'] = headers('etag');
          record.resolve(record);
        });
        
        return record.promise;
      },

      save: function(type, id, data, etag) {
        var record = $q.defer();
        $http.put($rootScope.API_PATH + '/' + type + "/" + id, editUtil.undecorate(data),
                  {headers: {"If-match":etag}}).success(function(data, status, headers) {
          record['recdata'] = editUtil.decorate(data);
          record['etag'] = headers('etag');
          record.resolve(record);
        }).error(function() {
          console.log("FAILED to save record");
        });
        return record.promise;
      },

      create: function(type, data) {
        var record = $q.defer();
        $http.post($rootScope.API_PATH, editUtil.undecorate(data)).success(function(data, status, headers) {
          record['recdata'] = editUtil.decorate(data);
          record['etag'] = headers('etag');
          record.resolve(record);
        });
        return record.promise;
      },

      convertToMarc: function(data) {
        var record = $q.defer();
        $http.post($rootScope.API_PATH + '/_format?to=application\/x-marc-json', editUtil.undecorate(data)).success(function(data, status, headers) {
          record.resolve(data);
        });
        return record.promise;
      }
    },

    draft: {
      get: function (draftId) {
        var record = $q.defer();
        $http.get("/draft/" + draftId).success(function (data, status, headers) {
          data.document = editUtil.decorate(data.document);
          record['recdata'] = data;
          record['etag'] = headers('etag');
          record.resolve(record);
        });
        return record.promise;
      },

      save: function(type, draftId, data, etag) {
        var record = $q.defer();
        etag = etag ? etag : '';
        $http.put("/draft/" + type + '/' + draftId, editUtil.undecorate(data), {headers: {"If-match":etag } })
          .success(function(data, status, headers) {
            record['recdata'] = editUtil.decorate(data);
            record['etag'] = headers('etag');
            record.resolve(record);
            console.log("Saved record.");
          })
          .error(function() {
            console.log("FAILED to save record");
          });
        return record.promise;
      },

      create: function(type, data, etag) {
        var record = $q.defer();
        etag = etag ? etag : '';
        $http.post("/draft/" + type, editUtil.undecorate(data), {headers: {"If-match":etag } })
          .success(function(data, status, headers) {
            data.document = editUtil.decorate(data.document); 
            record.resolve(data);
          });
        return record.promise;
      },

      delete: function(type, draftId) {
        var record = $q.defer();
        $http.delete("/draft/" + type + '/' + draftId).success(function(data, status, headers) {
          record.resolve(data);
        });
        return record.promise;
      }
    },

    drafts: {
      get: function() {
        var record = $q.defer();
        $http.get('/drafts').success(function(data, status, headers) {
          record.resolve(data);
        });
        return record.promise;
      }
    },

    holding: {
      get: function() {}
    }
  };
});