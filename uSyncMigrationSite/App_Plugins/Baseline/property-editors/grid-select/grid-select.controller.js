angular.module('umbraco').controller('Baseline.grid-select.controller', function ($scope, $http, $routeParams, assetsService, contentResource, notificationsService) {
  assetsService.loadCss('/App_Plugins/Baseline/property-editors/grid-select/styles.css');

  $scope.rows = $scope.model.defaultConfig ? $scope.model.defaultConfig.rows : $scope.model.config.rows;

  if ($scope.model.value) {
    var found = false;
    for (var o = 0; o < $scope.rows.length; o++) {
      var row = $scope.rows[o];
      for (var i = 0; i < row.columns.length; i++) {
        if (!row.columns[i].selected) {
          row.columns[i].selected = row.columns[i].value.trim() === $scope.model.value.trim();
          console.log(row.columns[i].value + ' === ' + $scope.model.value);
          if (row.columns[i].selected) {
            found = true;
            break;
          }
        }
      }
      if (found) {
        break;
      }
    }
  }

  $scope.select = function (column) {
    if (!column.selected) {
      for (var o = 0; o < $scope.rows.length; o++) {
        var row = $scope.rows[o];
        for (var i = 0; i < row.columns.length; i++) {
          row.columns[i].selected = false;
        }
      }
      column.selected = true;
    } else {
      column.selected = false;
    }

    $scope.setValue();
  };

  $scope.setValue = function () {
    $scope.model.value = '';

    for (var o = 0; o < $scope.rows.length; o++) {
      var row = $scope.rows[o];
      for (var i = 0; i < row.columns.length; i++) {
        if (row.columns[i].selected) {
          $scope.model.value += row.columns[i].value + ' ';
        }
      }
    }
  };
});