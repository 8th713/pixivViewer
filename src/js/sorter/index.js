angular.module('sorter', [])
.directive('pvSorter', ['$document','$timeout',
function pvSorterFactory($document,  $timeout) {
  var idReg  = /illust_id=(\d+)/i;

  function extractId(el) {
    var id = idReg.exec(el.firstElementChild.href);

    el.dataset.id = id && id[1];
  }

  function asc(el) {
    if (el.dataset.id) {
      return +el.dataset.id;
    }

    extractId(el);
    return +el.dataset.id;
  }

  function desc(el) {
    if (el.dataset.id) {
      return -el.dataset.id;
    }

    extractId(el);
    return -el.dataset.id;
  }

  function add(el, index) {
    this[~~(index / 20)].appendChild(el);
  }

  return {
    template:
      '<a href="" ng-click="sort(false)" ng-class="{current: isDesc}">新しい順</a>' +
      '<a href="" ng-click="sort(true)" ng-class="{current: !isDesc}">古い順</a>',
    link: function linkFn(scope) {
      var $$ = document.querySelectorAll.bind(document);
      var timeout;

      scope.isDesc = true;

      scope.sort = function sort(isDesc) {
        var roots = $$('.display_works>ul');
        var items = $$('.display_works>ul>li');

        if (isDesc) {
          items = _.sortBy(items, asc);
          scope.isDesc = false;
        } else {
          items = _.sortBy(items, desc);
          scope.isDesc = true;
        }
        items.forEach(add, roots);
      };

      function handleInsert() {
        $timeout.cancel(timeout);
        timeout = $timeout(function () {
          scope.sort(!scope.isDesc);
        });
      }

      $document.on('AutoPagerize_DOMNodeInserted', handleInsert);
      $document.on('AutoPatchWork.DOMNodeInserted', handleInsert);
      $document.on('AutoPagerAfterInsert', handleInsert);
    }
  };
}]);

(function (win, doc) {
  var root = doc.querySelector('.menu-items'),
      template = '<li pv-sorter></li>';

  root.insertAdjacentHTML('beforeend', template);
  angular.bootstrap(root, ['sorter']);
}(this, this.document));
