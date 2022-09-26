import request from '@/utils/request';
import { stringify } from 'qs';

export async function submitCustomized(params) {
    return request("/rest/api/home_customization/submit", {
        method: 'POST',
        body: params,
    });
}

// 获取用户家庭定制信息
export async function queryCustomizationInfo(amount) {
    return request(`/rest/api/home_customization/status?amount=${amount}`);
}

// 获取用户家庭定制订单信息
export async function initCustomizationOrder(params) {
    return request(`/rest/api/home_customization/history?${stringify(params)}`);
}

// 获取家庭定制预约时间
export async function queryCustomizationDate(params) {
    return request(`/rest/api/home_customization/date`);
}

// 非微信手机号获取表单填写状态
export async function queryHomeCustomizationInfo(params) {
    return request(`/rest/api/home_customization/mobile?businessVersion=special&${stringify(params)}`);
}

//非阿保用户submit家庭定制
export async function submitUnUserCustomized(params) {
    return request("/rest/api/home_customization", {
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
