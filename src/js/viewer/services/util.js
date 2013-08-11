angular.module('app.services.util', [])
.factory('util', [function () {
  'use strict';

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
    done: function () {},
    root: document.body,
    duration: 300,
    easing: 'easeOutQuint'
  };

  /**
   * Scroll
   *
   * @param {object} options
   *   - val                {Number}
   *   - done(optional)     {Function}
   *   - root(optional)     {DOM Element}
   *   - duration(optional) {Number}
   *   - easing(optional)   {String}
   * @returns {Functin} Cancel scroll
   */
  function scroll(options) {
    var easing, root, val, begin, from, distance, duration, afId;

    function loop(now) {
      var elapsed = now - begin;

      root.scrollTop = easing(elapsed, from, distance, duration);
      if (duration < elapsed || root.scrollTop === val) {
        root.scrollTop = val;
        caf(afId);
        options.done();
        return;
      }
      afId = raf(loop);
    }

    options = _.defaults(options, scrollDefaults);

    easing = ease[options.easing] || scrollDefaults.easing;
    root = options.root;
    val = options.val;
    val = (val < 0) ? 0 : val;
    begin = performance.now();
    from = root.scrollTop;
    distance = val - from;
    duration = options.duration;
    afId = raf(loop);

    return function () {
      caf(afId);
    };
  }

  /**
   * @param {HTMLImageElement} img
   * @returns {Number}
   */
  function getPos(img) {
    return parseInt(img.y - window.innerHeight / 3, 10);
  }

  return {
    scroll: scroll,
    getPos: getPos
  };
}]);
