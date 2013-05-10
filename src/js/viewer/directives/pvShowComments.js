angular.module('app.directives')
.directive('pvShowComments', [function () {
  return function (scope, $el, attrs) {
    scope.$watch(attrs.pvShowComments, function (value) {
      if (value && !scope.model.comments) {
        scope.model.getComments();
      }
    });
  };
}]);
