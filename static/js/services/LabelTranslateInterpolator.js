kitin.factory('labelTranslateInterpolator', function ($interpolate, $rootScope) {
 
  var $locale;
 
  return {
 
    setLocale: function (locale) {
      $locale = locale;
    },
 
    getInterpolationIdentifier: function () {
      return 'custom';
    },
 
    interpolate: function (str, interpolateParams) {
      var translatedStr = str;
      if(str.indexOf('gui') !== -1) {

      } else if(str.indexOf('HELP') !== -1) {

      } else {
        var model = str.replace('LABEL.record.about.','');
        var modelParts = model.split('.');
        var label = $rootScope.getTypeLabel({'@type': modelParts[modelParts.length-1]});
        //console.log(modelParts, modelParts[modelParts.length-1], label);
        if(label !== '') {
          translatedStr = label;
        }

        //debugger;
      }
      return translatedStr; //$locale + '_' + $interpolate(string)(interpolateParams) + '_' + $locale;
    }
  };
});