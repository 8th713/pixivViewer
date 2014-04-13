angular.module('App.controllers.Cog', [])
.controller('CogCtrl', ['$scope','config',
function CogCtrl(        $scope,  config) {
  $scope.wait = false;
  $scope.config = config.attrs;
  $scope.$watch('config.scrollbar', configScrollWatchAction);

  var classList = document.documentElement.classList;

  function configScrollWatchAction(value) {
    if (value) {
      classList.remove('no-scrollbar');
    } else {
      classList.add('no-scrollbar');
    }
  }

  $scope.clear = function clear() {
    $scope.wait = true;
    config.clear().finally(function finish() {
      $scope.wait = false;
    });
  };
}]);
