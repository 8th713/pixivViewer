;(function(global, pixiv, $) {

global.addEventListener('message', function (evt) {
  if (evt.source !== window) {
    return;
  }

  if (evt.data === 'tagSetup') {
    $('.PV-bookmark .ui-counter').counter();
    pixiv.bookmarkTag.setup('.tag-cloud-container');
    pixiv.tag.setup();
    $('.PV-bookmark .layout-body').on('click', '.tag', function() {
      pixiv.tag.toggle(this.dataset.tag);
      return false;
    });
    $('.PV-bookmark input[placeholder="ブックマークコメント"]').focus();
  }
}, true);

})(window, window.pixiv, window.$);
