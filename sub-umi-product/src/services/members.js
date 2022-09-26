import request from '@/utils/request';

// 会员登录
export async function membersLogin(params) {
    return request(`/rest/api/member/login`, {
        method: 'POST',
        body: params,
    });
}

// 会员短信验证码验证
export async function memberCodeValid(params) {
    return request(`/rest/api/validation/member/valid`, {
        method: 'POST',
        body: params,
    });
}

// 会员激活图片验证
export async function memberCaptchaValid(params) {
    return request(`/rest/api/captcha/valid`, {
        method: 'POST',
        body: params,
    });
}

// 会员激活(登陆激活)
export async function memberActive(params) {
    return request(`/rest/api/member/active`, {
        method: 'PUT',
        body: params,
    });
}

// 一键激活（注册激活）
export async function memberRegister(params) {
    return request(`/rest/api/member/register`, {
        method: 'POST',
        body: params,
    });
}
