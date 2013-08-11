angular.module('app.services.http', [])
.factory('http', ['$rootScope', '$q', function (scope, $q) {
  'use strict';

  function fail(dfd, xhr) {
    return function () {
      scope.$apply(function () {
        var msg = xhr.status + ' (' + xhr.statusText + ')';
        dfd.reject(msg);
      });
    };
  }

  function getDocument(url) {
    var xhr = new XMLHttpRequest(),
        dfd = $q.defer();

    xhr.addEventListener('load', function () {
      scope.$apply(function () {
        if (xhr.status === 200 && xhr.response) {
          dfd.resolve(xhr.response);
        } else {
          var msg = xhr.status + ' (' + xhr.statusText + ')';
          dfd.reject(msg);
        }
      });
    });
    xhr.addEventListener('error', fail(dfd, xhr));
    xhr.responseType = 'document';
    xhr.open('GET', url, true);
    xhr.send();

    return dfd.promise;
  }

  function postForm(url, data) {
    var dfd = $q.defer(),
        xhr = new XMLHttpRequest();

    xhr.addEventListener('load', function () {
      scope.$apply(function () {
        if (xhr.response) {
          dfd.resolve(xhr.response);
        } else {
          dfd.reject('no response');
        }
      });
    });
    xhr.addEventListener('error', fail(dfd, xhr));
    xhr.open('POST', url, true);
    xhr.send(data);
    return dfd.promise;
  }

  return {
    getDocument: getDocument,
    postForm: postForm
  };
}]);
