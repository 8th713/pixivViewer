angular.module('app.services')
.factory('bookmark', ['$q', '$rootScope', 'utils', function ($q, $rootScope, utils) {
  var URL = 'http://www.pixiv.net/bookmark_add.php?',
      SELECTOR = '.layout-body';

  return {
    add: function (form) {
      var dfd, data, xhr;

      dfd = $q.defer();
      data = new FormData(form);

      xhr = new XMLHttpRequest();
      xhr.addEventListener('load', function () {
        dfd.resolve();
        $rootScope.$apply();
      });
      xhr.responseType = 'document';
      xhr.open('POST', URL, true);
      xhr.send(data);
      return dfd.promise;
    },
    get: function (illustId) {
      var dfd, data, xhr;

      dfd = $q.defer();
      data = utils.param({
        type: 'illust',
        illust_id: illustId
      });

      xhr = new XMLHttpRequest();
      xhr.addEventListener('load', function (evt) {
        dfd.resolve(evt.target.response.querySelector(SELECTOR).innerHTML);
        $rootScope.$apply();
      });
      xhr.responseType = 'document';
      xhr.open('GET', URL + data, true);
      xhr.send();
      return dfd.promise;
    }
  };
}])
.factory('favorite', ['$http', 'utils', function ($http, utils) {
  var ADD_URL = 'http://www.pixiv.net/bookmark_add.php',
      MOD_URL = 'http://www.pixiv.net/bookmark_setting.php',
      REM_URL = 'http://www.pixiv.net/rpc_group_setting.php';

  $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';

  return {
    add: function add(restrict, model) {
      var data = utils.param({
        mode: 'add',
        type: 'user',
        user_id: model.auteurId,
        tt: model.tt,
        from_sid: '',
        restrict: restrict,
        left_column: 'OK'
      });

      return $http.post(ADD_URL, data);
    },
    modify: function modify(restrict, model) {
      var data = utils.param({
        type: 'user',
        user_id: model.auteurId,
        tt: model.tt,
        from_sid: '',
        restrict: restrict,
        left_column: 'OK'
      });

      return $http.post(MOD_URL, data);
    },
    remove: function remove(model) {
      var data = utils.param({
        mode: 'del',
        type: 'bookuser',
        id: model.auteurId
      });

      return $http.post(REM_URL, data);
    }
  };
}])
.factory('rate', ['$http', 'utils', function ($http, utils) {
  var RATING_URL = 'http://www.pixiv.net/rpc_rating.php';

  $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';

  return {
    set: function set(score, model) {
      var data = utils.param({
        mode: 'save',
        i_id: model.illustId,
        u_id: model.myId,
        qr: model.qr,
        score: score
      });

      return $http.post(RATING_URL, data);
    }
  };
}])
.factory('comments', ['$http', 'utils', function ($http, utils) {
  var COMMENTS_URL = 'http://www.pixiv.net/rpc_comment_history.php';

  $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';

  return {
    get: function get(model) {
      var data = utils.param({
        i_id: model.illustId,
        u_id: model.auteurId,
        tt: model.tt
      });

      return $http.post(COMMENTS_URL, data);
    }
  };
}]);
