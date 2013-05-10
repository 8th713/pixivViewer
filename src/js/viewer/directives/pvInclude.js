angular.module('app.directives')
.directive('pvInclude', [function () {
  return function (scope, $el, attrs) {
    var el = $el[0];

    function submit(evt) {
      scope.model.bookmark(evt.target);
      scope.bookmarkForm = false;
      scope.$apply();
      evt.stopPropagation();
      evt.preventDefault();
      return false;
    }

    scope.$watch(attrs.pvInclude, function (value) {
      if (value) {
        el.innerHTML = value;
        el.querySelector('form').addEventListener('submit', submit);
        window.postMessage('tagSetup', '*');
      } else {
        el.textContent = '';
      }
    });
  };
}]);
