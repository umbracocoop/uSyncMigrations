angular.module("umbraco.resources")
  .factory("baselineContentResource", function ($http) {

    var contentService = {};
    contentService.getRelations = function (contentId, fn) {
      $http.get("Backoffice/baseline/Content/GetRelations?contentId=" + contentId).success(function (data) {
        // With the data succesfully returned, call our callback
        if (fn) {
          fn(data);
        }
      });
    };

    contentService.getChains = function (contentId, fn) {
      $http.get("Backoffice/baseline/Content/GetChains?contentId=" + contentId).success(function (data) {
        // With the data succesfully returned, call our callback
        if (fn) {
          fn(data);
        }
      });
    };

    contentService.getProductData = function (contentId, fn) {
      $http.get("Backoffice/baseline/Product/GetProductData?contentId=" + contentId).success(function (data) {
        // With the data succesfully returned, call our callback
        if (fn) {
          fn(data);
        }
      });
    };

    contentService.getSearchResult = function (contentId, searcher, fn) {
      $http.get("Backoffice/baseline/SearchIndex/GetSearchResult?contentId=" + contentId + '&searcher=' + searcher).success(function (data) {
        // With the data succesfully returned, call our callback
        if (fn) {
          fn(data);
        }
      });
    };

    contentService.getProductsForProductListSearchResults = function (categoryId, fn) {
      $http.get("Backoffice/baseline/Product/GetProductDataForCategory?categoryId=" + categoryId).success(function (data) {
        // With the data succesfully returned, call our callback
        if (fn) {
          fn(data);
        }
      });
    };

    contentService.getProductDataForOverview = function (filter, fn, errorFN) {
      $http.post("Backoffice/baseline/Product/GetProductDataForOverview", filter).success(function (data) {
        // With the data succesfully returned, call our callback
        if (fn) {
          fn(data);
        }
      }).error(function (data) {
        // With the data succesfully returned, call our callback
        if (errorFN) {
          errorFN(data);
        }
      });
    };

    contentService.getVoteData = function (voteOptionWrapperContentId, fn) {
      $http.get("/umbraco/surface/Vote/GetData?voteOptionWrapperContentId=" + voteOptionWrapperContentId + "&teamId=&raw=true").success(function (data) {
        if (fn) {
          fn(data);
        }
      });
    }
    return contentService;
  });