angular.module('umbraco').controller('baseline.content-relations.controller', function ($scope, $http, $routeParams, assetsService, baselineContentResource, notificationsService) {

  assetsService.loadCss('/App_Plugins/Baseline/property-editors/content-relations/styles.css');

  baselineContentResource.getRelations($routeParams.id, function (data) {
    $scope.relations = data;
  });
});