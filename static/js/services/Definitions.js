/**
 * definitions
 * Get definitions lists from backend
 */
kitin.factory('definitions', function($http, $rootScope) {
  
  /**
  * getDataset
  * @param    url       {Servicetring}    URL to dataset
  * @return   promise   {Object}          Angular JS promise, $q
  */
  function getDataset(url) {
    return {
      then: function (f) {
        $http.get(encodeURI(url), {cache: true}).then(function(response) {
          f(response.data);
        });
      }
    };
  }

  // Defined definitions
  var definitions = {
    remotedatabases:  getDataset($rootScope.API_PATH + "/_remotesearch?databases=list"),
    terms:            getDataset($rootScope.API_PATH + "/def/terms"),
  // !TODO Remove definitions below when the "index expander" is implemented in backend
    relators:         getDataset($rootScope.API_PATH + "/def/_search?q=*+about.@type:ObjectProperty&n=10000"),
    languages:        getDataset($rootScope.API_PATH + "/def/_search?q=*+about.@type:Language&n=10000"),
    countries:        getDataset("/deflist/countries"),
    nationalities:    getDataset("/deflist/nationalities"),
    conceptSchemes:   getDataset($rootScope.API_PATH + "/def/schemes"),
    enums: {
      encLevel:       getDataset("/deflist/enum/encLevel"),
      catForm:        getDataset("/deflist/enum/catForm")
    },
    recordTemplate: function(recordType) { return getDataset("/record/template/" + recordType); }
  };
  return definitions;
});