angular.module('pvSorter', [])
.directive('pvSorter', ['$timeout', function ($timeout) {
  return function (scope, $el) {
    var $$ = document.querySelectorAll.bind(document),
        input = $el[0],
        timeout;

    var change = function () {
      var roots, items;

      roots = $$('.display_works.linkStyleWorks>ul');
      items = $$('.display_works.linkStyleWorks>ul>li');

      if (input.checked) {
        items = _.sortBy(items, asc);
        items.forEach(add, roots);
        return;
      }

      items = _.sortBy(items, desc);
      items.forEach(add, roots);
    };

    function asc(el) {
      var id = /illust_id=(\d+)/i.exec(el.firstElementChild.href);

      return id && +id[1];
    }

    function desc(el) {
      var id = /illust_id=(\d+)/i.exec(el.firstElementChild.href);

      return id && -id[1];
    }

    function add(el, index) {
      this[~~(index / 20)].appendChild(el);
    }

    function handleInsert() {
      if (input.checked) {
        $timeout.cancel(timeout);
        timeout = $timeout(change);
      }
    }

    input.addEventListener('change', change);
    document.body.addEventListener('AutoPagerize_DOMNodeInserted', handleInsert, false);
    document.body.addEventListener('AutoPatchWork.DOMNodeInserted', handleInsert, false);
    document.body.addEventListener('AutoPagerAfterInsert', handleInsert, false);
  };
}]);


(function (win, doc) {
  var root = doc.querySelector('.menu-items'),
      template = '<li>' +
        '<input class="PVS" type="checkbox" title="Reverse" pv-sorter>' +
        '</li>';

  root.insertAdjacentHTML('beforeend', template);
  angular.bootstrap(root, ['pvSorter']);
}(this, this.document));
