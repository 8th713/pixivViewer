angular.module('app.services.config', [])
.value('config', {
  panelEnabled: true,
  fitEnabled: true,
  infoEnabled: true,
  rateEnabled: true,
  qrEnabled: true,
  tagsEnabled: true,
  descEnabled: true,
  hideScrollBar: true,
  alignLeft: true,
  margin: 20,
  panelWidth: 300
})
.factory('storage', ['config', function (config) {
  'use strict';

  var storage = chrome.storage.local,
      temp = {};

  var set = _.debounce(function () {
    storage.set(temp, function () {
      temp = {};
    });
  }, 500);

  return {
    get: function (callback) {
      storage.get(null, function (items) {
        if (chrome.runtime.lastError) {
          console.error('エラー: %s', chrome.runtime.lastError.message);
        }
        items = items || {};
        _.extend(config, items);
        callback(config);
      });
    },
    clear: function () {
      storage.clear();
    },
    watch: function (val, key) {
      this.$watch('config.' + key, function (newVal, oldVal) {
        if (newVal !== oldVal) {
          temp[key] = newVal;
          set();
        }
      });
    }
  };
}]);
