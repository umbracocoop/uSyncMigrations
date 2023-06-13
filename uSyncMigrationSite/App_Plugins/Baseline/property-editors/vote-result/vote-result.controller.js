angular.module('umbraco').controller('Baseline.vote-result.controller', function ($scope, $http, $routeParams, assetsService, baselineContentResource, notificationsService) {

  assetsService.loadCss('/App_Plugins/Baseline/property-editors/vote-result/styles.css');

  baselineContentResource.getVoteData($routeParams.id, function (data) {
    console.log(data);
    $scope.model.voteData = data;
  });
});