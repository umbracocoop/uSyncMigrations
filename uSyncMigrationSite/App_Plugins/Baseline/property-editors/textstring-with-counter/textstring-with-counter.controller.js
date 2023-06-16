angular.module('umbraco').controller('Baseline.textstring-with-counter.controller', function ($scope, $http, $routeParams, assetsService, notificationsService) {

  assetsService.loadCss('/App_Plugins/Baseline/property-editors/textstring-with-counter/styles.css');

  $scope.model.config.enforceCharacterLimit = $scope.model.config.enforceCharacterLimit == 1;
  $scope.model.config.textarea = $scope.model.config.textarea == 1;
  $scope.count = $scope.model.value ? $scope.model.value.length : 0;
  $scope.model.config.maxlength = $scope.model.config.enforceCharacterLimit ? $scope.model.config.characterLimit : '';

  $scope.inputchanged = function () {
    $scope.count = $scope.model.value.length;
  }
});