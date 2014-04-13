angular.module('common.services.http', [])
.service('http', [  '$rootScope','$q','$http',
function httpFactory($rootScope,  $q,  $http) {
  function data2form(obj) {
    if (obj instanceof HTMLFormElement) {
      return new FormData(obj);
    }

    var result = new FormData();

    _.each(obj, function(value, key) {
      result.append(key, value);
    });
    return result;
  }

  function loadend(xhr, dfd) {
    $rootScope.$apply(function () {
      var msg;

      if (xhr.status === 200 && xhr.response) {
        msg = xhr.response;
        dfd.resolve(msg);
      } else {
        msg = new Error(xhr.status + ' (' + xhr.statusText + ')');
        dfd.reject(msg);
      }
    });
  }

  this.get = function get(url) {
    return $http({
      method: 'GET',
      url: url,
      responseType: 'document'
    });
  };

  this.post = function post(url, data, type) {
    var xhr = new XMLHttpRequest(),
        dfd = $q.defer();

    data = data2form(data);

    if (type) {
      xhr.responseType = type;
    }

    xhr.addEventListener('loadend', function () {
      loadend(this, dfd);
    });
    xhr.open('POST', url, true);
    xhr.send(data);

    return dfd.promise;
  };
}]);
