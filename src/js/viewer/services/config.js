angular.module('app.services')
.value('config', {
  panelEnabled: true,
  fitEnabled: true,
  infoEnabled: true,
  rateEnabled: true,
  tagsEnabled: true,
  descEnabled: true,
  commentEnabled: false,
  hideScrollBar: true,
  alignLeft: true,
  margin: 20,
  panelWidth: 300
})
.factory('storage', ['config', function (config) {
  var storage = chrome.storage.local,
      defaults = angular.copy(config),
      save = _.debounce(set, 1000),
      obj = {};

  return {
    get: function (callback) {
      storage.get(null, function (items) {
        // Detects error.
        if (chrome.runtime.lastError) {
          console.error('エラー: %i', chrome.runtime.lastError.message);
        }
        if (!items) {
          console.error('エラー: ストレージが読み込めていない.');
          items = {};
        }

        _.extend(config, items);
        callback(config);
      });
    },
    clear: function (callback) {
      storage.clear(function () {
        callback(defaults);
      });
    },
    watch: function (val, key) {
      this.$watch('config.' + key, function (newVal, oldVal) {
        if (newVal !== oldVal) {
          obj[key] = newVal;
          save();
        }
      });
    }
  };

  function set() {
    storage.set(obj, reset);
  }

  function reset() {
    obj = {};
  }
}]);
