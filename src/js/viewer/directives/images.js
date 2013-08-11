angular.module('app.directives.images', [])
.directive('pvSrc', ['config', function (config) {
  'use strict';

  return function (scope, $el, attrs) {
    var el = $el[0],
        style = el.style,
        imgParent = el.parentNode,
        img;

    function onload() {
      scope.$apply(function () {
        scope.view.loading = false;
        scope.setMessage('');
      });

      el.src = this.src;
      resize();
      imgParent.hidden = false;
      img = null;
    }

    function onerror() {
      scope.$apply(function () {
        scope.view.loading = false;
        scope.setMessage('Unable to load the image.');
      });
      img = null;
    }

    function resize() {
      var parent, margin, vw, vh, ow, oh, bw, bh, by, ml, mr;

      parent = document.querySelector('.PV');
      margin = config.margin;
      vw = parent.offsetWidth  - margin * 2;
      vh = parent.offsetHeight - margin * 2;
      ow = el.naturalWidth;
      oh = el.naturalHeight;
      by = 1;
      ml = 'auto';

      if (config.fitEnabled) {
        bw = (vw < ow) ? vw / ow : 1;
        bh = (vh < oh) ? vh / oh : 1;
        by = (bw < bh) ? bw : bh;
        by = parseInt(by * 1000, 10) / 1000;
      } else if (vw < ow) {
        mr = margin + 'px';
      }

      style = el.style;
      style.width  = ow * by + 'px';
      style.height = oh * by + 'px';
      // style.marginRight = mr;
    }

    function changeConfig(newVal, oldVal) {
      if (newVal !== oldVal) {
        resize();
      }
    }
    scope.$watch('config.fitEnabled', changeConfig);
    scope.$watch('config.margin', changeConfig);
    scope.$watch(attrs.pvSrc, function changePath(value) {
      if (value !== void 0) {
        scope.view.loading = true;
        scope.setMessage('Loading image.');
        imgParent.hidden = true;

        img = new Image();
        img.onload = onload;
        img.onerror = onerror;
        setTimeout(function () {
          img.src = value;
        }, 200);
      } else {
        imgParent.hidden = true;
      }
    });
  };
}])
.directive('pvGrab', [function () {
  'use strict';

  return function (scope, $el) {
    var el = $el[0],
        imgParent = el.parentNode,
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

    el.addEventListener('dragstart', handleDrag);
    el.addEventListener('drag', handleGrab);
  };
}]);
