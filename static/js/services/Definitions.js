/**
 * definitions
 * Get definitions lists from backend
 */
kitin.factory('definitions', function($http, $rootScope) {
  
  /**
  * getDataset
  * @param    url       {String}    URL to dataset
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

  function getDefinition(filter) {
    return getDataset($rootScope.API_PATH + '/def/_search?q=*+' + filter + '&n=10000');
  }

  function getEnumDefinition(collectionName) {
    return getDefinition('about.inCollection.@id:\\/def\\/enum\\/content\\/' + collectionName + '\\-collection');
  }

  // Defined definitions
  var definitions = {
    remotedatabases:  getDataset($rootScope.API_PATH + "/_remotesearch?databases=list"),
    terms:            getDataset($rootScope.API_PATH + "/def/terms"),
    conceptSchemes:   getDataset($rootScope.API_PATH + "/def/schemes"),
  // !TODO Remove definitions below when the "index expander" is implemented in backend
    relators:         getDefinition('about.@type:ObjectProperty'),
    languages:        getDefinition('about.@type:Language'),
    countries:        getDefinition('about.@type:Country'),
    nationalities:    getDefinition('about.@type:Nationality'),
    enums: {
      publicationStatus: getEnumDefinition('publicationStatus'), 
      contentType:    getEnumDefinition('contentType'),
      frequencies:    getEnumDefinition('frequency'),
      regularities:   getEnumDefinition('regularity'),
      encLevel:       getEnumDefinition('encLevel'),
      catForm:        getEnumDefinition('catForm'),
      literaryForm:   getEnumDefinition('literaryForm'),
      biography:   getEnumDefinition('biography')
    },
    recordSkeletonTypeMap: getDataset("/record/template/skeletontypemap")
  };

  return definitions;
});
