(function (doc, win) {
  var docEl = doc.documentElement,
    resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
    recalc = function () {
      var clientWidth = docEl.clientWidth;
      clientWidth = clientWidth > 750 ? 750 : clientWidth;
      clientWidth = clientWidth <= 320 ? 320 : clientWidth;
      if (!clientWidth) return;
      docEl.style.fontSize = clientWidth / 7.5 + 'px';
    };
  recalc()
  if (!doc.addEventListener) return;
  win.addEventListener(resizeEvt, recalc, false);
  doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window);
