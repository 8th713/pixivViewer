angular.module('pvFilter', [])
.directive('pvFilter', [function () {
  return function (scope) {
    var ROOT_SELECTOR  = 'image-items',
        IMAGE_SELECTOR = 'image-item',
        HIDE_SELECTOR  = 'PV-hidden',
        $$ = document.getElementsByClassName.bind(document),
        list = [];

    scope.sorted    = false;
    scope.filtered  = false;
    scope.threshold = 0;

    scope.$watch('sorted', function (value) {
      sort(value);
    });

    scope.$watch('filtered', function (value) {
      filter(value);
    });

    scope.$watch('threshold', _.debounce(function () {
      filter(scope.filtered);
    }, 200));

    function sort(sorted, insertItems) {
      var roots = $$(ROOT_SELECTOR),
          items = $$(IMAGE_SELECTOR);

      if (sorted) {
        list = insertItems ? list.concat(_.toArray(insertItems))
                           : _.toArray(items);
        items = _.sortBy(list, desc);
        _.each(items, add, roots);
      } else {
        _.each(list, add, roots);
        list = [];
      }
      resize(window);
    }

    function desc(el) {
      var bookmark = el.getElementsByClassName('bookmark-count')[0];

      return bookmark && -bookmark.textContent;
    }

    function add(el, index) {
      this[~~(index / 20)].appendChild(el);
    }

    // filtering
    function filter(filtered, items) {
      if (!items) {
        items = $$(IMAGE_SELECTOR);
      }

      if (filtered) {
        _.each(items, display);
      } else {
        _.each(_.toArray($$(HIDE_SELECTOR)), show);
      }
      resize(window);
    }

    function display(el) {
      var bookmark = el.getElementsByClassName('bookmark-count')[0],
          count = bookmark ? +bookmark.textContent : 0;

      if (count < scope.threshold) {
        el.classList.add(HIDE_SELECTOR);
      } else {
        el.classList.remove(HIDE_SELECTOR);
      }
    }

    function show(el) {
      el.classList.remove(HIDE_SELECTOR);
    }

    function resize(w) {
      w.dispatchEvent(new w.Event('resize'));
    }

    function handleInsert(evt) {
      var items = evt.target.getElementsByClassName(IMAGE_SELECTOR);

      if (scope.sorted) {
        sort(scope.sorted, items);
      }

      if (scope.filtered) {
        filter(scope.filtered, items);
      }
    }

    document.body.addEventListener('AutoPagerize_DOMNodeInserted', handleInsert, false);
    document.body.addEventListener('AutoPatchWork.DOMNodeInserted', handleInsert, false);
    document.body.addEventListener('AutoPagerAfterInsert', handleInsert, false);
  };
}]);

(function (win, doc) {
  var root = doc.querySelector('.column-menu'),
      url = chrome.runtime.getURL('filter.html'),
      xhr = new XMLHttpRequest();

  xhr.onload = function () {
    root.insertAdjacentHTML('beforeend', this.response);
    angular.bootstrap(root.lastChild, ['pvFilter']);
  };
  xhr.open('GET', url, true);
  xhr.send();
}(this, this.document));
