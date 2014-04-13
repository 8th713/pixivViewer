angular.module('App.controllers.Main', [])
.controller('MainCtrl', ['$scope','keys','scroller','page','config','promise',
function MainCtrl(        $scope,  keys,  scroller,  page,  config,  promise) {
  $scope.config = config.attrs;
  $scope.page   = 0;
  $scope.msg    = 'データを取得中';

  $scope.close = function close() {
    page.remove();
  };

  $scope.move = function move(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var pix = $scope.pix;

    if (evt.ctrlKey || !pix || !pix.comic) {
      page[evt.shiftKey ? 'prev' : 'next']();
    } else {
      (evt.shiftKey ? prev : next)();
    }
  };

  $scope.load = function load() {
    $scope.msg = null;
  };

  $scope.err = function err() {
    $scope.msg = '画像を読み込めません';
  };

  function next() {
    var pix = $scope.pix;

    if (pix && pix.hasPage($scope.page + 1)) {
      $scope.msg = '画像を読込中';
      $scope.page++;
      promise.page = $scope.page;
      return;
    }
    page.next();
  }

  keys.on('nextIllust', next);

  function prev() {
    var pix = $scope.pix;

    if (pix && pix.hasPage($scope.page - 1)) {
      $scope.msg = '画像を読込中';
      $scope.page--;
      promise.page = $scope.page;
      return;
    }
    page.prev();
  }

  keys.on('prevIllust', prev);

  var scroll = scroller({
    root: document.querySelector('.PV-view'),
    easing: 'linear',
    duration: 200
  });

  keys.on('scrollDown', 'keydown', function scrollDown() {
    scroll.by(200);
  });

  keys.on('scrollUp', 'keydown', function scrollUp() {
    scroll.by(-200);
  });

  promise.page = $scope.page;
  promise.then(onFulfilled).catch(onRejected);

  function onFulfilled(pix) {
    $scope.pix = pix;
    $scope.msg = '画像を読込中';
    // console.info(pix);
  }

  function onRejected(err) {
    $scope.pix = null;
    $scope.msg = 'ページを読み込めませんでした';
    console.error(err.message);
  }
}]);
