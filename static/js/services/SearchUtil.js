/**
 * searchUtil
 *
 */
kitin.factory('searchUtil', function() {
  return {

    countTotalItems: function(items) {
      if(_.isObject(items)) {
        return _.reduce(items, function(sum, num) {
          return sum + num;
        });
      } else {
        return items;
      }
    },

    parseSelected: function (remoteDatabases) {
      return _.map(_.filter(remoteDatabases, 'selected'), 'database').join(',');
    },

    makeLinkedFacetGroups: function (recType, facets, q, prevFacetsStr) {
      // iterate facets to add correct slug
      // if can do in angularistic fashion; then please do and remove this!
      var result = [];
      _.each(facets, function (facet, facetType) {
        var newFacet = {};
        newFacet.type = facetType;
        newFacet.items = [];
        var prevFacets = prevFacetsStr.split(" ");
        _.each(facet, function (count, key) {
          var slug = [facetType, key.replace(/:/g, '\\:')].join(":");
          var selected = _.indexOf(prevFacets, slug) !== -1;
          var searchUrl = "/search/" + recType + "?q=" + encodeURIComponent(q) + 
            (selected ? (prevFacets.length > 1 ? "&f=" + _.filter(prevFacets, function(val) {return val != slug;}).join(' ') : '') : "&f=" + slug + " " + prevFacetsStr);
          
          var item = {
            key: key,
            count: count,
            selected: selected,
            searchUrl: searchUrl
          };
          newFacet['items'].push(item);
        });
        result.push(newFacet);
      });
      return result;
    },

    bakeCrumbs: function (recType, q, prevFacetsStr) {
      var facetlist = prevFacetsStr.split(" ").reverse();
      var crumblist = [];
      var tmpCrumb = {};
      tmpCrumb['term'] = q;
      if (prevFacetsStr.length > 0) {
        tmpCrumb['urlpart'] = "/search/" + recType + "?q=" + encodeURIComponent(q);
        crumblist.push(tmpCrumb);
        var urlPart = "";
        for (var i=0; i < facetlist.length; i++) {
          tmpCrumb = {};
          var facet = facetlist[i];
          var f = facet.split(':');
          var term = f[1];
          var type = f[0];
          if (urlPart === "") {
            urlPart = urlPart + facet;
          } else {
            urlPart = urlPart + " " + facet;
          }
          tmpCrumb["term"] = term;
          tmpCrumb["type"] = type;
          if (i < (facetlist.length - 1)) {
            tmpCrumb['urlpart'] = "/search/" + recType + "?q=" + encodeURIComponent(q) + "&f=" + urlPart;
          }
          if (i === 0) {
            tmpCrumb["bridge"] = " inom ";
          }
          if (i > 0) {
            tmpCrumb["bridge"] = " och ";
          }

          crumblist.push(tmpCrumb);
        }
      } else {
      crumblist.push(tmpCrumb);
      }
      return crumblist;
    }
  };
});