window.addEventListener('message', function (evt) {
  if (evt.source !== window) {
    return;
  }

  if (evt.data === 'tagSetup') {
    $('.PV-bookmark .ui-counter').counter();
    pixiv.bookmarkTag.setup('.tag-cloud-container');
    pixiv.tag.setup();
    $('.PV-bookmark input[placeholder="ブックマークコメント"]').focus();
  }
}, true);

$('.PV-bookmark').on('click', '.tag', function() {
  pixiv.tag.toggle(this.dataset.tag);
  return false;
});
