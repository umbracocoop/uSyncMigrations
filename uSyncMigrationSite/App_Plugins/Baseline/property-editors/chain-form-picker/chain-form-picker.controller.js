angular.module('umbraco').controller('Baseline.ChainFormPicker', function ($scope, $http, $routeParams, assetsService, baselineContentResource, notificationsService) {
  assetsService.loadCss('/App_Plugins/Baseline/property-editors/chain-form-picker/styles.css');

  $scope.forms = [];

  baselineContentResource.getChains($routeParams.id, function (data) {
    var chains = data;

    chains.push({
      "RetailGroup": -1,
      "RetailGroupName": "Fallback"
    });

    jQuery.each(chains, function (key, chain) {
      var existingForm = $scope.model.value ? jQuery.grep($scope.model.value, function (n) {
        return !isNaN( n.RetailGroup ) && n.RetailGroup === chain.RetailGroup;
      })[0] : null;
      console.log("RetailGroup: ", chain.RetailGroup, " - Form: ", existingForm);

      $scope.forms.push({
        "RetailGroup": chain.RetailGroup,
        "Name": chain.RetailGroupName,
        "FormPicker": {
          view: '/App_Plugins/UmbracoForms/Backoffice/PropertyEditors/formpicker.html',
          value: existingForm ? existingForm.Form : null
        }
      });
    });
  });

  $scope.$on('formSubmitting', function () {
    $scope.model.value = [];

    jQuery.each($scope.forms, function (key, form) {
      if (form.FormPicker.value) {
        console.log("RetailGroup: ", form.RetailGroup, " - Form: ", form.FormPicker.value);
        $scope.model.value.push({
          "RetailGroup": form.RetailGroup,
          "Form": form.FormPicker.value
        });
      }
    });
  });
});