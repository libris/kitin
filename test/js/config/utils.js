
// https://github.com/pizzapanther/Karma-Read-JSON
function readJSON (url) {
  url = '/base/' + url;
  
  var xhr = new XMLHttpRequest();
  var json = null;
  
  xhr.open("GET", url, false);
  
  xhr.onload = function (e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        json = JSON.parse(xhr.responseText);
      }
      
      else {
        console.error('readJSON', url, xhr.statusText);
      }
    }
  };
  
  xhr.onerror = function (e) {
    console.error('readJSON', url, xhr.statusText);
  };
  
  xhr.send(null);
  return json;
}

// https://github.com/kdimatteo/bind-polyfill
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                                 ? this
                                 : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}