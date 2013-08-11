angular.module('app.controllers.main', [])
.controller('PvCtrl', ['$scope', 'storage', 'page', 'fetch',
function (scope, storage, page, fetch) {
  'use strict';

  var MATCH_PATTERN = /^.+\/(\d+)(?:.+)?\.(?:jpe?g|png|gif)/;

  var config, models, model, view;

  models = [];

  view = scope.view = {
    opened: null,
    loading: false,
    locked: false,
    message: ''
  };

  scope.selectors = [
    'a[href*="ranking.php"] img[src*="/img/"]',
    'a[href*="member_illust.php"] img[src*="/img/"]',
    'a[href*="member_event.php"] img[src*="/img/"]'
  ].join();

  scope.setMessage = function (str) {
    scope.view.message = str.toString();
  };

  scope.lock = function () {
    scope.view.locked = true;
  };

  scope.unlock = function () {
    scope.view.locked = false;
  };

  // load config
  storage.get(function (items) {
    config = scope.config = items;
    _.each(items, storage.watch, scope);
    scope.$watch('config.hideScrollBar', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        page.scrollBar(newVal);
      }
    });
  });

  // create model
  function create(el) {
    var model = _.findWhere(models, {id: el.src});

    if (model) {
      model.el = el;
      model.page = 0;
      return model;
    }

    var src = el.src,
        res = MATCH_PATTERN.exec(decodeURI(src));

    model = {
      id: src,
      el: el,
      page: 0,
      illustId: res && res[1]
    };

    models.push(model);
    return model;
  }

  // open view
  function onFulfill(data) {
    _.extend(model, data);
    scope.$broadcast('setPath');
  }
  function onReject(err) {
    scope.setMessage(err);
    view.loading = false;
  }
  scope.openView = function (img) {
    view.loading = true;
    model = scope.model = create(img);
    page.open();
    page.scroll(img, function () {
      view.opened = true;

      if (!model.illustId) {
        scope.setMessage('illustId not found.');
        return;
      }

      scope.setMessage('Loading page.');

      if (model.imgUrl) {
        scope.$broadcast('setPath');
      } else {
        fetch(model.illustId).then(onFulfill, onReject);
      }
    });
  };
  document.body.addEventListener('click', function handleClick(evt) {
    if (evt.button) {
      return;
    }

    var target = evt.target;

    if (target.matchesSelector('.PV-bookmark *')) {
      return;
    }

    if (target.matchesSelector(scope.selectors)) {
      scope.openView(target);
      evt.stopPropagation();
      evt.preventDefault();
    }
  });
}])
.controller('ViewCtrl', ['$scope', 'page', 'util', 'keys',
function (scope, page, util, keys) {
  'use strict';

  // load images
  function setPath() {
    var res = scope.model.imgUrl;

    if (scope.model.length > 0) {
      res += '_big_p' + scope.model.page;
    }
    res += scope.model.imgExt;
    scope.model.path = res || '';
  }
  scope.$on('setPath', setPath);

  // close view
  scope.close = function () {
    scope.view.opened = false;
    page.close();
    scope.model.path = void 0;
  };

  // change image
  function nextImage(step) {
    var max = scope.model.length - 1,
        page = scope.model.page;

    page += step;
    if (scope.model.length && max >= page && page >= 0) { // Comics.
      scope.model.page = page;
      setPath();
      return;
    }
    scope.model.path = void 0;
    nextPage(step);
  }
  function nextPage(step) {
    var els = document.querySelectorAll(scope.selectors),
        currentEl = scope.model.el,
        index, target;

    els = _.filter(els, function (el) {
      return !el.matchesSelector('.PV-hidden img');
    });

    index = els.indexOf(currentEl);
    target = els[index + step] || (step === 1 ? els[0] : els[els.length - 1]);

    scope.openView(target);
  }
  scope.move = function (evt) {
    evt.stopPropagation();
    evt.preventDefault();

    if (scope.view.loading) {
      return;
    }

    var step = evt.shiftKey ? -1 : 1;

    if (evt.ctrlKey) {
      nextPage(step);
    } else {
      nextImage(step);
    }
  };

  var next1 = nextImage.bind(null, 1),
      next2 = nextPage.bind(null, 1),
      next3 = nextImage.bind(null, -1),
      next4 = nextPage.bind(null, -1);

  keys.add(keys.Enter, next1, true);
  keys.add(keys.J, next1, true);

  keys.add([keys.CTRL, keys.Enter], next2, true);
  keys.add([keys.CTRL, keys.J], next2, true);

  keys.add([keys.SHIFT, keys.Enter], next3, true);
  keys.add(keys.K, next3, true);

  keys.add([keys.CTRL, keys.SHIFT, keys.Enter], next4, true);
  keys.add([keys.CTRL, keys.K], next4, true);

  // scroll img
  var viewEl = document.querySelector('.PV-view');
  var cancel = function () {};

  function scroll(step) {
    var val = viewEl.scrollTop;

    cancel();
    cancel = util.scroll({
      val: val + step,
      root: viewEl,
      easing: 'linear',
      duration: 200
    });
  }

  var scrollDown = scroll.bind(null, 200),
      scrollUp = scroll.bind(null, -200);

  keys.add(keys.Space, scrollDown);
  keys.add([keys.SHIFT, keys.Space], scrollUp);
}]);
