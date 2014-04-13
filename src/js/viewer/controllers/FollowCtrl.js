angular.module('App.controllers.Follow', [])
.controller('FollowCtrl', ['$scope',
function FollowCtrl(        $scope) {
  $scope.wait = false;
  $scope.restrict = 0;

  function finish() {
    $scope.wait = false;
  }

  $scope.add = function add() {
    $scope.wait = true;
    $scope.pix.addFollow($scope.restrict).finally(finish);
  };

  $scope.update = function update() {
    $scope.wait = true;
    $scope.pix.updateFollow($scope.restrict).finally(finish);
  };

  $scope.remove = function remove() {
    $scope.wait = true;
    $scope.pix.removeFollow().finally(finish);
  };
}]);
