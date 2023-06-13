angular.module('umbraco').controller('Baseline.GenerateGuid', function ($scope, $http, assetsService, $rootScope, dialogService, mediaResource, imageHelper, entityResource, $routeParams, $timeout, $window) {
  assetsService.loadCss('/App_Plugins/Baseline/property-editors/generate-guid/styles.css');

  function GenerateUUID() {
    var d = new Date().getTime();

    return 'b0000000-0000-4000-8000-000000000000'.replace(/[08]/g, function (c) { var r = (d + Math.random() * 16) % 16 | c; d >>>= 4; return r.toString(16); });
  }

  if ($scope.model.value) {
    $scope.guid = $scope.model.value;
  } else {
    $scope.guid = GenerateUUID();
  }

  $scope.$on('formSubmitting', function () {
    $scope.model.value = $scope.guid;
  });
});