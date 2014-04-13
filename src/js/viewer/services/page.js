angular.module('App.services.page', [])
.service('page', [  '$rootScope','$templateCache','keys','scroller','Pix',
function pageFactory($rootScope,  $templateCache,  keys,  scroller,  Pix) {
  var SELECTORS = [
    'a[href*="ranking.php"] img[src*="/img/"]',
    'a[href*="member_illust.php"] img[src*="/img/"]',
    'a[href*="member_event.php"] img[src*="/img/"]'
  ].join();

  this.handleClick = function handleClick(evt) {
    if (evt.button) {
      return;
    }

    var target = evt.target;

    if (target.matches('.PV-bookmark *')) {
      return;
    }

    if (target.matches(SELECTORS)) {
      evt.stopPropagation();
      evt.preventDefault();
      this.update(target);
    }
  };

  var element;
  var classList = document.documentElement.classList;
  var scroll = scroller();

  this.remove = function remove() {
    element = null;
    $rootScope.$broadcast('remove');
    keys.disabled = true;

    classList.remove('no-iframe');
  };

  this.update = function update(target) {
    var val = parseInt(target.y - window.innerHeight / 3, 10);

    element = target;
    $rootScope.$broadcast('update', Pix.query(target.src));
    keys.disabled = false;

    classList.add('no-iframe');
    scroll.to(val);
  };

  this.next = function next() {
    this.update(getImage(1));
  };

  keys.on('next', this.next.bind(this));

  this.prev = function prev() {
    this.update(getImage(-1));
  };

  keys.on('prev', this.prev.bind(this));

  function getImage(step) {
    var images = document.querySelectorAll(SELECTORS);
    var index  = _.indexOf(images, element);
    var last   = images.length - 1;

    return images[index + step] || (step > 0 ? images[0] : images[last]);
  }
}]);
