angular.module('App.directives.src', [])
.directive('pvSrc', [function pvSrcFactory() {
  return {
    link: function linkFn(scope, $el, attrs) {
      var src;

      function load() {
        $el.triggerHandler('load');
      }

      function changePath(newSrc) {
        if(newSrc) {
          if (src === newSrc && $el.prop('complete')) {
            setTimeout(load);
            return;
          }

          src = newSrc;
          $el.attr('src', newSrc);
          // setTimeout(function() {
          //   $el.attr('src', newSrc);
          // }, 2000);
          return;
        }
      }

      scope.$watch(attrs.pvSrc, changePath);
    }
  };
}]);
