/**
 * 投保 小程序支付 & h5 支付
 * 在小程序环境中且toPayUrl没有域名即认为toPayUrl是小程序页面地址，用jssdk拉起小程序页面
*/
import wx from "weixin";

export default (toPayUrl) => {
  if (!toPayUrl) return;
  let isMiniProgram = false;
  wx.miniProgram && wx.miniProgram.getEnv(function (res) {
    // 微信小程序环境并且是小程序支付地址
    if (res.miniprogram && !toPayUrl.startsWith('http')) {
      isMiniProgram = true;
      wx.miniProgram.navigateTo({ url: toPayUrl });
    }
  })
  if (!isMiniProgram) window.location.href = toPayUrl;
}
