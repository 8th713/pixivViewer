angular.module('App.controllers.Questionnaire', [])
.controller('QuestionnaireCtrl', ['$scope',
function QuestionnaireCtrl(        $scope) {
  $scope.wait = false;

  $scope.answer = function answer(stat) {
    $scope.wait = true;
    $scope.pix.answer(stat).finally(function finish() {
      $scope.wait = false;
    });
  };
}]);
