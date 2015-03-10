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
      var model, modelParts, label, lastModel;

      model = str.replace('record.about.','');
      model = model.replace('holding.about.','');
      modelParts = model.split('.');  
      lastModel = modelParts[modelParts.length-1];
      if($rootScope.getTypeLabel) {
        label = $rootScope.getTypeLabel({'@type': lastModel}, locale);
      
        if(label === lastModel) {
          translatedStr = str;
        } else if(label !== '') {
          translatedStr = label;
        } 
      }
      return $interpolate(translatedStr)(interpolateParams || {});
    }
  };
});