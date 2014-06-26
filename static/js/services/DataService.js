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
      get: function (type, id) {
        var deferer = $q.defer();
        
        var path = '/record/template/' + type; // new record
        if(id) {
          path = $rootScope.API_PATH + '/' + type + '/' + id;
        }

        $http.get(path).success(function (struct, status, headers) {
          deferer.resolve({
            recdata: editUtil.decorate(struct),
            etag: headers('etag')
          });
        });
        
        return deferer.promise;
      },

      /*  save
      *   
      */
      save: function(type, id, recordData, etag) {
        var deferer = $q.defer();

        $http.put($rootScope.API_PATH + '/' + type + "/" + id, editUtil.undecorate(recordData),
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

      create: function(type, data) {
        var deferer = $q.defer();
        $http.post($rootScope.API_PATH, editUtil.undecorate(data)).success(function(createdRecord, status, headers) {
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

      save: function(type, draftId, data, etag) {
        var deferer = $q.defer();
        etag = etag ? etag : '';
        $http.put("/draft/" + type + '/' + draftId, editUtil.undecorate(data), {headers: {"If-match":etag } })
          .success(function(data, status, headers) {
            deferer.resolve({
              recdata: editUtil.decorate(data),
              etag: headers('etag')
            });
          });
        return deferer.promise;
      },

      create: function(type, data, etag) {
        var deferer = $q.defer();
        etag = etag ? etag : '';
        $http.post("/draft/" + type, editUtil.undecorate(data), {headers: {"If-match":etag } })
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