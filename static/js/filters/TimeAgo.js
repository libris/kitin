kitin.filter('timeAgo', function($filter) {
  return function(time) {
    // http://stackoverflow.com/a/12475270
    switch (typeof time) {
      case 'number':
        break;
      case 'string':
        time = new Date(time).getTime();
        break;
      case 'object':
        if (time.constructor === Date) time = time.getTime();
        break;
      default:
        time = new Date().getTime();
    }
    
    // Correct time for timezone missing in the input time string.
    // TODO: Fix this.Save time with time zone in drafts.
    correctedTime = time + (new Date().getTimezoneOffset() * 60 * 1000)

    var timeFormats = [
        [60, 'sekunder', 1], // 60
        [120, 'En minut sen', 'Om en minut'], // 60*2
        [3600, 'minuter', 60], // 60*60, 60
        [7200, 'En timma sen', 'Om en timma'], // 60*60*2
        [86400, 'timmar', 3600], // 60*60*24, 60*60
        [172800, 'I går', 'I morgon'], // 60*60*24*2
        [604800, 'dagar', 86400], // 60*60*24*7, 60*60*24
        [1209600, 'En vecka sen', 'Om en vecka'], // 60*60*24*7*4*2
        [2419200, 'veckor', 604800] // 60*60*24*7*4, 60*60*24*7
        // [4838400, 'En månad sen', 'Om en månad'], // 60*60*24*7*4*2
        // [29030400, 'månader', 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
        // [58060800, 'Ett år sen', 'Om ett år'], // 60*60*24*7*4*12*2
        // [2903040000, 'år', 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
        // [5806080000, 'Ett årtionde sen', 'Om ett årtionde'], // 60*60*24*7*4*12*100*2
        // [58060800000, 'årtionden', 2903040000] // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
    ];
    var months = ['januari','februari','mars','april','maj','juni','juli','augusti','september','oktober','november','december'];
    var seconds = (new Date().getTime() - correctedTime) / 1000;
    var tokens = ['För ', ' sen'];
    var listChoice = 1;
    var format;

    if (seconds === 0) {
      return 'Just nu';
    }

    if (seconds >= 2419200) {
      time = new Date(time);
      return time.getDate() + ' ' + months[time.getMonth()];
    }

    if (seconds < 0) {
      seconds = Math.abs(seconds);
      tokens = ['Om ', ''];
      listChoice = 2;
    }

    for (var i = 0; i < timeFormats.length; i++) {
      format = timeFormats[i];
      if (seconds < format[0]) {
        if (typeof format[2] == 'string')
          return format[listChoice];
        else
          return tokens[0] + Math.floor(seconds / format[2]) + ' ' + format[1] + tokens[1];
      }
    }
    
    return $filter('date')(time, 'yyyy-MM-dd, HH:mm');
  };
}); 