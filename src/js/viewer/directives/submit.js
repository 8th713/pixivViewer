angular.module('app.directives.submit', [])
.directive('pvSubmit', ['$parse', function ($parse) {
  'use strict';

  return function (scope, $el, attrs) {
    var fn = $parse(attrs.pvSubmit);

    function bind() {
      $el.find('form').bind('submit', function(event) {
        scope.$apply(function() {
          fn(scope, {$event: event});
        });
      });
    }

    scope.$watch(attrs.ngBindHtmlUnsafe, function (value) {
      if (value) {
        bind();
      }
    });
  };
}]);
