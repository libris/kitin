/**
 * utilsService
 * Global utility functions
 */
kitin.factory('utilsService', function($http, $q, $rootScope) {
  // Private functions
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

  // Methods
  return {
    composeTitle: function(record, recType) {
      // Put together the actual title text in a separate function.
      // This enables us to call it recursively for nested values.
      var constructName = function(obj) {
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
      };

      recType = recType || 'bib';
      var composedTitle;
      if (recType == 'draft') {
        composedTitle = record.instanceTitle.subtitle ? record.instanceTitle.titleValue + ' - ' + record.instanceTitle.subtitle : record.instanceTitle.titleValue;
        if (!composedTitle) composedTitle = '<Titel saknas>';
      } else if (recType == 'auth') {
        var post = record.data.about;
        composedTitle = constructName(post) || '<Namn saknas>';
      }
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
        var post = record.data.about;
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
        var post = record.data.about;
        var authType = post['@type'] || '';
console.log(this.composeTitle(record, 'auth'), post);
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
    }
  };
});


