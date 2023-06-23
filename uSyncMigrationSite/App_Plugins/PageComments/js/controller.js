angular.module("umbraco").controller("PageCommentsController", function ($scope, $routeParams, notificationsService, dashResource) {
    dashResource.getPageCommentModel($routeParams.id).then(function (response) {
            $scope.commentDatas = response.data;            
        });
    

    /*Enable the Approve button on selecting the comment */
    $scope.countChecked = function () {
        var count = 0;
        angular.forEach($scope.commentDatas, function (commentData) {
            if (commentData.selected) count++;
        });
        return count;
    }


     /* Check all comments */
    $scope.checkAll = function () {        
        if ($scope.selectedAll) {
            $scope.selectedAll = true;            
        }
        else {
            $scope.selectedAll = false;
        }
        angular.forEach($scope.commentDatas, function (commentData) {            
            commentData.selected = $scope.selectedAll;            
        });
    };

    $scope.getSelectedIds = function()
    {
        
        $scope.commentsArray = [];
        angular.forEach($scope.commentDatas, function (commentData) {
            if (commentData.selected)
            {
                $scope.commentsArray.push(commentData.Id);
                var index = $scope.commentDatas.indexOf(commentData);
                $scope.commentDatas.splice(index, 1);
            }
                
        });

        return $scope.commentsArray;
    }

    /* Get Ids of the Selected comments */
    $scope.checkSelected = function () {
        
        /*Call approveSelected function*/
        $scope.approveSelected($scope.getSelectedIds());
    }

    /* Delete Ids of the Selected comments */
    $scope.chkdelSelected = function () {        
        $scope.deleteSelected($scope.getSelectedIds());
    }


    /* Approve the selected comments */
    $scope.approveSelected = function (listCommentIds) {
        console.log("listCommentIds " + listCommentIds);
        for (var i = 0; i < listCommentIds.length; i++) {          
            var item = "#"+listCommentIds[i];
            console.log($(item).closest('tr'));
            $(item).closest('tr').remove();
        }
        dashResource.approveSelected(listCommentIds).then(function (response) {
       notificationsService.success("Selected Comments are approved.");    
      });
    };
   


    /* Delete the selected comments */
    $scope.deleteSelected = function (listCommentIds) {
        console.log("listCommentIds " + listCommentIds);
        for (var i = 0; i < listCommentIds.length; i++) {
            var item = "#" + listCommentIds[i];
            console.log($(item).closest('tr'));
            $(item).closest('tr').remove();
        }
        dashResource.deleteSelected(listCommentIds).then(function (response) {
            notificationsService.success("Selected Comments are deleted.");
        });
    };



    dashResource.getall().then(function (response) {
        $scope.settings = response.data;
    });

    //Save - click...
    $scope.save = function (settings) {
        //Save settings resource - does a WebAPI POST call
        dashResource.save(settings).then(function (response) {
            
            $scope.settings = response.data;

            //Display Success message
            notificationsService.success("Success settings have been saved");
        });
    };
});

$(document).ready(function () {
   
});