kitin.factory('labelLoader', function ($http, $q, definitions) {
    return function (options) {
        var deferred = $q.defer();
        // Load terms
        definitions.terms.then(function(termsObj) { 
          // Load gui labels
          $http.get('resource/gui_labels.json', {cache: true}).then(function(guiLabels) {
            var labels = angular.extend(termsObj, guiLabels.data);
            deferred.resolve(labels);
          });
        });
        
        return deferred.promise;
    };
});