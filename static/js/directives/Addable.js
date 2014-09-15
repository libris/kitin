kitin.directive('addable', function(editService){
  return {
      restrict: 'A',
      scope: true,
      compile: function(element, attrs) {
        if(attrs.addable !== '') {
          if(typeof editService.addableElements[attrs.addable] === 'undefined') {
            editService.addableElements[attrs.addable] = [];
          }
          editService.addableElements[attrs.addable].push(attrs);
        } else {
          editService.addableElements.push(attrs);
        }
      }
  };
});
