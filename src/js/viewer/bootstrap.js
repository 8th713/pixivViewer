angular.module('app.controllers', []);
angular.module('app.directives', []);
angular.module('app.services', []);
angular.module('app', [
  'utils',
  'app.services',
  'app.directives',
  'app.controllers'
]);

(function (win, doc) {
  var proto = win.Element.prototype;

  proto.matchesSelector = proto.matchesSelector || proto.webkitMatchesSelector;

  function bindMessageEvent() {
    window.addEventListener('message', function (evt) {
      if (evt.source === this && evt.data === 'tagSetup') {
        this.pixiv.tag.setup();
        this.pixiv.ui.form.setup();
        $('#comment').focus();
      }
    }, true);
  }

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
    script.text = '(' + bindMessageEvent + '());';
    doc.head.appendChild(script);
  }

  insertCss();
  insertJs();
  var url = chrome.runtime.getURL('viewer.html'),
      xhr = new XMLHttpRequest();

  xhr.onload = function () {
    doc.body.insertAdjacentHTML('beforeend', this.response);
    angular.bootstrap(doc.querySelector('.PV'), ['app']);
  };
  xhr.open('GET', url, true);
  xhr.send();
}(this, this.document));
