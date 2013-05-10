angular.module('app.services')
.factory('extract', ['$q', '$rootScope', function ($q, $rootScope) {
  var IMG_PAGE_URL = 'http://www.pixiv.net/member_illust.php?mode=medium&illust_id=';

  return fetch;

  function fetch(illustId) {
    var dfd, xhr;

    dfd = $q.defer();
    xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function (evt) {
      dfd.resolve(load(evt));
      $rootScope.$apply();
    });
    xhr.addEventListener('error', function (evt) {
      dfd.resolve({
        message: evt.target.status + ' (' + evt.target.statusText + ')'
      });
      $rootScope.$apply();
    });
    xhr.responseType = 'document';
    xhr.open('GET', IMG_PAGE_URL + illustId, true);
    xhr.send();

    return dfd.promise;
  }

  function load(evt) {
    var html, getId, query, queryAll, url, res = {};

    if (evt.target.status !== 200) {
      res.message = evt.target.status + ' (' + evt.target.statusText + ')';
      return res;
    }

    html = evt.target.response;
    getId    = html.getElementById.bind(html);
    query    = html.querySelector.bind(html);
    queryAll = html.querySelectorAll.bind(html);

    if (query('.not-logged-in')) {
      res.message = 'Not logged in.';
      return res;
    }

    if (query('.error')) {
      res.message = query('.error').textContent;
      return res;
    }

    try {
      res.myId     = getId('rpc_e_id').textContent;               // 自分のナンバー
      res.auteurId = getId('rpc_u_id').textContent;               // 作者のナンバー
      res.qr       = getId('rpc_qr').textContent;                 // 謎
      res.tt       = query('input[name="tt"]').value;             // トークン
      res.sId      = query('input[name="from_sid"]') ?
                     query('input[name="from_sid"]').value : '';  // 謎

      url = query('.works_display img').src;
      url = /(^.+)_m(\.(?:jpe?g|png|gif)).*$/.exec(url);

      res.imgUrl = url[1];                // 画像URLのベース
      res.imgExt = url[2];                // 画像URLの拡張子
      res.length = getPagesLength(query); // ページ数

      res.myPage        = res.myId === res.auteurId;
      res.bookmarkState = getBookmarkState(res.myPage, query);
      res.favoriteState = getFavoriteState(res.myPage, getId);
      res.score         = getScore(query);

      res.title  = query('.work-info .title').textContent; // 画像タイトル
      res.auteur = getAuteur(query);                       // 作者の名前
      res.desc   = getCaption(query);                      // 概要
      res.meta   = query('.meta').outerHTML;               // 投稿日|サイズ|ツール

      res.rtv  = +query('.view-count').textContent;  // 閲覧数
      res.rtc  = +query('.rated-count').textContent; // 評価回数
      res.rtt  = +query('.score-count').textContent; // 総合点
      res.tags = query('.tags-container').innerHTML; // タグリスト
      return res;
    } catch(e) {
      // console.log(e.stack);
      res.message = e.message;
      return res;
    }
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

  function getFavoriteState(isMine, getId) {
    if (isMine) {
      return true;
    }
    return getId('favorite-button').classList.contains('following') ? true : false;
  }

  function getScore(query) {
    var pattern = /^あなたの評価 (\d+)点.*$/,
        el = query('.result'),
        str = (el && el.textContent.replace(pattern, '$1'));

    return +str || 0;
  }

  function getAuteur(query) {
    var pattern = /^.*「.+「(.+)」の.*$/;

    return query('title').textContent.replace(pattern, '$1');
  }

  function getCaption(query) {
    var el = query('.work-info .caption'),
        str = (el && el.innerHTML) || 'no description';

    return str;
  }
}]);
