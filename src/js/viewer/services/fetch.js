angular.module('app.services.fetch', [])
.factory('fetch', ['$rootScope', 'http', function ($rootScope, http) {
  'use strict';

  var IMG_PAGE_URL = 'http://www.pixiv.net/member_illust.php?mode=medium&illust_id=';
  var ext = /(^.+)_m(\.(?:jpe?g|png|gif)).*$/;

  return function (id) {
    return http.getDocument(IMG_PAGE_URL + id).then(fetch);
  };

  function fetch(html) {
    var getId, query, queryAll, url, res = {};


    getId    = html.getElementById.bind(html);
    query    = html.querySelector.bind(html);
    queryAll = html.querySelectorAll.bind(html);

    if (query('.not-logged-in')) {
      throw new Error('Not logged in.');
    }

    if (query('.error')) {
      throw new Error(query('.error').textContent);
    }

    var pd = pixiv(queryAll);

    res.myId     = pd.user.id;                  // 自分のナンバー
    res.auteurId = pd.context.userId;           // 作者のナンバー
    res.qr       = pd.context.hasQuestionnaire; // アンケートの有無
    res.tt       = pd.context.token;            // トークン
    res.myPage   = pd.context.self;
    res.favoriteState = pd.context.favorite;
    res.title  = pd.context.illustTitle; // 作品名
    res.auteur = pd.context.userName;    // 作者名

    url = query('.works_display img').src;
    url = ext.exec(url);

    res.imgUrl = url[1];                // 画像URLのベース
    res.imgExt = url[2];                // 画像URLの拡張子
    res.length = getPagesLength(query); // ページ数

    res.bookmarkState = getBookmarkState(res.myPage, query);
    res.score         = getScore(query);

    res.desc   = getCaption(query);                         // 概要
    res.meta   = query('.meta').outerHTML;                  // 投稿日|サイズ|ツール

    res.rtv  = +query('.view-count').textContent;  // 閲覧数
    res.rtc  = +query('.rated-count').textContent; // 評価回数
    res.rtt  = +query('.score-count').textContent; // 総合点
    res.tags = query('.tags-container').innerHTML; // タグリスト

    res.questionnaire = getQuestionnaire(query, res.qr);

    res.pageTitle = res.title + ' | ' + res.auteur;
    return res;
  }

  function pixiv(queryAll) {
    var scope = $rootScope.$new(true);
    var scripts = queryAll('script:not([type]):not([src])');
    var lines = [];

    _.each(scripts, function (el) {
      var text = el.textContent.replace(/\s+/g, '');

      if (text.indexOf('pixiv.development') === 0) {
        lines.push(text);
      }
      if (text.indexOf('pixiv.user') === 0) {
        lines.push(text);
      }
      if (text.indexOf('pixiv.context') === 0) {
        lines.push(text);
      }
    });

    scope.$eval(lines.join(''));
    scope.$destroy();
    return _.pick(scope.pixiv, ['context', 'user']);
  }

  function getPagesLength(query) {
    var str = query('.meta').textContent,
        result = /漫画 (\d+)P/.exec(str);

    return result ? +result[1] : 0;
  }

  function getBookmarkState(isMine, query) {
    if (isMine) {
      return true;
    }
    return query('.bookmark-container>.button-on') ? true : false;
  }

  function getScore(query) {
    var pattern = /^あなたの評価 (\d+)点.*$/,
        el = query('.result'),
        str = (el && el.textContent.replace(pattern, '$1'));

    return +str || 0;
  }

  function getCaption(query) {
    var el = query('.work-info .caption'),
        str = (el && el.innerHTML) || 'no description';

    return str;
  }

  function getQuestionnaire(q, qr) {
    if (!qr) {
      return;
    }

    var question = q('.questionnaire>.stats>h1').textContent;
    var answer = q('.questionnaire>.toggle-stats');

    if (answer) {
      answer = answer.textContent.replace(/^.+「(.+)」.+$/, '$1');
    }

    var stats = [];
    var table = q('.questionnaire>.stats>table');
    var ths = table.getElementsByTagName('th');

    _.each(ths,function (th, index) {
      var span = th.nextSibling.firstChild;
      var name = th.textContent;

      stats.push({
        id: index + 1,
        name: name,
        count: +span.textContent,
        active: answer === name
      });
    });

    return {
      question: question, // 質問
      stats: stats,       // 統計値
      answered: !!answer  // 回答済みかどうか
    };
  }
}]);
