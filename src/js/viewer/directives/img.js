angular.module('App.directives.img', [])
.directive('pvLoad', ['$parse', function pvLoadFactory($parse) {
  return {
    compile: function compileFn($el, attr) {
      var fn = $parse(attr.pvLoad);

      return function linkFn(scope, el) {
        el.on('load', function (evt) {
          scope.$apply(function() {
            fn(scope, {$event: evt});
          });
        });
      };
    }
  };
}])
.directive('pvErr', ['$parse', function pvErrFactory($parse) {
  return {
    compile: function compileFn($el, attr) {
      var fn = $parse(attr.pvErr);

      return function linkFn(scope, el) {
        el.on('error', function (evt) {
          scope.$apply(function() {
            fn(scope, {$event: evt});
          });
        });
      };
    }
  };
}])
.directive('pvGrab', [function pvGrabFactory() {
  return function linkFn(scope, $el) {
    var imgParent = $el[0].parentNode,
        x = 0, y = 0, left = 0, top = 0;

    function handleDrag(evt) {
      x = evt.clientX;
      y = evt.clientY;
      left = imgParent.scrollLeft;
      top = imgParent.scrollTop;
    }

    function handleGrab(evt) {
      if (!evt.clientX && !evt.clientY) {
        return;
      }
      imgParent.scrollLeft = left - (evt.clientX - x);
      imgParent.scrollTop  = top  - (evt.clientY - y);
    }

    $el.on('dragstart', handleDrag);
    $el.on('drag', handleGrab);
  };
}]);
