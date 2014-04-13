angular.module('App.controllers.Bookmark', [])
.controller('BookmarkCtrl', ['$scope',
function BookmarkCtrl(        $scope) {
  $scope.update = function update(form) {
    var btn = form.querySelector('input[type="submit"]');
    var btnText = btn.value;

    btn.disabled = true;
    btn.value += 'しています';

    function onFulfilled() {
      $scope.config.panel = null;
    }

    function onRejected() {
      btn.value = btnText;
      btn.disabled = false;
    }

    $scope.pix.updateBookmark(form).then(onFulfilled).catch(onRejected);
  };
}]);
