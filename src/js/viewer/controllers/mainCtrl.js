angular.module('app.controllers')
.controller('MainCtrl', [
  '$scope', 'config', 'storage', 'Model',
  'page', 'bookmark', 'download', 'utils',
  function (scope, config, storage, Model, page, bookmark, download, utils) {
    _.extend(scope, {
      config: config,
      baseUrl: 'http://www.pixiv.net/member_illust.php',
      opened: false,
      stop: false,
      showFav: false,
      restrict: 0,
      showOpt: false,
      init: function (img) {
        utils.scroll({
          val: utils.getPos(img),
          done: function () {
            scope.open(img);
            scope.$apply();
          }
        });
      },
      open: function (img) {
        this.opened = true;
        this.model = Model.create(img);

        if (this.model.illustId) {
          this.model.message = 'Loading page.';
        } else {
          this.model.message = 'illustId not found.';
          return;
        }

        if (this.model.imgUrl) {
          this.model.setPath();
        } else {
          this.model.fetch();
        }
      },
      move: function (step) {
        if (this.stop) {
          return;
        }

        var model = this.model,
            max = model.length - 1,
            page = model.page;

        page += step;
        if (model.length && max >= page && page >= 0) { // Comics.
          model.page = page;
          model.setPath();
          return;
        }
        model.path = void 0;
        this.skip(step);
      },
      skip: function (step) {
        var els = document.querySelectorAll(selectors),
            currentEl = this.model.el,
            index, target;

        els = _.filter(els, function (el) {
          return !el.matchesSelector('.PV-hidden img');
        });

        index = _.indexOf(els, currentEl);
        target = els[index + step];

        if (!target) {
          if (step === 1) {
            target = els[0];
          } else {
            target = els[els.length - 1];
          }
        }

        scope.bookmarkForm = false;
        scope.showFav = false;
        scope.showOpt = false;
        scope.init(target);
      },
      handleRemove: function (evt) {
        this.opened = false;
        page.close();
        this.model.path = void 0;
        return utils.cancelEvent(evt);
      },
      handleMove: function (evt) {
        this.move(evt.shiftKey ? -1 : 1);
        return utils.cancelEvent(evt);
      },
      getPanelStyle: function () {
        return {
          width: config.panelWidth + 'px',
          right: config.panelEnabled ? '0px' : ('-' + config.panelWidth + 'px')
        };
      },
      showBookmark: function (illustId) {
        bookmark.get(illustId).then(function (str) {
          scope.bookmarkForm = str;
        });
      },
      download: download,
      addFav: function () {
        this.model.addFavorite(this.restrict);
        this.showFav = false;
      },
      modFav: function () {
        this.model.modFavorite(this.restrict);
        this.showFav = false;
      },
      removeFav: function () {
        this.model.removeFavorite();
        this.showFav = false;
      },
      clear: function () {
        storage.clear(function (value) {
          _.extend(config, value);
          scope.$apply();
        });
      }
    });

    storage.get(function callback() {
      _.each(config, storage.watch, scope);
      scope.$watch('config.hideScrollBar', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          page.scrollBar(newVal);
        }
      });
      scope.$apply();
    });

    document.body.addEventListener('click', handleClick);

    var selectors = [
      'a[href*="ranking.php"] img[src*="/img/"]',
      'a[href*="member_illust.php"] img[src*="/img/"]',
      'a[href*="member_event.php"] img[src*="/img/"]'
    ].join();

    function handleClick(evt) {
      var target = evt.target;

      if ( evt.button === 0 && target.matchesSelector(selectors)) {
        page.open();
        scope.init(target);
        return utils.cancelEvent(evt);
      }
    }
  }
]);
