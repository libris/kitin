  // register the interceptor as a service
  kitin.factory('HttpInterceptor', function($q, $rootScope) {
    return {
      // optional method
      'request': function(config) {
        // do something on success
        $rootScope.loading = true;
        return config;
      },

      // optional method
     'requestError': function(rejection) {
        $rootScope.addSystemMessage({
          msg: 'Fel vid laddning'
        });
        $rootScope.loading = false;
        // do something on error
        return $q.reject(rejection);
      },



      // optional method
      'response': function(response) {
        // do something on success
        $rootScope.loading = false;
        return response;
      },

      // optional method
     'responseError': function(rejection) {
        $rootScope.loading = false;
        $rootScope.addSystemMessage({
          type: 'danger',
          msg: 
            'Fel vid laddning:\n' + 
            rejection.status + ', ' + rejection.statusText + '\n' +
            rejection.config.url,
          //timeout: 3000
        });
        // do something on error
        return $q.reject(rejection);
      }
    };
  });