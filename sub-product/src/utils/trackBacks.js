import getScript from './get-script';
import record from 'record-sdk';
import { v4 as uuidv4 } from 'uuid';

// 中元可回溯
export const zhongyuan = {
  /**
   * 1.判断pengpaibao/zhongyuanib
   * 2.判断生产/测试
   * */
  load() {
    const origin = window.location.origin;
    // 只在zhongyuanib域下中元回溯
    if (!origin.includes('zhongyuanib')) return;
    const testUrl = 'https://test-track.zhongyuanib.com/static/eye.js'; // 生产
    const productionUrl = 'https://track.zhongyuanib.com/static/eye.js'; // 测试
    let url = productionUrl;
    if (origin.includes('localhost') || origin.includes('dev')) {
      url = testUrl;
    }
    getScript(url);
  },
  // 回溯码
  getIseeBiz() {
    return new Promise((resolve) => {
      return window.getIseeBiz ? window.getIseeBiz().then(iseeBiz => {
        resolve(iseeBiz)
      }) : resolve()
    })
  },
};

// chebaoyi可回溯
export const chebaoyi = {
  load: function () {
    const origin = window.location.origin;
    const url = origin.includes('dev') || origin.includes('localhost') ? `https://${origin.includes('dev2') ? 'i' : 'h'}.bedrock.chetimes.com` : 'https://bedrock.chetimes.com';
    record.init({ baseUrl: url });
  },
  // 刷新uuid
  refreshUuid: function (uuid = uuidv4()) {
    localStorage.setItem('uuid', uuid);
  },
  // 开始录制 resetuuid为true 刷新uuid
  start: function (pageCode = window.location.href, resetuuid) {
    if (resetuuid) chebaoyi.refreshUuid(resetuuid == true ? undefined : resetuuid);
    this.pageCode = pageCode;
    const orderId = localStorage.getItem('uuid');
    if (!this.pageCode || !orderId) {
      console.error('pageCode or orderId is missing !')
      return;
    }
    record.startRecord({ channelId: 'pengpaibao', orderId, pageCode: this.pageCode }, {
      // recordCanvas: true,
      sampling: {
        // 不录制鼠标移动事件
        // mousemove: false,
        // 不录制鼠标交互事件
        // mouseInteraction: false,
        // 设置滚动事件的触发频率
        scroll: 2000, // 每 150ms 最多触发一次
        // 设置输入事件的录制时机
        // input: 'last' // 连续输入时，只录制最终值
      }
    });
  },
  // 结束录制
  stop: function (callback) {
    const orderId = localStorage.getItem('uuid');
    if (!this.pageCode || !orderId) {
      console.error('pageCode or orderId is missing !')
      return;
    }
    record.stopRecord({ channelId: 'pengpaibao', orderId, pageCode: this.pageCode }, {
      onBefore: (response) => {
        console.log("TrackBacks onBefore", response)
      },
      onFinish: (response) => {
        console.log("TrackBacks onFinish", response)
        callback && callback(response)
      }
    });
  }
}

export default { zhongyuan, chebaoyi };
