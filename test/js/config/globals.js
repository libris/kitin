var debug = true;
var API_PATH = WHELK_HOST = 'http://localhost:8180/whelk';
var WHELK_WRITE_HOST = 'http://localhost:5000/whelk';
var TESTING_SKIP_TRANSLATION = 'DO NOT TRANSLATE';
var MAIN_STATUS_MSG = {};
var CURRENT_USER = {
  sigel: 'SEK',
  username: 'App tests user',
  authorization: [{ 'sigel': 'NONE', 'xlreg': true, 'kat': true, 'reg': true }]
};