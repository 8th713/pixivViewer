angular.module('App', [
  'ngAnimate',
  'common',
  'Pixiv',

  'App.services.config',
  'App.services.page',

  'App.controllers.Main',
  'App.controllers.Panel',
  'App.controllers.Bookmark',
  'App.controllers.Follow',
  'App.controllers.Questionnaire',
  'App.controllers.Comments',
  'App.controllers.Cog',

  'App.directives.include',
  'App.directives.src',
  'App.directives.img',
  'App.directives.fit',
  'App.directives.bkm'
]).run([           '$rootScope','keys','config','page',
function initialize($rootScope,  keys,  config,  page) {
  // var orgSend = XMLHttpRequest.prototype.send;

  // XMLHttpRequest.prototype.send = function send() {
  //   var xhr = this;
  //   var args = arguments;
  //   var delay = _.random(1, 3);

  //   setTimeout(function() {
  //     orgSend.apply(xhr, args);
  //   }, delay * 1000);
  //   console.info('delay time: %ss', delay);
  // };

  if (Element.prototype.matches === void 0) {
    Element.prototype.matches = Element.prototype.webkitMatchesSelector;
  }

  config.load().then(function() {
    $rootScope.$watch(configScrollWatch, configScrollWatchAction);

    var currentVer = '<%= pkg.version %>';

    if (config.attrs.version !== currentVer) {
      throw 'old';
    }
  }).catch(config.clear);

  function configScrollWatch() {
    return config.attrs.scrollbar;
  }

  function configScrollWatchAction(value) {
    var classList = document.documentElement.classList;

    if (value) {
      classList.remove('no-scrollbar');
    } else {
      classList.add('no-scrollbar');
    }
  }

  var Key = keys.Key;

  keys.add('nextIllust',  Key.Enter,                        Key.J);
  keys.add('next',       [Key.Enter, Key.CTRL],            [Key.J, Key.CTRL]);
  keys.add('prevIllust', [Key.Enter, Key.SHIFT],            Key.K);
  keys.add('prev',       [Key.Enter, Key.CTRL, Key.SHIFT], [Key.K, Key.CTRL]);
  keys.add('scrollDown',  Key.Space);
  keys.add('scrollUp',   [Key.Space, Key.SHIFT]);
  keys.add('fit',         Key.F);
  keys.add('rate',        Key.S);
  keys.add('download',    Key.D);
  keys.add('tweet',       Key.T);
  keys.add('desc',        Key.H);
  keys.add('bookmark',    Key.B);
  keys.add('comments',    Key.C);
  keys.add('help',       [Key['?'], Key.SHIFT]);

  document.body.addEventListener('click', page.handleClick.bind(page));
}]);

(function (win, doc) {
  var link;

  link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = chrome.extension.getURL('styles.css');
  doc.head.insertAdjacentElement('afterbegin', link);

  var script;

  script = doc.createElement('script');
  script.src = chrome.runtime.getURL('js/message.js');
  doc.head.insertAdjacentElement('afterbegin', script);

  var xhr = new XMLHttpRequest();

  xhr.open('GET', chrome.runtime.getURL('index.html'));
  xhr.addEventListener('load', function() {
    doc.body.insertAdjacentHTML('beforeend', this.response);
    angular.bootstrap(doc.querySelector('.PV'), ['App']);
    xhr = link = script = null;
  });
  xhr.send();
}(this, this.document));
