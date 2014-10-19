// May be generalized at will
kitin.filter('chop', function() {
  return function(victim, length, token) {
    victim = victim || '';
    length = length || 99;
    token = token || ' [...]';
    if (victim.length < length) {
      return victim;
    } else {
      return String(victim).substring(0, length - token.length) + token;
    }
  };
});