import request from '@/utils/request';
import { stringify } from 'qs';

export async function submitCustomized(params) {
    return request("/rest/api/home_customization/v3/submit", {
        method: 'POST',
        body: params,
    });
}

// 获取用户家庭定制信息
export async function queryCustomizationInfo(params) {
    return request(`/rest/api/home_customization/v3/status?${stringify(params)}`);
}

// 获取用户家庭定制订单信息
export async function initCustomizationOrder(params) {
    return request(`/rest/api/home_customization/v3/history?${stringify(params)}`);
}

// 获取家庭定制预约时间
export async function queryCustomizationDate(params) {
    return request(`/rest/api/home_customization/v3/date`);
}

// 非微信手机号获取表单填写状态
export async function queryHomeCustomizationInfo(params) {
    return request(`/rest/api/home_customization/v3/mobile?${stringify(params)}`);
}

//非阿保用户submit家庭定制
export async function submitUnUserCustomized(params) {
    return request("/rest/v3/api/home_customization", {
        method: 'POST',
        body: params,
    });
}

// 非微信支付订单
export async function getCrmUserKey(params) {
    return request("/rest/api/pay_order/getCrmUserKey", {
        method: 'POST',
        body: params,
    });
}
export async function short_video_submit(params) {
    return request("/rest/api/short_video_acquisition/submit", {
        method: 'POST',
        body: params,
        headers: {
            token: `Bearer ${localStorage.getItem('token')}`
        }
    });
}

// v2 获取新增获取优惠倒计时、份数接口
export async function queryDiscount() {
    return request(`/rest/api/home_customization/v3/discount`);
}

// v2 非微信支付创建订单
export async function getPayOrderIdNoWechat(params) {
    return request("/rest/api/pay_order/v3/getPayOrderIdNoWechat", {
        method: 'POST',
        body: params,
        headers: {
            token: `Bearer ${localStorage.getItem('token')}`
        }
    });
}

// v2 非微信获取表单填写状态
export async function queryHomeCustomizationInfoV2(params) {
    return request(`/rest/api/home_customization/v3/statusNoWechat?${stringify(params)}`, {
        headers: {
            token: `Bearer ${localStorage.getItem('cus_unwechat_token')}`
        }
    });
}

//v2 非微信submit家庭定制
export async function submitUnUserCustomizedV2(params) {
    return request("/rest/api/home_customization/v3/submitNoWechat", {
        method: 'POST',
        body: params,
        headers: {
            token: `Bearer ${localStorage.getItem('cus_unwechat_token')}`
        }
    });
}