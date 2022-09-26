import { stringify } from 'qs';
import request from '@/utils/request';

// 获取保单列表
export async function queryPoliciesList(param) {
    param.pageCount = param.pageCount ? param.pageCount : 1;
    return request(`/rest/api/policies/search?${stringify(param)}`);
}

// 获取保单详情
export async function queryPoliciesDetail(param) {
    return request(`/rest/api/policies/${param.policyId}/search?${stringify(param)}`);
}

// 更新电子保单
export async function queryPolicieUpdate(id) {
    return request(`/rest/api/policies/${id}`, {
        method: 'PATCH'
    });
}

// 微信和crm客户关系绑定
export async function wechatBindCrmId(params) {
    return request(`/rest/api/wechat_customer/bind`, {
        method: 'POST',
        body: {
            token: localStorage.getItem("wechat_user_token"),
            ...params
        }
    });
}

//微信和crm客户关系解绑
export async function wechatUnBindCrmId() {
    return request(`/rest/api/wechat_customer/unbind/${localStorage.getItem("wechat_user_token")}`, {
        method: 'PUT'
    });
}