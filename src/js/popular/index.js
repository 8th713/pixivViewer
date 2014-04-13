angular.module('popular', [])
.directive('pvPopular', ['$document','$timeout',
function pvPopularFactory($document,  $timeout) {
  function setData(item, index) {
    if (item.dataset.count) {
      return;
    }

    var count = item.getElementsByClassName('bookmark-count')[0];

    item.dataset.count = count && count.textContent || 0;
    item.dataset.index = index;
  }

  function popular(el) {
    return -el.dataset.count;
  }

  function date(el) {
    return +el.dataset.index;
  }

  function add(el, index) {
    this[~~(index / 20)].appendChild(el);
  }

  function resize(w) {
    w.dispatchEvent(new w.Event('resize'));
  }

  return {
    template:
      '<li><a href="" ng-click="sort()" ng-class="{current: active}">人気順</a></li>',
    link: function linkFn(scope) {
      var $$ = document.getElementsByClassName.bind(document);
      var timeout;

      function sort() {
        var roots = $$('image-items'),
            items = $$('image-item');

        _.each(items, setData);

        if (scope.active) {
          items = _.sortBy(items, popular);
        } else {
          items = _.sortBy(items, date);
        }
        items.forEach(add, roots);
        resize(window);
      }

      scope.sort = function handleSort() {
        scope.active = !scope.active;
        sort();
      };

      function handleInsert() {
        $timeout.cancel(timeout);
        timeout = $timeout(sort);
      }

      $document.on('AutoPagerize_DOMNodeInserted', handleInsert);
      $document.on('AutoPatchWork.DOMNodeInserted', handleInsert);
      $document.on('AutoPagerAfterInsert', handleInsert);
    }
  };
}]);

(function (win, doc) {
  var root = doc.querySelector('.column-menu'),
      template = '<ul class="menu-items" pv-popular></ul>';

  root.insertAdjacentHTML('beforeend', template);
  angular.bootstrap(root, ['popular']);
}(this, this.document));
