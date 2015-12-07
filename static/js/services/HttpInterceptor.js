  // // Register the interceptor as a service
  // kitin.factory('HttpInterceptor', function($q, $rootScope) {

  //   return {
  //     'request': function(config) {
  //       $rootScope.loading = true;
  //       var method = config.method;
  //       if (method == 'PUT' || method == 'POST') {
  //         action = 'Sparar.';
  //       } else if (method == 'DELETE') {
  //         action = 'Raderar.';
  //       } else {
  //         action = 'Laddar.';
  //       }
  //       return config;
  //     },

  //     'response': function(response) {
  //       $rootScope.loading = false;
  //       return response;
  //     },
      
  //    'responseError': function(rejection) {
  //     $rootScope.loading = false;
  //       var method = rejection.config.method;
  //       var status = rejection.status;
    
  //       if (method == 'PUT' || method == 'POST') {
  //         action = 'spara';
  //       } else if (method == 'DELETE') {
  //         action = 'ta bort';
  //       } else {
  //         action = 'ladda';
  //       }

  //       var alert = {
  //         msg: 'Det gick inte att ' + action + '. ',
  //         status: status
  //       };
        
  //       switch(status) {
  //         case 0:
  //           alert.msg += 'Kontakta en administratör.';
  //           break;
  //         case 404:
  //           alert.msg += 'Dokumentet saknas.';
  //           break;
  //         case 412:
  //           alert.msg += 'Någon har redigerat dokumentet sedan du sparade senast.';
  //           break;
  //         default:
  //           alert.msg += 'Kontrollera din internetanslutning.';
  //       }
  //       $rootScope.addSystemMessage(alert);

  //       return $q.reject(rejection);
  //     }
  //   };
  // });

kitin.factory('HttpInterceptor', function($q, $rootScope) {
  return {
    request: function(config) {
      $rootScope.loading = true;
      // var method = config.method;
      // if (method == 'PUT' || method == 'POST') {
      //   action = 'Sparar.';
      // } else if (method == 'DELETE') {
      //   action = 'Raderar.';
      // } else {
      //   action = 'Laddar.';
      // }
      return config;
    },
    response: function(response) {
      $rootScope.loading = false;
      return response;
    },
    responseError: function(rejection) {
      $rootScope.loading = false;
        var method = rejection.config.method;
        var status = rejection.status;
    
        if (method == 'PUT' || method == 'POST') {
          action = 'spara';
        } else if (method == 'DELETE') {
          action = 'ta bort';
        } else {
          action = 'ladda';
        }

        var errorObj = {
          msg: 'Det gick inte att ' + action + '. ',
          status: status,
          statusText: rejection.statusText,
          method: method,
          url: rejection.config.url
        };
        
        switch(status) {
          case 0:
            errorObj.msg += 'Kontakta LIBRIS kundtjänst.';
            break;
          case 404:
            errorObj.msg += 'Dokumentet saknas.';
            break;
          case 412:
            errorObj.msg += 'Någon har redigerat dokumentet sedan du sparade senast.';
            break;
          default:
            errorObj.msg += 'Kontrollera din internetanslutning.';
            break;
        }
        
        if (typeof errorObj.status === 'undefined' || errorObj.status === null || errorObj.status < 0) {
          errorObj.statusText = 'Unknown';
        }
        
        if (errorObj.status === 0) {
          errorObj.statusText = 'Timeout';
        }
        
        // Log
        if (typeof _paq !== 'undefined') {
          _paq.push(['trackEvent', 'System error', errorObj.status + ' ' + errorObj.statusText, errorObj.method + ' ' + errorObj.url]);
        }
        
        $rootScope.addSystemMessage(errorObj);

        return $q.reject(rejection);
      }
  };
});
