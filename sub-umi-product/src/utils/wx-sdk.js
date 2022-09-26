/**
 * 微信jssdk 微信分享 class
 * import WxSDK from "@/utils/wx-sdk";
 *      const wx = new WxSDK({debug:true...}); 微信sdk配置参数非必传
 *      wx.wxShare({title:''...})
 * or
 *      WxSDK.share({title:''...})
 */
import wx from 'weixin';
import { WxSdkConfig } from "@/services/common";
class WxSDK {
    name = 'WxSDK'

    constructor(config,initCallback) {
        // 默认配置
        this.config = {
            debug: false,
            jsApiList: ['checkJsApi',
                'onMenuShareTimeline',
                'updateTimelineShareData',
                'getLocation',
                'onMenuShareAppMessage',
                'updateAppMessageShareData',
                'hideMenuItems',
                'hideAllNonBaseMenuItem',
                'chooseImage',
                'getLocalImgData'],
            ...config
        };
        this.hasInitConfig = !!(config);
        this.initCallback = initCallback;
        this.wxConfigInit();

    }

    /**
     * 微信配置参数可以实例化时传入，如没有自动 fetch
     * */
    wxConfigInit = () => {
        const that = this;
        new Promise(resolve => {
            // if (!this.hasInitConfig) {
            //     WxSdkConfig(window.location.href.split('#')[0]).then(data => {
            //         (data && data.code === 0) && resolve(Object.assign(this.config, data.payload))
            //     })
            // } else {
            //     resolve(this.config)
            // }
            WxSdkConfig(window.location.href.split('#')[0]).then(configRes => {
                (configRes && configRes.code === 200) && resolve(Object.assign(this.config, configRes.data))
            })
        }).then((config) => {
            localStorage.setItem('appId',config.appId)
            if(this.initCallback)
            this.initCallback(config,this)
            wx.config({
                ...config,
            });
        })
        wx && wx.ready(function (res) {
            if (that.config.locationCallback) {
                wx.getLocation({
                    type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                    success: function (locationObj) {
                        that.config.locationCallback(locationObj);
                    }
                });
            }
            if (that.config.chooseImageCallback) {
                wx && wx.chooseImage({
                    count: 1, // 默认9
                    sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
                    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                    success: function (res) {
                        that.config.chooseImageCallback(res);
                    },
                });
            }
            if (that.config.getLocalImgDataCallback) {
                wx && wx.getLocalImgData({
                    localId: that.config.result[0],
                    success: function (res) {
                        that.config.getLocalImgDataCallback(res);
                    },
                });
            }
        });

        wx && wx.error( (res)=> {
            console.log(res);
            this.config.configErrorCallback && this.config.configErrorCallback(res)
        });
        wx && wx.checkJsApi({
            jsApiList: this.config.jsApiList,
            success: function (res) {
                console.log("当前客户端版本是否支持指定JS接口", res);
            }
        });
    }
    /**
     * 注意 link：微信对link有处理影响hash路由，这里做了从新拼接
     * link & imgUrl 非必传，link传入完整路径， 默认当前 href，imgUrl 默认 abao logo
     */
    wxShare = (data) => {
        console.log(wx)
        if (!data) {
            console.error("请填写微信分享参数")
            return;
        }

        const share_Img = data.imgUrl// || window.location.origin + '/wx/images/logo1.png';
        const share_Link = data.link || window.location.href;
        const link = share_Link.split('#')[0] + (share_Link.split('#')[1] ? '#' + share_Link.split('#')[1] : '');
        const imgUrl = share_Img.includes("http") ? share_Img : window.location.origin + share_Img;

        wx && wx.ready(() => {
            // 分享到朋友圈
            wx.onMenuShareTimeline({
                success: function (res) {
                    console.log("分享完成", res.errMsg)
                },
                ...data,
                link,
                imgUrl,
            });
            wx.updateTimelineShareData({
                success: function (res) {
                    console.log("分享完成", res.errMsg)
                },
                ...data,
                link,
                imgUrl,
            });

            // 分享给朋友
            wx.onMenuShareAppMessage({
                success: function (res) {
                    console.log("分享完成", res.errMsg)
                },
                ...data,
                link,
                imgUrl
            });
            wx.updateAppMessageShareData({
                success: function (res) {
                    console.log("分享完成", res.errMsg)
                },
                ...data,
                link,
                imgUrl
            });
        });
    }

    hideMenuItems = (data) => {
        // 默认隐藏所有分享类 menu
        const defaultHideMenu = {
            menuList: [
                "menuItem:share:appMessage",
                "menuItem:share:timeline",
                "menuItem:share:qq",
                "menuItem:share:weiboApp",
                "menuItem:share:facebook",
                "menuItem:share:QZone"
            ]
        }
        wx && wx.ready(() => {
            wx.hideMenuItems(data || defaultHideMenu)
        })
    }

    // 隐藏所有非基础按钮
    hideAllNonBaseMenuItem = () => {
        wx && wx.ready(() => {
            wx.hideAllNonBaseMenuItem();
        })
    }

}

WxSDK.share = (data) => {
    const wx = new WxSDK()
    wx.wxShare(data)
}

WxSDK.getInstance = (callback) => {
    new WxSDK(null,callback)
}

WxSDK.getLocation = (callback) => {
    const wx = new WxSDK({ locationCallback: callback });
    return wx;
}

WxSDK.chooseImage = (callback) => {
    const wx = new WxSDK({ chooseImageCallback: callback });
    return wx;
}

WxSDK.getLocalImgData = (callback, result) => {
    const wx = new WxSDK({ getLocalImgDataCallback: callback, result });
    return wx;
}

export default WxSDK;
