/**
 * utilsService
 * Global utility functions
 */
kitin.factory('utilsService', function($http, $q, $rootScope) {
  // Private functions

  // Example
  function genericFunctions (value) {
    // This is just a generic function 
    var deferred = $q.defer();
    var url = $rootScope.API_PATH + '/path/___' + value;
    // $rootScope.promises is used by angular-busy to show and hide loading/saving indicators
    $rootScope.promises.GENERIC_CATEGORY.loading = $http.get(url).success(function(data) {
      deferred.resolve(data);
    }).error(function(data, status, headers) {
      deferer.reject(status);
    });
    return deferred.promise;
  }

  // Helper function for compose functions
  function constructName (obj) {
    // In some cases, obj might be an array (f.ex. sameAs).
    // Pick the first element and move on.
    if (Array.isArray(obj)) obj = obj[0];
    var name;
    if (obj.prefLabel) {
      name = obj.prefLabel;
    } else if (obj.controlledLabel) {
      name = obj.controlledLabel;
    } else if (obj.uniformTitle) {
      name = obj.uniformTitle;
    } else if (obj.name) {
      name = obj.name;
      if (obj.numeration) {
        name += ' ' + obj.numeration;
      }
      if (obj.personTitle) {
        name += ' ' + obj.personTitle;
      }
    } else if (obj.givenName && obj.familyName) {
      name = obj.givenName + ' ' + obj.familyName;
    } else if (obj.title) {
      name = obj.title;
      if (obj.attributedTo) {
        name += ' ' + constructName(obj.attributedTo);
      }
    // This should be last as a fallback
    } else if (obj.sameAs) {
        name = constructName(obj.sameAs);
    } else {
      name = false;
    }
    return name;
  }

  //
  // Functions from lodash contrib
  //
  // Gets the value at any depth in a nested object based on the
  // path described by the keys given. Keys may be given as an array
  // or as a dot-separated string.
  function getPath (obj, ks) {
    //console.log(obj, ks);
    if (typeof ks == "string") ks = ks.split(".");

    // If we have reached an undefined property
    // then stop executing and return undefined
    if (obj === undefined) return void 0;

    // If the path array has no more elements, we've reached
    // the intended property and return its value
    if (ks.length === 0) return obj;

    // If we still have elements in the path array and the current
    // value is null, stop executing and return undefined
    if (obj === null) return void 0;

    return getPath(obj[_.first(ks)], _.rest(ks));
  }

  // Methods
  return {
    composeTitle: function(record, recType) {
      // Put together the actual title text in a separate function.
      // This enables us to call it recursively for nested values.
      recType = recType || 'bib';
      var composedTitle;
      // Normalize post object
      var post = record && record.about ? record.about : record;
      if (recType == 'draft' || recType == 'bib') {
        composedTitle = post.instanceTitle.subtitle ? post.instanceTitle.titleValue + ' - ' + post.instanceTitle.subtitle : post.instanceTitle.titleValue;
      } else if (recType == 'auth') {
        composedTitle = constructName(post) || '<Namn saknas>';
      }
      if (!composedTitle) composedTitle = '<Titel saknas>';
      return composedTitle;
    },

    getIconByType: function(record, recType) {
      var setIcon = function(type) {
        var icons = {
          'Person': 'fa-user',
          'UniformWork': 'fa-book',
          'Concept': 'fa-lightbulb-o',
          'Place': 'fa-map-marker',
          'Event': 'fa-calendar',
          'Meeting': 'fa-comment',
          'Organization': 'fa-group',
          'default': ''
        };
        return icons[type] || icons['default'];
      };

      recType = recType || 'bib';
      var icon;
      if (recType == 'auth') {
        var post = record.about;
        var authType = post['@type'] || '';
        icon = setIcon(authType);
      } else {
        icon = '';
      }
      return icon;
    },

    composeInfo: function(record, recType) {
      recType = recType || 'bib';
      var info = '';
      if (recType == 'auth') {
        var post = record.about;
        var authType = post['@type'] || '';
        //console.log(this.composeTitle(record, 'auth'), post);
        if (post.birthYear) {
          info += post.birthYear + '-';
          if (post.deathYear) {
            info += post.deathYear;
          }
          info += '. ';
        }
        if (post.note) {
          info += post.note[0];
        }
        if (post.scopeNote) {
          info += post.scopeNote[0];
        }
        if (info === '') {
          // Fallback, display type. When/if SearchResultCtrl->getLabel() moves, we can get translation as well.
          info = authType;
        }
      }
      return info;
    },

    composeCreator: function(record) {
      var creator = '';
      var post = record.about;
      if (post.creator) {
        creator = post.creator;  
      } else if (post.responsibilityStatement) {
        creator = post.responsibilityStatement;
      } else if (post.attributedTo) {
        creator = constructName(post.attributedTo);
      } else {
        //console.log(post);
      }
      return creator;
    },

    composeDate: function(dateString) {
      var date = '';
      if (dateString) {
        var regex = /^(\d{4}\-\d\d\-\d\d)(([tT][\d:\.]*)?)([zZ]|([+\-])(\d\d):?(\d\d))?$/;
        var dateArray = dateString.match(regex);
        if (dateArray && dateArray.length > 0) {
          // This seems to be an ISO date, only return YYYY-mm-dd
          date = dateArray[1];
        } else {
          date = dateString;
        }
      }
      return date;
    },

    findDeep: function(items, path, value) {
      var matches = [];
      var nonmatches = [];
      _.forEach(items, function(item) {
        if (getPath(item, path) == value) {
          matches.push(item);
        } else {
          nonmatches.push(item);
        }
      });
      return {
        matches: matches.length > 0 ? matches : false,
        nonmatches: nonmatches.length > 0 ? nonmatches : false
      };
    }
  };
});


