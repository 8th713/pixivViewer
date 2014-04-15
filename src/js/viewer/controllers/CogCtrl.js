angular.module('App.controllers.Cog', [])
.controller('CogCtrl', ['$scope','config',
function CogCtrl(        $scope,  config) {
  $scope.wait = false;
  $scope.config = config.attrs;

  $scope.clear = function clear() {
    $scope.wait = true;
    config.clear().finally(function finish() {
      $scope.wait = false;
    });
  };
}]);
