angular.module('Pixiv.services.dquery', [])
.factory('dquery', [  '$rootScope','$sce',
function dqueryFactory($rootScope,  $sce) {
  function Dquery(doc) {
    this.$  = doc.querySelector.bind(doc);
    this.$$ = doc.querySelectorAll.bind(doc);
  }

  var docProto = Dquery.prototype;

  function extractPix(el) {
    var text = el.textContent.replace(/\s+/g, '');

    if (text.indexOf('pixiv.development') === 0) {
      this.push(text);
    }
    if (text.indexOf('pixiv.user') === 0) {
      this.push(text);
    }
    if (text.indexOf('pixiv.context') === 0) {
      this.push(text);
    }
  }

  docProto.pixiv = function pixiv() {
    var pix;
    var scope = $rootScope.$new(true);
    var scripts = this.$$('script:not([type]):not([src])');
    var lines = [];

    _.each(scripts, extractPix, lines);

    scope.$eval(lines.join(''));
    scope.$destroy();

    pix = _.pick(scope.pixiv, ['context', 'user']);
    pix.context.user = pix.user;

    return pix.context;
  };

  docProto.has = function has(selector) {
    return !!this.$(selector);
  };

  docProto.get = function get(selector, property) {
    var node = this.$(selector);

    return node ? node[property] : '';
  };

  docProto.text = function text(selector) {
    return this.get(selector, 'textContent');
  };

  docProto.innerHTML = function innerHTML(selector) {
    return $sce.trustAsHtml(this.get(selector, 'innerHTML'));
  };

  docProto.outerHTML = function outerHTML(selector) {
    return $sce.trustAsHtml(this.get(selector, 'outerHTML'));
  };

  return function dquery(doc) {
    return new Dquery(doc);
  };
}]);
