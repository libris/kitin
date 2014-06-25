kitin.directive('addable', function(editUtil){
  return {
      restrict: 'A',
      scope: true,
      compile: function(element, attrs) {
        if(attrs.addable !== '') {
          if(typeof editUtil.addableElements[attrs.addable] === 'undefined') {
            editUtil.addableElements[attrs.addable] = [];
          }
          editUtil.addableElements[attrs.addable].push(attrs);
        } else {
          editUtil.addableElements.push(attrs);
        }
      }
  };
});
