angular.module('App.services.config', [])
.factory('config', [  '$rootScope','$q',
function configFactory($rootScope,  $q) {
  var storage = chrome.storage.local;
  var configDef = {
    panel: null,
    fit: true,

    meta: true,
    chart: true,
    caption: true,
    tags: true,

    align: false,
    scrollbar: false,
    width: 300,
    margin: 20,
    smallStamp: false
  };
  var attrs = {};

  function load() {
    var dfd = $q.defer();

    storage.get(configDef, function callback(obj) {
      _.each(obj, defineProperty, attrs);
      $rootScope.$apply(function() {
        dfd.resolve();
      });
    });

    return dfd.promise;
  }

  function clear() {
    var dfd = $q.defer();

    storage.clear(function() {
      _.each(configDef, defineProperty, attrs);
      $rootScope.$apply(function() {
        dfd.resolve();
      });
    });

    return dfd.promise;
  }

  function defineProperty(val, key) {
    var value = val;

    delete this[key];

    Object.defineProperty(this, key, {
      get : function get() {
        return value;
      },
      set : function set(newValue) {
        value = newValue;
        save(value, key);
      },
      enumerable : true,
      configurable : true
    });
  }

  var tmp  = {};
  var save = _.debounce(function save(val, key) {
    tmp[key] = val;
    storage.set(tmp, function clean() {
      tmp  = {};
    });
  }, 300);

  load();

  return {
    attrs: attrs,
    load: load,
    clear: clear
  };
}]);
