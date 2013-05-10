angular.module('app.directives')
.directive('pvGrab', [function () {
  return function (scope, $el) {
    var el = $el[0],
        view = el.parentNode,
        x = 0, y = 0, left = 0, top = 0;

    function handleDrag(evt) {
      x = evt.clientX;
      y = evt.clientY;
      left = view.scrollLeft;
      top = view.scrollTop;
    }

    function handleGrab(evt) {
      if (!evt.clientX && !evt.clientY) {
        return;
      }
      view.scrollLeft = left - (evt.clientX - x);
      view.scrollTop  = top  - (evt.clientY - y);
    }

    el.addEventListener('dragstart', handleDrag);
    el.addEventListener('drag', handleGrab);
  };
}]);
