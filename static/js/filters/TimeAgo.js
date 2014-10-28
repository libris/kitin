kitin.filter('timeAgo', function($filter) {
  return function(_time, verboseAfter, verboseFormat) {
    // "Inspired by" http://stackoverflow.com/a/12475270

    var time = _time;

    // Handle different input formats
    switch (typeof time) {
      case 'number':
        break;
      case 'string':
        time = new Date(time).getTime();
        if (isNaN(time)) {
          // This might be due to a malformed string, 
          // but let's go ahead and assume it's because user is on IE9:
          // Make sure there are exactly 3 digits for milliseconds
          time = _time.replace(/\.\d/, '.000');
          // In the future, if we want to fix the problem with missing colon in timeozne:
          // time = _time.replace(/\.(\d+)([\+|\-])(\d+)/, function(orig, ms, tz, tzval) {
          //   // Fix stuff here
          // });
        }
        break;
      case 'object':
        if (time.constructor === Date) time = time.getTime();
        break;
      default:
        time = new Date().getTime();
    }
    
    verboseFormat = verboseFormat || 'yyyy-MM-dd, HH:mm';

    var timeFormats = [
        [60, 'sekunder', 2], // 60
        [120, 'En minut sen', 'Om en minut'], // 60*2
        [3600, 'minuter', 60], // 60*60, 60
        [7200, 'En timma sen', 'Om en timma'], // 60*60*2
        [86400, 'timmar', 3600], // 60*60*24, 60*60
        [172800, 'I går', 'I morgon'], // 60*60*24*2
        [604800, 'dagar', 86400], // 60*60*24*7, 60*60*24
        [1209600, 'En vecka sen', 'Om en vecka'], // 60*60*24*7*4*2
        [2419200, 'veckor', 604800], // 60*60*24*7*4, 60*60*24*7
        [4838400, 'En månad sen', 'Om en månad'], // 60*60*24*7*4*2
        [29030400, 'månader', 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
        [58060800, 'Ett år sen', 'Om ett år'], // 60*60*24*7*4*12*2
        [2903040000, 'år', 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
        [5806080000, 'Ett årtionde sen', 'Om ett årtionde'], // 60*60*24*7*4*12*100*2
        [58060800000, 'årtionden', 2903040000] // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
    ];
    var months = ['januari','februari','mars','april','maj','juni','juli','augusti','september','oktober','november','december'];
    var seconds = (new Date().getTime() - time) / 1000;
    var tokens = ['För ', ' sen'];
    var listChoice = 1;
    var format;

    if (seconds <= 1) {
      return 'Just nu';
    }

    if (verboseAfter && seconds >= verboseAfter) {
      return $filter('date')(time, verboseFormat);
    }

    // After four weeks, show day and month 
    if (seconds >= 2419200) {
      time = new Date(time);
      return time.getDate() + ' ' + months[time.getMonth()];
    }

    // For future dates
    if (seconds < 0) {
      seconds = Math.abs(seconds);
      tokens = ['Om ', ''];
      listChoice = 2;
    }

    // Find what timespan we're dealing with and answer accordingly
    for (var i = 0; i < timeFormats.length; i++) {
      format = timeFormats[i];
      if (seconds < format[0]) {
        if (typeof format[2] == 'string')
          return format[listChoice];
        else
          return tokens[0] + Math.floor(seconds / format[2]) + ' ' + format[1] + tokens[1];
      }
    }
    
    // IE9 fallback, no niceties
    return $filter('date')(time, verboseFormat);
  };
}); 