// 解决ios微信端上下滑动出浏览器背景问题 神秘代码

document.body.addEventListener('touchmove', function(e) {
    if(e._isScroller) return;
    e.preventDefault();
}, {
    passive: true
});
