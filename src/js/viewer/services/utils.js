angular.module('utils', [])
.factory('utils', [function () {
  var raf = window.requestAnimationFrame,
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
   * @param {object} options
   *   - val                {Number}
   *   - done(optional)     {Function}
   *   - root(optional)     {DOM Element}
   *   - duration(optional) {Number}
   *   - easing(optional)   {String}
   * @returns {Promise}
   */
  function scroll(options) {
    var easing, root, val, begin, from, distance, duration;

    function loop(now) {
      var elapsed = now - begin;

      root.scrollTop = easing(elapsed, from, distance, duration);
      if (duration < elapsed || root.scrollTop === val) {
        root.scrollTop = val;
        options.done();
        return;
      }
      raf(loop);
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
    raf(loop);
  }

  /**
   * @param {HTMLImageElement} img
   * @returns {Number}
   */
  function getPos(img) {
    return parseInt(img.y - window.innerHeight / 3, 10);
  }

  /**
   * @param {Object} obj
   * @returns {String}
   */
  function param(obj) {
    return _.map(obj, function (val, key) {
      return encodeURIComponent(key) + "=" + encodeURIComponent(val);
    }).join("&");
  }

  /**
   * @param {DOM Event Object} evt
   * @returns {Boolean=false}
   */
  function cancelEvent(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    return false;
  }

  return {
    scroll: scroll,
    getPos: getPos,
    param: param,
    cancelEvent: cancelEvent
  };
}]);
