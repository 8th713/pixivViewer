angular.module('app.controllers.share', [])
.controller('CommentsCtrl', ['$scope', 'http', 'keys',
function (scope, http, keys) {
  'use strict';

  var URL = 'http://www.pixiv.net/rpc_comment_history.php';
  var not = '<li class="comment-item PV-comments-not">No one has commented yet.</li>';

  function getComments(p) {
    var form = new FormData();

    form.append('i_id', scope.model.illustId);
    form.append('u_id', scope.model.auteurId);
    form.append('tt', scope.model.tt);
    form.append('p', p);

    return http.postForm(URL, form).then(function (response) {
      return JSON.parse(response);
    });
  }

  scope.getMore = function () {
    scope.count += 1;
    getComments(scope.count).then(function (json) {
      scope.more = json.data.more;
      scope.comments.push.apply(scope.comments, json.data.html_array);
    });
  };

  scope.show = function () {
    scope.lock();
    scope.count = 1;
    scope.comments = [];
    getComments(scope.count).then(function (json) {
      scope.more = json.data.more;
      scope.comments = json.data.html_array;
      if (!scope.comments.length) {
        scope.comments = [not];
      }
    });
  };
  keys.add(keys.C, scope.show, true);

  scope.hide = function () {
    scope.comments = false;
    scope.unlock();
  };
  scope.$on('hide', scope.hide);
}])
.controller('ShareCtrl', ['$scope', 'keys',
function (scope, keys) {
  'use strict';

  var BASE = 'http://www.pixiv.net/member_illust.php?mode=medium&illust_id=';
  var suffix = 'personalbar=0,toolbar=0,scrollbars=0,resizable=1';

  function getPosition(width, height) {
    var sh = screen.height;

    var top = sh > height ? Math.round((sh / 2) - (height / 2)) : 0;
    var left = Math.round((screen.width / 2) - (width / 2));

    return 'left='   + left   + ',' +
           'top='    + top    + ',' +
           'width='  + width  + ',' +
           'height=' + height + ',' +
           suffix;
  }

  scope.twitter = function () {
    var url = 'https://twitter.com/intent/tweet';

    url += '?text=';
    url += encodeURIComponent(scope.model.pageTitle + ' #pixiv');
    url += '&url=';
    url += encodeURIComponent(BASE + scope.model.illustId);

    window.open(url, '', getPosition(550, 450));
  };
  keys.add(keys.T, scope.twitter);
}]);
