angular.module('Pixiv', ['Pixiv.services.dquery'])
.factory('classMethods', [  '$cacheFactory','$q','$sce','http',
function classMethodsFactory($cacheFactory,  $q,  $sce,  http){
  var models = $cacheFactory('models', {capacity: 10});

  return {
    query: function query(src) {
      var IMG_PAGE_URL = 'http://www.pixiv.net/member_illust.php?mode=medium&illust_id=';
      var MATCH_PATTERN = /^.+\/(\d+)(?:.+)?\.(?:jpe?g|png|gif)/;

      var result = MATCH_PATTERN.exec(decodeURI(src));
      var id = result && result[1];
      var pixInstance;
      var Pix = this;

      if (id) {
        this.lastId = id;

        if (pixInstance = models.get(id)) {
          return $q.when(pixInstance);
        }

        return http.get(IMG_PAGE_URL + id)
          .then(onFulfilled, onRejected);
      }

      function onFulfilled(response) {
        var pixInstance = new Pix(response.data);

        models.put(pixInstance.illustId, pixInstance);
        return pixInstance;
      }

      function onRejected(response) {
        return $q.reject(new Error(['GET', response.config.url, response.status].join(' ')));
      }

      this.lastId = null;
      return onRejected('illustId not found.');
    },
    removeLazy: function removeLazy(parent) {
      return _.map(parent.querySelectorAll('._comment-item'), omitComment);

      function omitComment(el) {
        _.each(el.querySelectorAll('img'), removeFilter);

        var ul = el.querySelector('ul');

        if (ul) { ul.remove(); }

        return $sce.trustAsHtml(el.outerHTML);
      }

      function removeFilter(img) {
        img.src = img.dataset.src;
        delete img.dataset.filter;
        delete img.dataset.src;
      }
    },
    stats: function stats(ths, answer) {
      return _.map(ths, el2stat);

      function el2stat(th, index) {
        var span = th.nextSibling.firstChild;
        var name = th.textContent;

        return {
          id: index + 1,
          name: name,
          count: +span.textContent,
          active: answer === name
        };
      }
    }
  };
}])
.factory('instanceMethods', [  '$q','http','notes','classMethods',
function instanceMethodsFactory($q,  http,  notes,  Pix){
  function compile(str) {
    var args = _.rest(arguments);

    return str.replace(/%s/g, function () {
      return args.shift();
    });
  }

  return {
    hasPage: function hasPage(page) {
      if (this.comic && page >= 0 && this.length > page) {
        return true;
      }
      return false;
    },
    getSrc: function getSrc(page) {
      if (this.comic && 0 <= page && page <= this.length) {
        page = '_big_p' + page;
      } else {
        page = '';
      }
      return this.prefix + page + this.suffix;
    },
    getFileName: function getFileName(page) {
      var full;

      page = this.comic ? compile(' [%s-%s]', page + 1, this.length) : '';
      full = compile('%s - %s%s%s', this.userName, this.illustTitle, page, this.suffix);
      return full.replace(/:|;|,|<|>|"|\/|\*|\?|\||\\/g, replaceFn);

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
    },
    download: function download(page) {
      var dummy;

      dummy = document.createElement('a');
      dummy.download = this.getFileName(page);
      dummy.href = this.getSrc(page);
      dummy.dispatchEvent(new window.Event('click'));
    },
    tweet: function tweet() {
      var url = 'http://www.pixiv.net/member_illust.php?mode=medium&illust_id=';
      var text = encodeURIComponent(compile('%s | %s #pixiv', this.illustTitle, this.userName));
      var page = encodeURIComponent(url + this.illustId);

      var sh = screen.height;
      var top = sh > 550 ? Math.round((sh / 2) - (550 / 2)) : 0;
      var left = Math.round((screen.width / 2) - (450 / 2));
      var opts = 'left='   + left + ',' +
                 'top='    + top  + ',' +
                 'width='  + 550  + ',' +
                 'height=' + 450  + ',' +
                 'personalbar=0,toolbar=0,scrollbars=0,resizable=1';

      url = 'https://twitter.com/intent/tweet?text=%s&url=%s';
      window.open(compile(url, text, page), '', opts);
    },
    updateBookmark: function updateBookmark(element) {
      if (this.self) {
        notes.error(this.illustTitle + ': 自分の作品はブックマークできません');
        return $q.reject();
      }

      var pix = this;

      function successCallback(data) {
        if (data) {
          pix.bookmark = true;
          return true;
        }
        return $q.reject();
      }

      function errorCallback() {
        notes.error(pix.illustTitle + ': ブックマークできませんでした');
        return $q.reject();
      }

      return http.post('http://www.pixiv.net/bookmark_add.php', element)
                 .then(successCallback)
                 .catch(errorCallback);
    },
    addFollow: function addFollow(restrict) {
      if (this.self) {
        notes.error(this.userName + ': 自分はフォロー出来ません');
        return $q.reject();
      }

      if (this.favorite) {
        notes.error(this.userName + ': フォロー済みです');
        return $q.reject();
      }

      var pix = this;
      var data = {
        mode: 'add',
        type: 'user',
        user_id: this.userId,
        tt: this.token,
        from_sid: '',
        restrict: restrict,
        left_column: 'OK'
      };

      function successCallback() {
        pix.favorite = true;
        return true;
      }

      function errorCallback() {
        notes.error(pix.userName + ': フォローできませんでした');
        return $q.reject();
      }

      return http.post('http://www.pixiv.net/bookmark_add.php', data)
                 .then(successCallback)
                 .catch(errorCallback);
    },
    updateFollow: function updateFollow(restrict) {
      if (this.self) {
        notes.error(this.userName + ': 自分はフォロー出来ません');
        return $q.reject();
      }

      if (!this.favorite) {
        notes.error(this.userName + ': フォローされていません');
        return $q.reject();
      }

      var pix = this;
      var data = {
        type: 'user',
        user_id: this.userId,
        tt: this.token,
        from_sid: '',
        restrict: restrict,
        left_column: 'OK'
      };

      function successCallback() {
        pix.favorite = true;
        return true;
      }

      function errorCallback() {
        notes.error(pix.userId + ': フォロー更新できませんでした');
        return $q.reject();
      }

      return http.post('http://www.pixiv.net/bookmark_setting.php', data)
                 .then(successCallback)
                 .catch(errorCallback);
    },
    removeFollow: function removeFollow() {
      if (this.self) {
        notes.error(this.userName + ': 自分はフォロー出来ません');
        return $q.reject();
      }

      if (!this.favorite) {
        notes.error(this.userName + ': フォローされていません');
        return ;
      }

      var pix = this;
      var data = {
        mode: 'del',
        type: 'bookuser',
        id: this.userId
      };

      function successCallback(data) {
        if (data.type === 'bookuser') {
          pix.favorite = false;
          return true;
        }
        return $q.reject();
      }

      function errorCallback() {
        notes.error(pix.userName + ': フォロー解除できませんでした');
        return $q.reject();
      }

      return http.post('http://www.pixiv.net/rpc_group_setting.php', data, 'json')
                 .then(successCallback)
                 .catch(errorCallback);
    },
    rate: function rate(score) {
      if (this.self) {
        notes.error(this.illustTitle + ': 自分の作品は評価できません');
        return $q.reject();
      }

      if (this.rated) {
        notes.error(this.illustTitle + ': すでに評価済みです');
        return $q.reject();
      }

      var pix = this;
      var data = {
        mode: 'save',
        i_id: this.illustId,
        u_id: this.user.id,
        qr:   +this.hasQuestionnaire,
        tt: this.token,
        score: score
      };

      function successCallback(data) {
        if (data.score) {
          pix.rtc += 1;
          pix.rtt += score;
          pix.score = score;
          pix.rated = true;
          notes.log(pix.illustTitle + ': ' + score + '点つけました');
          return true;
        }
        return $q.reject();
      }

      function errorCallback() {
        notes.error(pix.illustTitle + ': 評価失敗');
        return $q.reject();
      }

      return http.post('http://www.pixiv.net/rpc_rating.php', data, 'json')
                 .then(successCallback)
                 .catch(errorCallback);
    },
    answer: function answer(stat) {
      if (this.self) {
        notes.error(this.illustTitle + ': 自作のアンケートには回答できません');
        return $q.reject();
      }

      if (this.answered) {
        notes.error(this.illustTitle + ': 回答済です');
        return $q.reject();
      }

      var pix = this;
      var data = {
        mode: 'save2',
        i_id: this.illustId,
        u_id: this.user.id,
        qr:   +this.hasQuestionnaire,
        tt: this.token,
        num:  stat.id
      };

      function successCallback(data) {
        if ('keyword' in data) {
          pix.answered = true;
          stat.active = true;
          stat.count += 1;
          return true;
        }
        return $q.reject();
      }

      function errorCallback() {
        notes.error(pix.illustTitle + ': 回答失敗');
        return $q.reject();
      }

      return http.post('http://www.pixiv.net/rpc_rating.php', data, 'json')
                 .then(successCallback)
                 .catch(errorCallback);
    },
    getComments: function getComments() {
      var pix = this;
      var data = {
        i_id: this.illustId,
        u_id: this.userId,
        tt:   this.token,
        p:    this.p + 1
      };

      function successCallback(data) {
        var newComments;

        if (data.message === 'ok') {
          var parent = angular.element('<div/>');

          parent.html(data.body.html);
          newComments = Pix.removeLazy(parent[0]);

          pix.comments.push.apply(pix.comments, newComments);
          pix.more = data.body.more;
          pix.p++;
          return;
        }
        return $q.reject();
      }

      function errorCallback() {
        notes.error(pix.illustTitle + ': コメント取得失敗');
        return $q.reject();
      }

      return http.post('http://www.pixiv.net/rpc_comment_history.php', data, 'json')
                 .then(successCallback)
                 .catch(errorCallback);
    }
  };
}])
.factory('Pix', [  'classMethods','instanceMethods','dquery',
function PixFactory(classMethods,  instanceMethods,  dquery){
  var EXT    = /(^.+)_m(\.(?:jpe?g|png|gif)).*$/;
  var PAGE   = /漫画 (\d+)P/;
  var SCORE  = /^あなたの評価 (\d+)点.*$/;
  var ANSWER = /^.+「(.+)」.+$/;

  function Pix(doc) {
    var dq = dquery(doc);
    _.extend(this, dq.pixiv());

    if (!this.user.loggedIn) {
      throw 'ログインしてない';
    }

    var url, tmp, ths;

    url = dq.get('.works_display img', 'src');
    url = EXT.exec(url);
    this.prefix = url[1]; // 画像URLのベース
    this.suffix = url[2]; // 画像URLの拡張子

    tmp = PAGE.exec(dq.text('.meta'));
    this.comic  = !!tmp;
    this.length = tmp ? +tmp[1] : 0; // ページ数

    this.score    = this.rated ? +dq.text('.result').replace(SCORE, '$1') : 0;
    this.bookmark = dq.has('.bookmark-container>.button-on');

    if (this.hasQuestionnaire) {
      tmp = dq.text('.questionnaire>.toggle-stats').replace(ANSWER, '$1');
      ths = dq.$$('.questionnaire>.stats>table>tbody>tr>th');

      this.question = dq.text('.questionnaire>.stats>h1'); // 質問
      this.answered = !!tmp;           // 回答済みかどうか
      this.stats    = Pix.stats(ths, tmp); // 統計値
    } else {
      this.question = '';    // 質問
      this.answered = false; // 回答済みかどうか
      this.stats    = [];    // 統計値
    }

    this.comments = Pix.removeLazy(dq.$('._comment-items'));
    this.more     = dq.has('.more-comment');
    this.p        = 1;

    this.meta = dq.outerHTML('.meta');    // 投稿日|サイズ|ツール
    this.rtv  = +dq.text('.view-count');  // 閲覧数
    this.rtc  = +dq.text('.rated-count'); // 評価回数
    this.rtt  = +dq.text('.score-count'); // 総合点

    this.caption = dq.innerHTML('.work-info .caption'); // 概要
    this.tags    = dq.innerHTML('.tags-container'); // タグリスト
  }

  _.extend(Pix, classMethods);
  _.extend(Pix.prototype, instanceMethods);

  return Pix;
}]);
