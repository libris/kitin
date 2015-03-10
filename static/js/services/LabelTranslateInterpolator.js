kitin.factory('labelTranslateInterpolator', function ($interpolate, $rootScope) {
 
  var $locale;

   getGUILabel = function(identifier) {
      $rootScope.GUILabels = response.data;
  
      var test = identifier.split('.');
      var locale = 'se';
      var label = $rootScope.GUILabels[locale];
      for (var i = 0; i < test.length; i++) {
        label = label[test[i]];
      }
      return label;
    };
 
  return {
 
    setLocale: function (locale) {
      $locale = locale;
    },
 
    getInterpolationIdentifier: function () {
      return 'custom';
    },
 
    interpolate: function (str, interpolateParams) {

      var locale = $locale;
      var translatedStr = str;
      var model, modelParts, label;

      model = str.replace('record.about.','');
      model = model.replace('holding.about.','');
      modelParts = model.split('.');  
      if($rootScope.getTypeLabel) {
        label = $rootScope.getTypeLabel({'@type': modelParts[modelParts.length-1]}, locale);

        if(label !== '') {
          translatedStr = label;
        } else if(debug && (str.indexOf('record') !== -1 || str.indexOf('hold') !== -1)) {
            console.warn('No tranlation found for:', label, str);
        }
      }
      return $interpolate(translatedStr)(interpolateParams || {});
    }
  };
});