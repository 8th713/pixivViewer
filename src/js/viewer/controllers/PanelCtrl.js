angular.module('App.controllers.Panel', [])
.controller('PanelCtrl', ['$scope','keys','config','promise',
function PanelCtrl(        $scope,  keys,  config,  promise) {
  $scope.config = config.attrs;
  $scope.loading = true;

  $scope.chagePanel = function chagePanel(panel) {
    if (config.attrs.panel == panel) {
      config.attrs.panel = null;
      return;
    }
    config.attrs.panel = panel;
  };

  _.each(['desc', 'bookmark', 'comments', 'help'], function (name) {
    keys.on(name, function () {
      $scope.chagePanel(name);
    });
  });

  keys.on('fit', function fit() {
    config.attrs.fit = !config.attrs.fit;
  });

  $scope.rate = function rate(score) {
    if ($scope.rating) {
      return;
    }

    $scope.rating = true;
    $scope.pix.rate(score).finally(function finish() {
      $scope.rating = false;
    });
  };

  keys.on('rate', function () {
    $scope.$eval('pix && rate(10)');
  });

  $scope.download = function download() {
    $scope.pix.download(promise.page);
  };

  keys.on('download', function download() {
    $scope.$eval('pix && download()');
  });

  $scope.tweet = function tweet() {
    $scope.pix.tweet();
  };

  keys.on('tweet', function tweet() {
    $scope.$eval('pix && tweet()');
  });

  promise.then(onFulfilled).catch(onRejected);

  function onFulfilled(pix) {
    $scope.pix = pix;
    $scope.loading = false;
  }

  function onRejected() {
    $scope.loading = false;
    $scope.error = true;
  }
}]);
