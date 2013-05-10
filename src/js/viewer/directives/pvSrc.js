angular.module('app.directives')
.directive('pvSrc', ['$http', 'config', function ($http, config) {
  return function (scope, $el, attrs) {
    var el = $el[0], style = el.style, view = el.parentNode;

    function onload() {
      scope.stop = false;
      scope.model.message = '';
      scope.$apply();
      el.src = this.src;
      resize();
      view.hidden = false;
    }

    function onerror() {
      scope.model.message = 'Unable to load the image.';
      scope.$apply();
    }

    function preload(val) {
      view.hidden = true;
      scope.stop = true;
      scope.model.message = 'Loading image.';

      var img = new Image();

      img.onload = onload;
      img.onerror = onerror;
      img.src = val;
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

    scope.$watch('config.fitEnabled', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        resize();
      }
    });

    scope.$watch('config.margin', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        resize();
      }
    });

    scope.$watch(attrs.pvSrc, function (value) {
      if (value !== void 0) {
        preload(value);
      } else {
        view.hidden = true;
      }
    });
  };
}]);
