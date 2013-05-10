angular.module('app.services')
.factory('download', [function () {
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

  return function (model) {
    var dummy;

    if (!model.path) {
      return;
    }

    dummy = document.createElement('a');
    dummy.download = getFileName(model);
    dummy.href = model.path;
    dummy.dispatchEvent(new window.Event('click'));
  };
}]);
