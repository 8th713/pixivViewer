angular.module('app.services')
.factory('page', ['config', function (config) {
  var classList = document.documentElement.classList;

  return {
    scrollBar: function () {
      if (config.hideScrollBar) {
        this.hideScrollBar();
      } else {
        this.showScrollBar();
      }
    },
    hideScrollBar: function () {
      classList.add('no-scrollbar');
    },
    showScrollBar: function () {
      classList.remove('no-scrollbar');
    },
    open: function () {
      classList.add('no-iframe');
      if (config.hideScrollBar) {
        this.hideScrollBar();
      }
    },
    close: function () {
      classList.remove('no-iframe');
      this.showScrollBar();
    }
  };
}]);
