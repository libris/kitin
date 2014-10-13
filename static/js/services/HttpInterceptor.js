  // register the interceptor as a service
  kitin.factory('HttpInterceptor', function($q, $rootScope) {

    return {
      // optional method
      'request': function(config) {
        // do something on success
        $rootScope.loading = true;
        return config;
      },

     //  // optional method
     
     // 2014-10-10: We shouldn't need this, should we?

     // 'requestError': function(rejection) {
     //    $rootScope.addSystemMessage({
     //      msg: 'Fel vid laddning'
     //    });
     //    $rootScope.loading = false;
     //    // do something on error
     //    return $q.reject(rejection);
     //  },



      // optional method
      'response': function(response) {
        // do something on success
        $rootScope.loading = false;
        return response;
      },

      // optional method
     'responseError': function(rejection) {
      console.log(rejection);
        $rootScope.loading = false;
        var method = rejection.config.method;
        var status = rejection.status;
        console.log(status);
        if (method == 'PUT' || method == 'POST') {
          action = 'spara';
        } else if (method == 'DELETE') {
          action = 'ta bort';
        } else {
          action = 'ladda';
        }
        var alert = {
          msg: 'Det gick inte att ' + action + '. '
        };
        
        switch(status) {
          case 0:
            alert.msg += 'Kontakta en administratör.';
            break;
          case 404:
            alert.msg += 'Dokumentet saknas.';
            break;
          case 412:
            alert.msg += 'Någon har redigerat dokumentet sedan du sparade senast.';
            break;
          default:
            alert.msg += 'Kontrollera din internetanslutning.';
        }
        $rootScope.addSystemMessage(alert);
        // do something on error
        return $q.reject(rejection);
      }
    };
  });