import getScript from './get-script';
import moment from 'moment';
import cloneDeep from 'lodash/cloneDeep';
import District from '@/assets/commonData/district';
import { Toast } from 'antd-mobile-v5';
import ReactDOM from 'react-dom';
import PPBLoading from '@/components/Loading/loading.js';

// 工具类定义
export default {
    //渲染reactNode到body
    renderToBody(element) {
        const container = document.createElement('div')
        document.body.appendChild(container)
        function unmount() {
          const unmountResult = ReactDOM.unmountComponentAtNode(container)
          if (unmountResult && container.parentNode) {
            container.parentNode.removeChild(container)
          }
        }
        ReactDOM.render(element, container)
        return unmount
    },
    //转换车辆基本信息到提交信息
    mapValuesToFields(params){
        Object.keys(params).forEach(k => {
            params[k] = typeof params[k] === 'string' ? params[k].trim() : params[k];
            //车架号转大写
            params[k] = k === 'vinCode'?params[k].toUpperCase(): params[k];
            //新车销售公司所在地市转数组
            params[k] = k === 'saleCompanyCityCode'?[params[k]]: params[k];
            //带date的字段转换为date类型
            params[k] = (k.endsWith('Date') && typeof params[k] === 'string') ? new Date(params[k].replace(/-/g, "/")) : params[k];
            params[k] = k.startsWith('isTransferFirstYear') ? params[k] ==1?true:false : params[k];
          });
        return params
    },

    //转换提交信息到车辆基本信息
    mapFieldsToValues(params,dateMap={}){
        Object.keys(params).forEach(k => {
            if(typeof params[k] === 'string'){
                params[k] = params[k].trim();
            }else if(params[k] instanceof Date){
                if(dateMap[k]){
                    params[k] = moment(params[k]).format(dateMap[k]);
                }else{
                    params[k] = moment(params[k]).format('YYYY-MM-DD');
                }
            }else if(typeof params[k] === 'boolean'){
                params[k] = params[k] === true?1:0;
            }else if(Array.isArray(params[k])){
                if(k == 'idCardType'){
                    params[k] = params[k][0];
                }
            }else if(params[k] instanceof Object){
                params[k] = this.mapFieldsToValues(params[k]);
            }
          });
        return params
    },
    dataURLtoFile(dataurl, filename) {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    },

    generalRequest(params, fun) {
        return new Promise((resolve, reject) => {
            fun.call(null, params)
                .then((res) => {
                    if (res) {
                        if (res.code === 200) {
                            resolve(res)
                        } else {
                            if (res.msg && typeof (res.msg) === 'string') Toast.show({
                                content: res.msg,
                                duration: 2000
                            })
                            PPBLoading.hide();
                            reject(res)
                        }
                    }else{
                        PPBLoading.hide();
                        reject()
                    }
                })
                .catch(()=>{
                    PPBLoading.hide();
                    reject()
                })
        })
    },
    generateParams(sufUrl) {
        let params = {};
        if (!sufUrl) {
            return params;
        }
        let index1 = sufUrl.indexOf('?');
        if (sufUrl.length <= index1 + 1) {
            return params;
        }
        let subString1 = sufUrl.substring(index1 + 1);
        let arr = subString1.split('&');
        for (let i in arr) {
            let kv = arr[i];
            let kvArr = kv.split('=');
            if (kvArr && kvArr.length === 2) {
                params[kvArr[0]] = kvArr[1];
            }
        }
        return params;
    },

    getTimeState() {
        // 获取当前时间
        let timeNow = new Date();
        // 获取当前小时
        let hours = timeNow.getHours();
        // 设置默认文字
        let text = ``;
        // 判断当前时间段
        if (hours >= 0 && hours <= 10) {
            text = `早上`;
        } else if (hours > 10 && hours <= 14) {
            text = `中午`;
        } else if (hours > 14 && hours <= 18) {
            text = `下午`;
        } else if (hours > 18 && hours <= 24) {
            text = `晚上`;
        }
        return text;
    },
    loadUmeng(code) {
        setTimeout(function () {
            getScript(`https://s5.cnzz.com/z_stat.php?id=${code}&web_id=${code}`);
        }, 500);
    },
    collectInfo(code, platform = 'abao') {
        // 友盟跟踪代码
        try {
            window._czc.push(['_trackEvent', platform, code]);
        } catch (e) {
            // console.log('_hmt is not defined');
        }
    },
    loadBaidu(code) {
        setTimeout(function () {
            getScript(`https://hm.baidu.com/hm.js?${code}`);
        }, 500);
    },
    collectBaiduInfo(category, track) {
        this.collectBaiduHm(category, 'click', track);
    },
    /**
     * baiduHmSetAccount & collectBaiduHm 配合 _layout.js 使用加载脚本，_setAccount 指定当前 siteId 为最新引入脚本
     * https://tongji.baidu.com/open/api/more?p=ref_setAccount
     */
    baiduHmSetAccount(code) {
        window.bdhm = new Promise(reslove => {
            getScript(`https://hm.baidu.com/hm.js?${code}`, () => {
                window._hmt && window._hmt.push(['_setAccount', code]);
                reslove();
            });
        });
    },
    async collectBaiduHm(category, action = 'click', track) {
        await window.bdhm;
        window._hmt && window._hmt.push(['_trackEvent', category, action, track]);
    },
    ocpcSubmitSuccess() {
        window._agl && window._agl.push(['track', ['success', { t: 3 }]]);
    },

    toChinesNum: function (num) {
        // number转汉字
        let changeNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']; //changeNum[0] = "零"
        let unit = ['', '十', '百', '千', '万'];
        num = parseInt(num);
        let getWan = temp => {
            let strArr = temp
                .toString()
                .split('')
                .reverse();
            let newNum = '';
            for (let i = 0; i < strArr.length; i++) {
                newNum =
                    (i == 0 && strArr[i] == 0
                        ? ''
                        : i > 0 && strArr[i] == 0 && strArr[i - 1] == 0
                            ? ''
                            : changeNum[strArr[i]] + (strArr[i] == 0 ? unit[0] : unit[i])) + newNum;
            }
            return newNum;
        };
        let overWan = Math.floor(num / 10000);
        let noWan = num % 10000;
        if (noWan.toString().length < 4) noWan = '0' + noWan;
        return overWan ? getWan(overWan) + '万' + getWan(noWan) : getWan(num);
    },



    /**
     * time 需要比较的时间  stime 开始时间 etime 结束时间
     */
    compareTime({ time, stime, etime }) {
        // 格式为 2018-9-10 20:08
        // 如果当前时间处于时间段内，返回true，否则返回false
        // console.log('开始时间', moment(stime).format('YYYY-MM-DD'), '比较时间', moment(time).format('YYYY-MM-DD'), '结束时间', moment(etime).format('YYYY-MM-DD'));
        if (
            this.formatMomentTime(time).isBefore(this.formatMomentTime(stime)) ||
            this.formatMomentTime(time).isAfter(this.formatMomentTime(etime))
        ) {
            return false;
        }
        return true;
    },

    /**
     * time time为moment对象，转换为【2019,9,18】
     */
    getMomentArr(time) {
        return [moment(time).year(), moment(time).month(), moment(time).date()];
    },

    /**
     * 返回moment时间格式
     * time:[2019,9,5]
     */
    formatMomentTime(time) {
        return moment(this.getMomentArr(time));
    },

    /**
     * 返回当前时间之前年月日时间
     * 返回格式  1969-07-30T11:49:41+08:00
     */
    setPreDateFormat({ years, months, days }) {
        // console.log(years,months,days);
        return moment()
            .subtract({ years, months, days })
            .format();
    },

    /**
     * 返回interval，处理后的最大最小时间
     */
    formatIntervalTime: function (interval) {
        const { maxUnit, maxIsClosed, max, min, minIsClosed, minUnit } = interval;
        let stime,etime
        if(localStorage.ppb_visting_productName == '机动车延长保修保险UAC'){
            stime = this.setPreDateFormat({
                days: -2,
                months: maxUnit.value === 5 ? (maxIsClosed ? max + 1 : max) : 0,
            }); // 天数多一天
            etime = this.setPreDateFormat({
                days: 0,
                months: minUnit.value === 5 ? (minIsClosed ? min : min + 1) : 1,
            });
        }else{
            stime = this.setPreDateFormat({
                years: maxUnit.value === 3 ? (maxIsClosed ? max + 1 : max) : 0,
                days: maxUnit.value === 1 ? (maxIsClosed ? max + 1 : max) : -1,
            }); // 天数多一天
            etime = this.setPreDateFormat({
                years: minUnit.value === 3 ? (minIsClosed ? min : min + 1) : 0,
                days: minUnit.value === 1 ? (minIsClosed ? min : min + 1) : 1,
            });
        }
        return { stime, etime };
    },

    /**
     * 返回取交集后interval
     * oldInterval,newInterval无论先后，都为后端返回数据格式
     */
    compareTimeSetInterval: function (oldInterval, newInterval) {
        let interval = cloneDeep(oldInterval); // 克隆旧数据
        const { stime: oldStime, etime: oldEtime } = this.formatIntervalTime(oldInterval);
        const { stime: newStime, etime: newEtime } = this.formatIntervalTime(newInterval);
        if (this.formatMomentTime(newStime).isAfter(this.formatMomentTime(oldStime))) {
            // 开始时间时间谁在后边取谁
            interval.max = oldInterval.max;
            interval.maxUnit = oldInterval.maxUnit;
            interval.maxIsClosed = oldInterval.maxIsClosed;
        }
        if (this.formatMomentTime(oldEtime).isAfter(this.formatMomentTime(newEtime))) {
            // 结束时间谁在前边取谁
            interval.min = newInterval.min;
            interval.minUnit = newInterval.minUnit;
            interval.minIsClosed = newInterval.minIsClosed;
        }
        // console.log('old',oldInterval,'new',newInterval,interval);
        return interval;
    },

    /**
     * 判断微信环境
     * */
    isWeiXin: () => {
        const ua = window.navigator.userAgent.toLowerCase();
        return ua.match(/MicroMessenger/i) == 'micromessenger' || ua.match(/_SQ_/i) == '_sq_';
    },
    isMobile: () => {
        return /(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent);
    },
    isIOS: () => {
        return /(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent);
    },
    /**
     * 微信授权
     * @param oauth_wx_url 后端获取 微信鉴权地址（必传，其中微信重定向地址为后端接口,前端重定向地址为STATE值，未传则默认测试abao测试账号鉴权地址用于开发调试）
     *      eg:`https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxc2093716e6a2e1a1&redirect_uri=/api/wechat&response_type=code&scope=snsapi_userinfo&state=${callback}#wechat_redirect`
     * */
    toAuthorize: oauth_wx_url => {
        // 微信授权直接重定向后端接口，由后端重定向前端页面并返回授权结果
        if (oauth_wx_url) window.location.href = oauth_wx_url;
    },
    /**
     * 判断元素滚动到目标元素执行callback
     * 元素上边缘从屏幕下边缘滚入
     */
    domView(callback, domId) {
        // 保证埋点只执行一次
        let isVisited = false;
        window.addEventListener(
            'scroll',
            function () {
                const documentClientHeight =
                    document.documentElement.clientHeight || window.innerHeight;
                const htmlElementClientTop = document
                    .getElementById(domId || 'readWhole')
                    .getBoundingClientRect().top;
                if (!isVisited && documentClientHeight >= htmlElementClientTop) {
                    isVisited = true;
                    callback && callback();
                }
            },
            false,
        );
    },

    // 元素下边缘从屏幕上边缘上滚入 and 元素上边缘从屏幕下边缘滚入
    domTAndBView(callback, domId) {
        let preIsVis = false; // 保证只统计一次
        window.addEventListener(
            'scroll',
            function () {
                const element = document.getElementById(domId || 'readWhole');
                if (!element) return;
                var rect = element.getBoundingClientRect();
                var html = document.documentElement;
                var top = document.documentElement.clientTop;
                const result =
                    rect.top - top + element.getBoundingClientRect().height >= 0 &&
                    rect.bottom -
                    top -
                    element.getBoundingClientRect().height -
                    (window.innerHeight || html.clientHeight) <=
                    0;
                if (result && preIsVis !== result) {
                    callback && callback();
                }
                preIsVis = result;
            },
            false,
        );
    },
    /**
     * 配合@/assets/commonData/district 城市数据使用
     * @params [10000,100000]
     * @return [省,市]
     */
    districtCodeToStr(city) {
        if (!city) return;
        const province = District.find(item => city[0] == item.value);
        const cityName = province.children
            ? province.children.find(item => city[1] == item.value)
            : { label: '' };
        return [province.label, cityName.label];
    },
    /**
     * 首尾去空格
     */
    trim(str) {
        return str.replace(/^\s+|\s+$/g, '');
    },
    /**
     * 回到顶部
     * @params speed 速度
     */
    goTop(speed) {
        const timer = setInterval(() => {
            let osTop = document.documentElement.scrollTop || document.body.scrollTop;
            let s = parseInt(speed) || Math.floor(-osTop / 5);
            document.documentElement.scrollTop = document.body.scrollTop = osTop + s;
            if (osTop === 0) {
                clearInterval(timer);
            }
        }, 30);
    },
    // 复制到剪切板
    copyText(text) {
        // 数字没有 .length 不能执行selectText 需要转化成字符串
        const textString = text.toString();
        let input = document.querySelector('#copy-input');
        if (!input) {
            input = document.createElement('input');
            input.id = 'copy-input';
            input.readOnly = 'readOnly'; // 防止ios聚焦触发键盘事件
            input.style.position = 'absolute';
            input.style.left = '-1000px';
            input.style.zIndex = '-1000';
            document.body.appendChild(input);
        }

        input.value = textString;
        // ios必须先选中文字且不支持 input.select();
        selectText(input, 0, textString.length);
        if (document.execCommand('copy')) {
            document.execCommand('copy');
        }
        input.blur();

        function selectText(textbox, startIndex, stopIndex) {
            if (textbox.createTextRange) {
                //ie
                const range = textbox.createTextRange();
                range.collapse(true);
                range.moveStart('character', startIndex); //起始光标
                range.moveEnd('character', stopIndex - startIndex); //结束光标
                range.select(); //不兼容苹果
            } else {
                //firefox/chrome
                textbox.setSelectionRange(startIndex, stopIndex);
                textbox.focus();
            }
        }
    },
    getSrPathName() {
        const { origin } = window.location;
        if (origin.includes('//dev1') || origin.includes('//localhost')) {
            return '/sr/itg';
        } else if (origin.includes('//dev2')) {
            return '/sr/qa';
        }
        return '/sr/production';
    },
    compressCanvasWithPromise(base64, w, quality = 0.6) {
        var newImage = new Image();
        newImage.src = base64;
        newImage.setAttribute('crossOrigin', 'Anonymous'); //url为外域时需要
        var imgWidth, imgHeight;
        return new Promise((resolve) => {
            newImage.onload = function () {
                imgWidth = this.width;
                imgHeight = this.height;
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                if (Math.max(imgWidth, imgHeight) > w) {
                    if (imgWidth > imgHeight) {
                        canvas.width = w;
                        canvas.height = (w * imgHeight) / imgWidth;
                    } else {
                        canvas.height = w;
                        canvas.width = (w * imgWidth) / imgHeight;
                    }
                } else {
                    canvas.width = imgWidth;
                    canvas.height = imgHeight;
                }
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
                var base64 = canvas.toDataURL('image/jpeg', quality);
                resolve(base64);
            };
        })

    },

    compressCanvas(base64, w, name) {
        var newImage = new Image();
        var quality = 0.6; //压缩系数0-1之间
        newImage.src = base64;
        newImage.setAttribute('crossOrigin', 'Anonymous'); //url为外域时需要
        var imgWidth, imgHeight;
        newImage.onload = function () {
            imgWidth = this.width;
            imgHeight = this.height;
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            if (Math.max(imgWidth, imgHeight) > w) {
                if (imgWidth > imgHeight) {
                    canvas.width = w;
                    canvas.height = (w * imgHeight) / imgWidth;
                } else {
                    canvas.height = w;
                    canvas.width = (w * imgWidth) / imgHeight;
                }
            } else {
                canvas.width = imgWidth;
                canvas.height = imgHeight;
                quality = 0.6;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
            var base64 = canvas.toDataURL('image/jpeg', quality);
            localStorage.setItem(name, base64);
        };
    },
};
export const deBounce = (func, wait) => {
    let timeOut = null;
    return function (...args) {
        clearTimeout(timeOut); //一定要清除定时器
        timeOut = setTimeout(() => {
            func(...args);
        }, wait);
    };
};
