/**
 * recData
 * Service to handle data communication between controllers
 */
kitin.factory('dataTransport', function() {

  var data = {};

  return {
    set: function(what) {
      data = what;
    },
    get: function(key) {
      if ( 'key' in data ) {
        return data[key];
      }
      return data;
    },
    reset: function() {
      data = {};
    }
  };
});