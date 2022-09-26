function setWeChatShare(params) {

    fetch('/api/wechat/js/config?page=' + encodeURIComponent(window.location.href.split('#')[0]))
        .then(res => res.json())
        .then(res => {
            if (res && res.code == 0) {
                var config = res.payload;
                config.jsApiList = ['checkJsApi', 'onMenuShareTimeline', 'onMenuShareAppMessage']
                wx.config(config);

                wx.ready(function () {
                    wx.onMenuShareTimeline(params);

                    // 分享给朋友
                    wx.onMenuShareAppMessage(params);
                })
            }
        })
}
