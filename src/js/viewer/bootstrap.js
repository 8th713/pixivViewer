angular.module('app.services', [
  'app.services.config',
  'app.services.page',
  'app.services.http',
  'app.services.fetch',
  'app.services.keys',
  'app.services.util'
]);

angular.module('app.directives', [
  'app.directives.images',
  'app.directives.submit'
]);

angular.module('app.controllers', [
  'app.controllers.main',
  'app.controllers.panel',
  'app.controllers.share'
]);

angular.module('app', [
  'app.services',
  'app.directives',
  'app.controllers'
]);

(function (win, doc) {
  'use strict';

  var proto = win.Element.prototype;

  proto.matchesSelector = proto.matchesSelector || proto.webkitMatchesSelector;

  function insertCss() {
    var link;

    link = doc.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.extension.getURL('style.css');
    doc.head.appendChild(link);
  }

  function insertJs() {
    var script;

    script = doc.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');
    doc.head.appendChild(script);
  }

  insertCss();

  var url = chrome.runtime.getURL('viewer.html'),
      xhr = new XMLHttpRequest();

  xhr.onload = function () {
    doc.body.insertAdjacentHTML('beforeend', this.response);
    angular.bootstrap(doc.querySelector('.PV'), ['app']);
    insertJs();
  };
  xhr.open('GET', url, true);
  xhr.send();
}(this, this.document));
