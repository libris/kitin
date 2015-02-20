/**
 * userData
 */
kitin.factory('userData', function() {
  return {
    userSigel: null,
    authorization: [],
    setCurrentSigel: function(sigel) {
      this.userSigel = _.first(_.filter(this.authorization, function (auth) {
        return auth.sigel === sigel;
      }));
    }
  };
});
