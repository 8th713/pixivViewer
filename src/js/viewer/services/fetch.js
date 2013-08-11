angular.module('app.services.fetch', [])
.factory('fetch', ['http', function (http) {
  'use strict';

  var IMG_PAGE_URL = 'http://www.pixiv.net/member_illust.php?mode=medium&illust_id=';
  var auteur = /^.*「.+「(.+)」の.*$/,
      ext = /(^.+)_m(\.(?:jpe?g|png|gif)).*$/;

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

    res.myId     = getId('rpc_e_id').textContent;               // 自分のナンバー
    res.auteurId = getId('rpc_u_id').textContent;               // 作者のナンバー
    res.qr       = getId('rpc_qr').textContent;                 // 謎
    res.tt       = query('input[name="tt"]').value;             // トークン
    // res.sId      = query('input[name="from_sid"]') ?
    //                query('input[name="from_sid"]').value : '';  // 謎

    url = query('.works_display img').src;
    url = ext.exec(url);

    res.imgUrl = url[1];                // 画像URLのベース
    res.imgExt = url[2];                // 画像URLの拡張子
    res.length = getPagesLength(query); // ページ数

    res.myPage        = res.myId === res.auteurId;
    res.bookmarkState = getBookmarkState(res.myPage, query);
    res.favoriteState = getFavoriteState(res.myPage, getId);
    res.score         = getScore(query);

    res.title  = query('.work-info .title').textContent;    // 作品名
    res.auteur = query('title').text.replace(auteur, '$1'); // 作者名
    res.desc   = getCaption(query);                         // 概要
    res.meta   = query('.meta').outerHTML;                  // 投稿日|サイズ|ツール

    res.rtv  = +query('.view-count').textContent;  // 閲覧数
    res.rtc  = +query('.rated-count').textContent; // 評価回数
    res.rtt  = +query('.score-count').textContent; // 総合点
    res.tags = query('.tags-container').innerHTML; // タグリスト

    res.pageTitle = res.title + ' | ' + res.auteur;
    return res;
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

  function getCaption(query) {
    var el = query('.work-info .caption'),
        str = (el && el.innerHTML) || 'no description';

    return str;
  }
}]);
