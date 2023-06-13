angular.module('umbraco').controller('Baseline.ChainCatalogPage', function ($scope, $http, $routeParams, assetsService, baselineContentResource, notificationsService) {
  assetsService.loadCss('/App_Plugins/Baseline/property-editors/chain-catalog-page/styles.css');

  $scope.scopeChains = [];


  baselineContentResource.getChains($routeParams.id, function (data) {
    var chains = data;

    jQuery.each(chains, function (key, chain) {
      var existingChain = $scope.model.value ? jQuery.grep($scope.model.value, function (n) {
        return !isNaN(n.RetailGroup) && n.RetailGroup === chain.RetailGroup;
      })[0] : null;

      $scope.scopeChains.push({
        "RetailGroup": chain.RetailGroup,
        "RetailGroupName": chain.RetailGroupName,
        "Value": existingChain ? existingChain.Value : 1
      });
    });
  });

  $scope.$on('formSubmitting', function () {
    $scope.model.value = [];

    jQuery.each($scope.scopeChains, function (key, chain) {
      $scope.model.value.push({
        "RetailGroup": chain.RetailGroup,
        "RetailGroupName": chain.RetailGroupName,
        "Value": chain.Value
      });
    });

    console.info('   $scope.model.value ', $scope.model.value )

  });
});