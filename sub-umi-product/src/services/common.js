import { stringify } from 'qs';
import request from '@/utils/request';
import { getCustomerToken } from '@/utils/tool/customer';

// 获取职业分类列表
export async function queryJobList(params) {
    return request(`/rest/api/third_product/jobs/${params.id}`);
}

// 获取投保地区
export async function getArea({ vendorCode = 'fuxing' } = {}) {
    return request(`/baoying-product-center/api/area_accounter/${vendorCode}`);
}

// 获取地区
export async function getAreaList() {
    return request(`/blade-system/region/tree`);
}

//获取字典
export async function queryDictionary(params) {
    return request(`/blade-system/dict/dictionary?code=${params.code}`);
}

// 获取投保职业
export async function getProfession() {
    return request(`/rest/api/profession`);
}

// 复兴职业分类表更新
export async function getFxProfession(params) {
    const token = getCustomerToken();
    params = { ...params, token }
    const vendorCode = params.vendorCode || 'fuxing';
    return request(`/baoying-product-center/api/profession_accounter/${vendorCode}?${stringify(params)}`);
}
// 获取微信sdk配置
export async function WxSdkConfig(params) {
    // return Promise.resolve()
    return request(`/blade-system/wechat/js/config?page=${encodeURIComponent(params)}`);
}

// 获取微信网页授权地址
export async function wxAuthorizeUrl(callbackUrl) {
    return request(`/rest/api/user_center/wechat/oauth/code?state=${callbackUrl}`)
}

// 获取用户信息
export async function userInfo() {
    return request(`/rest/api/user_center/userinfo`);
}

// 微信登录
export async function wechatLogin(params) {
    params.channel = params.channel == 'undefined' ? "" : params.channel
    return request(`/rest/api/user_center/wechat/login`, {
        method: 'POST',
        body: params
    });
}

// 微信用户信息
export async function wechatUserInfo() {
    return request(`/rest/api/user_center/userinfo`, {
        headers: {
            token: "Bearer " + localStorage.getItem("wechat_user_token")
        }
    });
}

// 复兴职业分类表更新 storyID=1545
export async function getJdalProfession(params) {
    return request(`/rest/api/profession/allianz360?${stringify(params)}`);
}