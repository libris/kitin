/**
 * userData
 */
kitin.factory('userData', function() {
  var username = null,
      activeAuthorization = {}, // Active sigel authorization
      authorization = [];  // Users all authorizations
  return {
    
    set: function(user) {
      if(user) {
        username = user.username;
        if(user.authorization) {
          authorization = user.authorization;
          this.setActive(authorization[0].sigel);
        }
      }
      return this;
    },
    get: function() {
      var user = angular.copy(activeAuthorization);
      user.username = username;
      return user;
    },
    setActive: function(sigel) {
      activeAuthorization = _.first(_.filter(authorization, function (auth) {
        return auth.sigel === sigel;
      }));
    }
  };
});
