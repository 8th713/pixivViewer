angular.module('App.controllers.Comments', [])
.controller('CommentsCtrl', ['$scope',
function CommentsCtrl(        $scope) {
  $scope.wait = false;

  $scope.get = function get() {
    $scope.wait = true;
    $scope.pix.getComments().finally(function finish() {
      $scope.wait = false;
    });
  };
}]);
