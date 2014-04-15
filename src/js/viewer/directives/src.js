angular.module('App.directives.src', [])
.directive('pvSrc', [function pvSrcFactory() {
  return {
    link: function linkFn(scope, $el, attrs) {
      function changePath(newSrc) {
        if(newSrc) {
          $el.attr('src', newSrc);
          return;
        }
      }

      scope.$watch(attrs.pvSrc, changePath);
    }
  };
}]);
