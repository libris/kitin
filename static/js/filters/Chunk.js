kitin.filter('chunk', function() {
  return function(toChunk) {
    return String(toChunk).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };
});