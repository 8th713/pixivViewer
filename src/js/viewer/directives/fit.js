angular.module('App.directives.fit', [])
.directive('pvFit', [function pvFitFactory() {
  return {
    controller: ['$element', 'config', function Ctrl($el, config) {
      var parent = document.querySelector('.PV-main');
      var el = $el[0];
      var style = el.style;

      this.resize = function resize() {
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
      scope.$watch(attrs.pvFit, ctrl.resize);
      scope.$watch('config.margin', ctrl.resize);

      $el.on('load', ctrl.resize);

      var resize = _.debounce(ctrl.resize);
      window.addEventListener('resize', resize);
    }
  };
}]);
