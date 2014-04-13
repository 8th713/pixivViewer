angular.module('common.services.scroller', [])
.factory('scroller', [  '$q',
function scrollerFactory($q) {
  var raf = window.requestAnimationFrame,
      caf = window.cancelAnimationFrame,
      performance = window.performance;

  var ease = {
    linear: function linear(t, b, c, d) {
      return c * t / d + b;
    },
    easeOutQuint: function easeOutQuint(t, b, c, d) {
      return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    }
  };

  var scrollDefaults = {
    root: document.body,
    duration: 300,
    easing: 'easeOutQuint'
  };

  /**
   * Scroll
   *
   * @param {object} options
   *   - root(optional)     {DOM Element}
   *   - duration(optional) {Number}
   *   - easing(optional)   {String}
   */
  return function scroller(options) {
    options = _.defaults(options || {}, scrollDefaults);
    var root = options.root;
    var easing = ease[options.easing] || scrollDefaults.easing;
    var duration = options.duration;
    var afId;
    var dfd = $q.defer();

    return {
      to: function to(end) {
        this.cancel();

        var begin, start, distance;

        function loop(now) {
          var elapsed = now - begin;

          root.scrollTop = easing(elapsed, start, distance, duration);
          if (duration < elapsed || root.scrollTop === end) {
            root.scrollTop = end;
            caf(afId);
            dfd.resolve();
            return;
          }
          afId = raf(loop);
        }

        dfd = $q.defer();
        begin = performance.now();
        start = root.scrollTop;
        distance = end - start;
        afId = raf(loop);
        return dfd.promise;
      },
      by: function by(distance) {
        this.cancel();

        var begin, start, end;

        function loop(now) {
          var elapsed = now - begin;

          root.scrollTop = easing(elapsed, start, distance, duration);
          if (duration < elapsed || root.scrollTop === end) {
            root.scrollTop = end;
            caf(afId);
            dfd.resolve();
            return;
          }
          afId = raf(loop);
        }

        dfd = $q.defer();
        begin = performance.now();
        start = root.scrollTop;
        end   = start + distance;
        afId  = raf(loop);
        return dfd.promise;
      },
      cancel: function cancel() {
        caf(afId);
        dfd.reject();
      }
    };
  };
}]);
