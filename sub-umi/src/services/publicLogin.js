import { stringify } from 'qs';
import request from '@/utils/request';

// 发送登录短信验证码
export async function sendVerification(params) {
  return request(`/blade-auth/login/verification?${stringify(params)}`, {
    method: 'POST',
    body: params,
  });
}
// 发送注册短信验证码
export async function sendRegVerification(params) {
  return request(`/blade-user/workuser/mobile/sms?${stringify(params)}`, {
    method: 'POST',
    body: params,
  });
}
// 展业端登录接口
export async function login(params) {
  return request(`/blade-auth/login`, {
    method: 'POST',
    body: params,
  });
}

// 展业端注册接口
export async function regist(params) {
  return request(`/blade-user/workuser/register`, {
    method: 'POST',
    body: params,
  });
}
// 获取openid接口
export async function getOpenid(code) {
  return request(`/blade-system/wechat/js/openid?code=${code}`);
}
// 根据手机号获取租户
export async function queryTenant(mobile) {
  return request(`/blade-auth/login/get_tenants/${mobile}`);
}
// 根据租户Id获取协议/政策
export async function queryTenantAgreement(tenant) {
  return request(`/blade-system/privacy_agreement/${tenant}`);
}