import request from '@/utils/request';
import { stringify } from 'qs';

const getToken = (wechatFlag) => (`${wechatFlag == 1 ? localStorage.getItem("wechat_user_token") : localStorage.getItem("zx_ayb_token")}`)

export async function tracks(params) {
    return request(`/rest/api/policies/tracks`, {
        method: 'POST',
        body: params
    });
}

export async function status(params) {
    const token = getToken(params.wechatFlag)
    return token === 'null' ? Promise.resolve({ code: 1001, message: '无token' }) :
        request(`/rest/api/insurance_acquisition/status?${stringify(params)}`, {
            headers: {
                token: `Bearer ${token}`
            }
        })
}

export async function register(params) {
    return request(`/rest/api/insurance_acquisition/register?${stringify(params)}`);
}

export async function submit(params) {
    return request(`/rest/api/insurance_acquisition/submit`, {
        method: 'POST',
        body: params,
        headers: {
            token: `Bearer ${getToken(params.wechatFlag)}`
        }
    });
}