angular.module('app.directives')
.directive('pvKeyEvent', ['download', 'utils', function (download, utils) {
  return function (scope) {
    var keypress, lastTime = 0;

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);

    function handleKeyDown(evt) {
      if (!scope.opened || scope.stop || /input|textarea/i.test(evt.target.tagName)) {
        return;
      }

      var keyCode = evt.keyCode,
          distance = evt.timeStamp - lastTime;

      switch (keyCode) {
      case 13:  // Enter
        if (keypress) { return; }
        keypress = true;

        if (evt.ctrlKey) {
          scope.skip(evt.shiftKey ? -1 : 1);
        } else {
          scope.move(evt.shiftKey ? -1 : 1);
        }
        scope.$apply();
        return utils.cancelEvent(evt);
      case 74:  // J
        if (keypress) { return; }
        keypress = true;

        if (evt.ctrlKey) {
          scope.skip(1);
        } else {
          scope.move(1);
        }
        scope.$apply();
        return utils.cancelEvent(evt);
      case 75:  // K
        if (keypress) { return; }
        keypress = true;

        if (evt.ctrlKey) {
          scope.skip(-1);
        } else {
          scope.move(-1);
        }
        scope.$apply();
        return utils.cancelEvent(evt);
      case 32:  // Space
        if(distance > 210) {
          lastTime = evt.timeStamp;

          var el = document.querySelector('.PV-view'),
              val = el.scrollTop,
              step = evt.shiftKey ? -200 : 200;

          utils.scroll({
            val: val + step,
            root: el,
            easing: 'linear',
            duration: 200
          });
        }
        return utils.cancelEvent(evt);
      case 70:  // F: fit toggle
        if (keypress) { return; }
        keypress = true;
        scope.config.fitEnabled = !scope.config.fitEnabled;
        scope.$apply();
        return utils.cancelEvent(evt);
      case 72:  // H: panel toggle
        if (keypress) { return; }
        keypress = true;
        scope.config.panelEnabled = !scope.config.panelEnabled;
        scope.$apply();
        return utils.cancelEvent(evt);
      case 66:  // B: show bookmark form
        if (keypress) { return; }
        keypress = true;
        scope.showBookmark(scope.model.illustId);
        return utils.cancelEvent(evt);
      case 68:  // D: download image
        if (keypress) { return; }
        keypress = true;
        download(scope.model);
        return utils.cancelEvent(evt);
      case 83:  // S: rate 10
        if (keypress) { return; }
        keypress = true;
        scope.model.rate(10);
        return utils.cancelEvent(evt);
      case 191: // ?: show config
        if (keypress) { return; }
        keypress = true;
        if (evt.shiftKey) {
          scope.showOpt = !scope.showOpt;
          scope.$apply();
          return utils.cancelEvent(evt);
        }
        return;
      }
    }

    function handleKeyUp() {
      keypress = false;
    }
  };
}]);
