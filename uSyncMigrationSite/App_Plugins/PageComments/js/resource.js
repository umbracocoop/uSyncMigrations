angular.module('umbraco.resources').factory('dashResource', function ($q, $http) {
    return {
        getPageCommentModel: function (nodeId) {
            return $http.get("backoffice/PageComment/PageCommentApi/GetPageCommentModel?nodeId=" + nodeId);
        },
        getall: function () {
            return $http.get("backoffice/PageComment/PageCommentApi/GetSettings");
        },
        save: function(settings) {
            return $http.post("backoffice/PageComment/PageCommentApi/PostSettings", angular.toJson(settings));
        },
        approveSelected: function (listapprovedCommentIds)
        {
             return $http.post("backoffice/PageComment/PageCommentApi/ApproveSelectedComments?listCommentIds=" + listapprovedCommentIds.join(','));
        },
        deleteSelected: function (listdeleteCommentIds) {
            return $http.post("backoffice/PageComment/PageCommentApi/DeleteSelectedComments?listCommentIds=" + listdeleteCommentIds.join(','));
        }
    };
});