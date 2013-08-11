angular.module('app.services.keys', [])
.factory('keys', ['$rootScope', function (scope) {
  'use strict';

  scope = scope.$$childHead;

  var SHIFT = 1000, CTRL = 10000, ALT = 100000;
  var WAIT = 250;
  var actions = {};
  var preferentialActions = {};

  function normalizeKeyCode(evt) {
    var shift = evt.shiftKey * SHIFT;
    var ctrl = evt.ctrlKey * CTRL;
    var alt = evt.altKey * ALT;
    var key = evt.keyCode;

    return shift + ctrl + alt + key;
  }

  function invokeAction(evt) {
    var key = !scope.view.locked && normalizeKeyCode(evt);

    if (key in actions) {
      evt.stopPropagation();
      evt.preventDefault();
      actions[key]();
    }
  }

  // preferentialAction is invoked even if view is locked.
  function invokePreferentialAction(evt) {
    var key = normalizeKeyCode(evt);

    if (key in preferentialActions) {
      evt.stopPropagation();
      evt.preventDefault();
      preferentialActions[key]();
      return true;
    }
    return false;
  }

  function createCallback(func, applies) {
    return function () {
      if (applies) {
        scope.$apply(func);
      } else {
        func();
      }
    };
  }

  var input = /input|textarea/i;

  window.addEventListener('keydown', _.throttle(function (evt) {
    if (scope.view.loading || !scope.view.opened || input.test(evt.target.tagName)) {
      return;
    }
    if(!invokePreferentialAction(evt)) {
      invokeAction(evt);
    }
  }, WAIT), true);

  return {
    Enter: 13,
    ESC: 27,
    Space: 32,
    B: 66,
    C: 67,
    D: 68,
    F: 70,
    H: 72,
    J: 74,
    K: 75,
    R: 82,
    S: 83,
    T: 84,
    '/': 191,
    SHIFT: SHIFT,
    CTRL: CTRL,
    ALT: ALT,
    add: function (code, func, applies) {
      if (!_.isFunction(func)) {
        return;
      }
      if (_.isArray(code)) {
        code = code.reduce(function (p, n) {
          return p + n;
        });
      }
      actions[code] = createCallback(func, applies);
    },
    addPreferenceAction: function (code, func, applies) {
      if (!_.isFunction(func)) {
        return;
      }
      if (_.isArray(code)) {
        code = code.reduce(function (p, n) {
          return p + n;
        });
      }
      preferentialActions[code] = createCallback(func, applies);
    }
  };
}]);
