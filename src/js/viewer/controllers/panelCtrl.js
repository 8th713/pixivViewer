angular.module('app.controllers.panel', [])
.controller('PanelCtrl', ['$scope', 'config', 'http', 'keys',
function (scope, config, http, keys) {
  'use strict';

  keys.addPreferenceAction(keys.ESC, function () {
    scope.$broadcast('hide');
  }, true);


  // fit toggle
  function fitToggle() {
    config.fitEnabled = !config.fitEnabled;
  }
  keys.add(keys.F, fitToggle, true);

  // panel toggle
  scope.getPanelStyle = function () {
    return {
      width: config.panelWidth + 'px',
      right: config.panelEnabled ? '0px' : ('-' + config.panelWidth + 'px')
    };
  };
  function panelToggle() {
    config.panelEnabled = !config.panelEnabled;
  }
  keys.add(keys.H, panelToggle, true);

  // download image
  function replaceFn($1) {
    switch ($1) {
    case ':':
      return '：';
    case ';':
      return '；';
    case ',':
      return '，';
    case '<':
      return '＜';
    case '>':
      return '＞';
    case '"':
      return '”';
    case '/':
      return '／';
    case '*':
      return '＊';
    case '?':
      return '？';
    case '|':
      return '｜';
    case '\\':
      return '＼';
    }
  }
  function getFileName(model) {
    var page, full;

    page = model.length ? (' [' + (model.page + 1) + '/' + model.length + ']') : '';
    full = model.auteur + ' - ' + model.title + page + model.imgExt;
    return full.replace(/:|;|,|<|>|"|\/|\*|\?|\||\\/g, replaceFn);
  }
  scope.download = function () {
    var dummy;

    if (!scope.model.path) {
      return;
    }

    dummy = document.createElement('a');
    dummy.download = getFileName(scope.model);
    dummy.href = scope.model.path;
    dummy.dispatchEvent(new window.Event('click'));
  };
  keys.add(keys.D, scope.download);
}])
.controller('BookmarkCtrl', ['$scope', 'http', 'keys',
function (scope, http, keys) {
  'use strict';

  var BASE_URL = 'http://www.pixiv.net/bookmark_add.php';
  var BOOKMARK_FORM_URL = BASE_URL + '?type=illust&illust_id=';

  scope.submit = function (evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var button = evt.target.querySelector('input[type="submit"]');
    var formData = new FormData(evt.target);

    http.postForm(BASE_URL, formData).then(function () {
      scope.model.bookmarkState = true;
      scope.hide();
    }, scope.hide);
    button.disabled = true;
    button.value = button.value + 'しています';
  };

  scope.show = function () {
    scope.lock();
    http.getDocument(BOOKMARK_FORM_URL + scope.model.illustId).then(function (doc) {
      scope.bookmarkForm = doc.querySelector('.layout-body').outerHTML;
      window.postMessage('tagSetup', '*');
    });
  };
  keys.add(keys.B, scope.show, true);

  scope.hide = function () {
    scope.bookmarkForm = false;
    scope.unlock();
  };
  scope.$on('hide', scope.hide);
}])
.controller('FavCtrl', ['$scope', 'http',
function (scope, http) {
  'use strict';

  var ADD_URL = 'http://www.pixiv.net/bookmark_add.php',
      MOD_URL = 'http://www.pixiv.net/bookmark_setting.php',
      REM_URL = 'http://www.pixiv.net/rpc_group_setting.php';

  function enable() {
    scope.model.favoriteState = true;
    scope.hide();
  }

  function disable() {
    scope.model.favoriteState = false;
    scope.hide();
  }

  scope.addFav = function () {
    var form = new FormData();

    form.append('mode', 'add');
    form.append('type', 'user');
    form.append('user_id', scope.model.auteurId);
    form.append('tt', scope.model.tt);
    form.append('from_sid', '');
    form.append('restrict', scope.restrict);
    form.append('left_column', 'OK');

    scope.view.showFav = false;
    http.postForm(ADD_URL, form).then(enable);
  };
  scope.modFav = function () {
    var form = new FormData();

    form.append('type', 'user');
    form.append('user_id', scope.model.auteurId);
    form.append('tt', scope.model.tt);
    form.append('from_sid', '');
    form.append('restrict', scope.restrict);
    form.append('left_column', 'OK');

    scope.view.showFav = false;
    http.postForm(MOD_URL, form).then(enable);
  };
  scope.removeFav = function () {
    var form = new FormData();

    form.append('mode', 'del');
    form.append('type', 'bookuser');
    form.append('id', scope.model.auteurId);

    scope.view.showFav = false;
    http.postForm(REM_URL, form).then(disable);
  };

  scope.show = function () {
    scope.showFav = true;
    scope.lock();
  };

  scope.hide = function () {
    scope.showFav = false;
    scope.unlock();
  };
  scope.$on('hide', scope.hide);
}])
.controller('OptionCtrl', ['$scope', 'keys',
function (scope, keys) {
  'use strict';

  scope.clear = function () {
    if(window.confirm('設定を消去しページをリロードします。')) {
      chrome.storage.local.clear(function () {
        location.reload(false);
      });
    }
  };

  scope.show = function () {
    scope.lock();
    scope.showOpt = true;
  };

  scope.hide = function () {
    scope.showOpt = false;
    scope.unlock();
  };
  scope.$on('hide', scope.hide);

  function display() {
    var act = scope.showOpt ? 'hide' : 'show';

    scope[act]();
  }
  keys.addPreferenceAction([keys.SHIFT, keys['/']], display, true);
}])
.controller('RateCtrl', ['$scope', 'http', 'keys',
function (scope, http, keys) {
  'use strict';

  var RATING_URL = 'http://www.pixiv.net/rpc_rating.php';

  scope.rate = function (score) {
    var model = scope.model;
    var form = new FormData();

    form.append('mode', 'save');
    form.append('i_id', model.illustId);
    form.append('u_id', model.myId);
    form.append('qr', model.qr);
    form.append('score', score);

    return http.postForm(RATING_URL, form).then(function () {
      model.rtc += 1;
      model.rtt += score;
      model.score = score;
    });
  };

  var perfect = scope.rate.bind(scope, 10);
  keys.add(keys.S, perfect);
}])
.controller('QuestionnaireCtrl', ['$scope', 'http',
function (scope, http) {
  'use strict';

  var RATING_URL = 'http://www.pixiv.net/rpc_rating.php';

  scope.answer = function (stat) {
    var model = scope.model;
    var form = new FormData();

    form.append('mode', 'save2');
    form.append('i_id', model.illustId);
    form.append('u_id', model.myId);
    form.append('qr', model.qr);
    form.append('num', stat.id);

    return http.postForm(RATING_URL, form).then(function () {
      model.questionnaire.answered = true;
      stat.active = true;
      stat.count += 1;
    });
  };
}]);
