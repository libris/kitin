// May be generalized at will
kitin.filter('chop', function() {
  return function(victim) {
    if (!victim) {
      victim = "";
    }
    if (victim.length < 99) {
      return victim;
    } else {
      return String(victim).substring(0, 93) + " [...]";
    }
  };
});