angular.module('App.directives.fit', [])
.directive('pvFit', [function pvFitFactory() {
  return {
    controller: ['$element', 'config', function Ctrl($el, config) {
      this.resize = function resize() {
        var parent = document.querySelector('.PV-main');
        var el = $el[0];
        var style = el.style;
        var attrs = config.attrs;
        var margin, vw, vh, ow, oh, bw, bh, by;

        margin = attrs.margin;
        vw = parent.offsetWidth  - margin * 2;
        vh = parent.offsetHeight - margin * 2;
        ow = el.naturalWidth;
        oh = el.naturalHeight;
        by = 1;

        if (attrs.fit) {
          bw = (vw < ow) ? vw / ow : 1;
          bh = (vh < oh) ? vh / oh : 1;
          by = (bw < bh) ? bw : bh;
          by = parseInt(by * 1000, 10) / 1000;
        }

        style.width  = ow * by + 'px';
        style.height = oh * by + 'px';
      };
    }],
    link: function linkFn(scope, $el, attrs, ctrl) {
      scope.$watch('config.fit',    change);
      scope.$watch('config.margin', change);

      function change(newValue, oldValue) {
        if (newValue !== oldValue) {
          ctrl.resize();
        }
      }

      var resize = _.debounce(ctrl.resize, 150);

      window.addEventListener('resize', resize);
      $el.on('$destroy', function() {
        window.removeEventListener('resize', resize);
      });
    }
  };
}]);
