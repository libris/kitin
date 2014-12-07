/**
 * editService
 * Service to modify a record. Typically decorate/undecorate
 */
kitin.service('editService', function(definitions, $http, $q, $rootScope) {


  /** mergeProperties
  *   Helper function for doMergeObjects
  *
  *   @param  propertyKey   {String}    Key to property in firstObject to merge
  *   @param  firstObject   {Object}    Javascript object
  *   @param  secondObject  {Object}    Javascript object
  *   @return               {Object}    Merged object
  *   
  */
  function mergeProperties(propertyKey, firstObject, secondObject) {
    var propertyValue = firstObject[propertyKey];

      if (_.isObject(propertyValue) || _.isArray(propertyValue)) {
        // Second object is missing a node, return first objects node
        if(typeof secondObject[propertyKey] === 'undefined' || _.isEmpty(secondObject[propertyKey])) {
          return propertyValue;
        }
          return doMergeObjects(firstObject[propertyKey], secondObject[propertyKey]);
      } else if (typeof secondObject[propertyKey] === 'undefined' || _.isEmpty(secondObject[propertyKey])) {
        // Second object is missing a leaf, return first objects leaf
        return firstObject[propertyKey];
      }
      // Leaf in second object has a value, return second objects leaf (even if its empty)
      return secondObject[propertyKey];
  }

  /** doMergeObjects
  *   Merges secondObject into firstObject
  *
  *   @param  firstObject   {Object}    Javascript object
  *   @param  secondObject  {Object}    Javascript object
  *   @return               {Object}    Merged object
  *   
  */
  function doMergeObjects(firstObject, secondObject) {
      var finalObject = firstObject;

      // Merge first object and its properties.
      for (var propertyKey in firstObject) {
          finalObject[propertyKey] = mergeProperties(propertyKey, firstObject, secondObject);
      }

      // Merge second object and its properties, to add missing properties from second to first object.
      for (propertyKey in secondObject) {
          finalObject[propertyKey] = mergeProperties(propertyKey, secondObject, firstObject);
      }

      return finalObject;
  } 

  /** doCleanObject
  *   Removes empty entities from an javascript object
  *
  *   @param    obj       {Object}    Javascript object to clean
  *   @param    cleanObj  {Object}    (Optional) New object used by the iterator
  *   @return             {Object}    Cleaned-up object
  */
  function doCleanObject(obj, cleanObj) {
    // Initial creation of clean object
    if(!cleanObj) { cleanObj = {}; }

    // Iterate all trough the object
    for(var key in obj) {
      if(!_.isEmpty(obj[key]) || _.isBoolean(obj[key]) || (_.isNumber(obj[key]) && !_.isNaN(obj[key])) ) {
        // Node
        if(_.isObject(obj[key])) {
          // Pass empty array or object
          var childObj = doCleanObject(obj[key], _.isArray(obj[key]) ? [] : {});
          // Empty child, skip add
          if(!_.isEmpty(childObj)) {
            if(_.isArray(cleanObj)) {
              cleanObj.push(childObj);
            } else {
              cleanObj[key] = childObj;
            }
          }
        // Leaf
        } else { 
            // If Array push value else set the value
            if(_.isArray(cleanObj)) {
              cleanObj.push(obj[key]);
            } else {
              cleanObj[key] = obj[key];
            }
        }
      } else {
        // If empty jump to next
        continue;
      }
    }
    return cleanObj;
  }

  var editService = {

    RECORD_TYPES: {
      NEW: 'new',
      DRAFT: 'draft',
      REMOTE: 'remote',
      BIB: 'bib',
      AUTH: 'auth'
    },

    addableElements: [],
    record: null,
    
    /*
    *  Used in remote search, to store record on switch from search to edit mode
    */
    setRecord: function(record) {
      this.record = record;
    },

    /*
    *  Used in remote search, to store record on switch from search to edit mode
    */
    getRecord: function() {
      return this.record;
    },

    /*
    *  Used to get the recType and recId (for now it's just parsing a string, later it will be using ajax)
    */
    getRecordTypeId: function(val) {
      var deferred = $q.defer();

      // replace self-executing function with ajax
      (function(val) {
        var params = val.split('/');
        var record = {
          type: params[1],
          id: params[2]
        };
        if ( record.type && record.id ) {
          deferred.resolve(record);
        } else {
          deferred.reject(record);
        }
      }(val));

      return deferred.promise;
    },

    getMaterialType: function(record) {
      var materialType = '';
      if(_.isArray(record.about['@type'])) {
        materialType = record.about['@type'].join('.');
      } else {
        materialType = record.about['@type'];
      }
      return materialType ? materialType.toLowerCase() : '';
    },

    addObject: function(subj, rel, type, multiple, obj) {

      var addToContainer = function(subj, rel, type, obj) {
        var collection = subj[rel];
        if(typeof collection === 'undefined') {
          collection = subj[rel] = [];
        }
        var res = obj ? obj : this.createObject(type);
        collection.push(res);
        return collection;
      }.bind(this);

      var added;
      if (multiple) {
        added = addToContainer(subj, rel, type, obj);
      } else {
        added = obj? obj : this.createObject(type);
        subj[rel] = added;
      }
      // TODO: make decorate per object type
      if (_.contains(['Person', 'Organization'], added['@type'])) {
        added._reifiedRoles = this.makeVolatileArray();
      }
      return added;
    },

    createObject: function (property, type, initalValue) {
      var deferer = $q.defer();

      
      var createdObject = {};
      try {
        createdObject = $rootScope.getSkeletonTypeMap().summary[type];
        if(_.isUndefined(createdObject)) {
          throw '';
        }
      } catch(error) {
        console.error('Could not find skeleton for', type);
      }
      return createdObject;
    },

    makeReferenceEntity: function (entity) {
      var deferer = $q.defer();
      // Decorate the entity
      this.decorate(entity).then(function(decoratedEntity) {
        // Returns an array of ISSN identifiers for the entity
        var getISSN = function(entity) {
          var identifiers = entity['about']['identifierByIdentifierScheme'];
          if(identifiers) {
            for(var key in identifiers) {
              if(key.indexOf('issn') !== -1) {
                return identifiers[key];
              }
            }
          } else {
            return [];
          }
        };

        // !TODO, handle more types
        switch(this.getMaterialType(entity)) {
          case 'person':
            deferer.resolve({});
            break;
          default: 
            deferer.resolve({
              '@type': decoratedEntity['about']['@type'],
              'title': decoratedEntity['about']['instanceTitle']['titleValue'],
              'issn': _.pluck(getISSN(entity), 'identifierValue').join(','), // Should only be one. But only MARC knows
              'describedBy': {
                '@type': 'Record',
                '@id': decoratedEntity['@id']
              }
            });
            break;
        }
      }.bind(this));
      return deferer.promise;
    },

    indexes: {
      classification: {
        indexName: "classificationByInScheme",
        getIndexKey: function (entity) {
          if((entity.inScheme && entity.inScheme['@id'])) {
            return  entity.inScheme['@id'];
          }
        }
      },
      identifier: {
        indexName: "identifierByIdentifierScheme",
        getIndexKey: function (entity) {
          return entity.identifierScheme ? entity.identifierScheme["@id"] : 'identifier';
        }
      },
      hasFormat: {
        indexName: "hasFormatByType",
        getIndexKey: function (entity) {
          if(entity) {
            return entity["@type"];
          }
        }
      },
      subject: [
        {
          indexName: "subjectByInScheme",
          getIndexKey: function (entity) {
            if((entity.inScheme && entity.inScheme['@id'])) {
              return  entity.inScheme['@id'];
            }
          }
        },
        {
          indexName: "subjectByType",
          getIndexKey: function (entity) {
            if(entity['@type'] && !(entity.inScheme && entity.inScheme['@id'])) {
              return entity['@type'];
            }
          }
        }
      ]
    },

    decorate: function(record) {
      var deferer = $q.defer();

      function doIndex (entity, key, cfg, reset) {
        var items = entity[key];
        if(_.isEmpty(items)) {
          return;
        }
        var groupedItem = _.groupBy(items, cfg.getIndexKey);
        // Remove non matching group.
        if(groupedItem['undefined']) {
          delete groupedItem['undefined'];
        }
        entity[cfg.indexName] = groupedItem;
        if(reset === false) {
          delete entity[key];
        }
      }

      // Rearrange Array elements into display groups
      this.mutateObject(record.about, doIndex);
      // Rearrange Person roles
      var relators = definitions.relators;
      relators.then(function (relators) {
        var roleMap = {};
        this.reifyAgentRoles(record, relators);
      }.bind(this));

      // Decorate record with template json
      var recordSkeletonTypeMap = definitions.recordSkeletonTypeMap;
      recordSkeletonTypeMap.then(function(skeletonTypeMap) {
        var types = record.about['@type'];
        if (!_.isArray(types)) {
          types = [types];
        }
        ['Resource'].concat(types).forEach(function (type) {
          var skeletonType = skeletonTypeMap.main[type];

          // Map @type in main from summary
          _.forEach(skeletonType, function(skeleton, key) {
            if(skeleton['@type']) {
              var summaryType = skeletonTypeMap.summary[skeleton['@type']];
              if(summaryType) {
                skeletonType[key] = angular.copy(summaryType);
              }
            }
          }); 

          if (skeletonType) {
            this.mergeRecordAndTemplate(record.about, skeletonType);
          }
        }.bind(this));
      }.bind(this));

      // Combine all promises into one single, to prevent timing issues
      $q.all([relators, recordSkeletonTypeMap]).then(function() {
        deferer.resolve(record);
      });
      
      return deferer.promise;
    },

    undecorate: function(record) {
      var deferer = $q.defer();

      function doUnindex (entity, key, cfg, reset) {
        var flattened = _.flatten(entity[cfg.indexName], function(it) { return it; });
        // Reset boolean to handle undecoration of multiple decorators for single entity
        if(reset !== false) {
          entity[key] = flattened;  
        } else {
          entity[key] = _.union(flattened, entity[key]);
        }
        delete entity[cfg.indexName];
      }
      // Rearrange grouped Arrays
      this.mutateObject(record.about, doUnindex);
      // Rearrange Person roles
      this.unreifyAgentRoles(record);

      // Remove empty entities 
      record = this.cleanRecord(record);

      deferer.resolve(record);

      return deferer.promise;
    },

    mutateObject: function(entity, mutator) {
      if(!_.isEmpty(entity)) {
        for (var key in this.indexes) {
          var cfgs = this.indexes[key];
          // Handle multiple mutators for single entity
          cfgs = _.isArray(cfgs) ? cfgs : [cfgs];
          for (var i = 0; i < cfgs.length; i++) {
            var cfg = cfgs[i];
            var reset = i > 0 ? false : true;
            mutator(entity, key, cfg, reset);
          }
        }
      }
      return entity;
    },

    mergeRecordAndTemplate: doMergeObjects,

    cleanRecord: doCleanObject,

    makeVolatileArray: function () {
        var l = [];
        l.toJSON = function () { };
        return l;
    },

    reifyAgentRoles: function (record, relators) {
      var instance = record.about;
      if (!instance)
        return;

      // add index to relator terms object
      // TODO: coordinate terms, JSON-LD context and relators dataset instead
      // FIXME: use '@id' directly
      if (relators.byTerm === undefined) {
        var index = relators.byTerm = {};
        _.each(relators.list, function (obj) {
          var id = obj['about']['@id'];
          index[id] = obj;
          var key = id.substring(id.lastIndexOf('/') + 1);
          index[key] = obj;
        });
      }

      // add _reifiedRoles key to each person
      var personMap = {};
      var prepareAgent = function (agent) {
        if (!agent || _.isEmpty(agent))
          return;

        if (agent['@id']) {
          personMap[agent['@id']] = agent;
        }
        agent._reifiedRoles = this.makeVolatileArray();
      }.bind(this);

      prepareAgent(instance.attributedTo);
      if (instance.influencedBy) {
        instance.influencedBy.forEach(prepareAgent);
      }

      _.forEach(instance, function (values, key) {
        if (!values)
          return;

        if (!_.isArray(values))
          values = [values];
        _.forEach(values, function (agent) {
          if (agent['@id']) {
            agent = personMap[agent['@id']];
          }
          if (!agent)
            return;

          var roles = agent._reifiedRoles;
          if (!roles)
            return;

          var role = relators.byTerm[key];
          if (!role) {  return; }

          if (!_.contains(roles, role)) {
            roles.push(role['about']);
            delete instance[key];
          }
        });
      });
    },

    unreifyAgentRoles: function (record) {
      var instance = record.about;
      if (!instance)
        return;

      var unreifyRoles = function (agent) {
        if (!agent)
          return;
        var roles = agent._reifiedRoles;
        if (!roles)
          return;
        roles.forEach(function (role) {
          var id = role['@id'];
          // FIXME: use @id
          var key = id.substring(id.lastIndexOf('/') + 1);
          var linked = instance[key];
          if (typeof linked === 'undefined') {
            linked = instance[key] = [];
          } else if (!_.isArray(linked)) {
            linked = instance[key] = [linked];
          }
          // TODO: use agentRef after first occurrence..
          if (!_.find(linked, function (o) { return o['@id'] === agent['@id']; }) ) {
            linked.push(agent);
          }
        });

        //delete agent._reifiedRoles;
      }.bind(this);

      unreifyRoles(instance.attributedTo);
      if (instance.influencedBy) {
        instance.influencedBy.forEach(unreifyRoles);
      }
    },

    // TODO: this will be unified in the backend mapping and thus not needed here
    getUnifiedClassifications: function (record) {
      var classes = [];
      if(record && record.about) {
        var thing = record.about;
        if (thing.class) {
          classes.push.apply(thing.class);
        }
        ['class-lcc', 'class-ddc'].forEach(function (key) {
          var cls = thing[key];
          if (cls) {
            classes.push({prefLabel: cls});
          }
        });
      }
      return classes;
    }
  };
  return editService;
});
