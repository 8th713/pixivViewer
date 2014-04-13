angular.module('App.directives.bkm', [])
.directive('pvBkm', ['http',
function pvBkmFactory(http) {
  return {
    scope: {
      pix: '=pvBkm',
      submit: '&'
    },
    link: function linkFn(scope, element, attr) {
      var URL = 'http://www.pixiv.net/bookmark_add.php?type=illust&illust_id=';

      function handleSubmit(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        var form = evt.target;

        scope.submit({form: form});
      }

      function onFulfilled(response) {
        var html = response.data.querySelector('.layout-body').outerHTML;

        element.html(html);
        window.postMessage('tagSetup', '*');
        element.find('form').on('submit', handleSubmit);
      }

      function onRejected() {
        element.text('フォームの取得に失敗しました');
      }

      scope.$watch(attr.pvBkm, function pixWatchAction(pix) {
        if (pix && !pix.self) {
          element.text('フォーム取得中');
          http.get(URL + pix.illustId).then(onFulfilled).catch(onRejected);
        }
      });
    }
  };
}]);
