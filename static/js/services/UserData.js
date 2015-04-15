/**
 * userData
 */
kitin.factory('userData', function() {
  var username = null,
      activeAuthorization = null, // Active sigel authorization
      authorization = [];  // Users all authorizations
  return {
    
    set: function(user) {
      username = user.username;
      authorization = user.authorization;
      this.setActive(authorization[0].sigel);
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
