import { stringify } from 'qs';
import request from '@/utils/request';
import { getCustomerToken } from '@/utils/tool/customer';

// 获取车险订单列表
export async function queryList(params) {
  return request(`/baoying-car-insurance/front/orders`, {
    method: 'POST',
    body: params
  });
}

// 车险删除订单
export async function removeOrder(params) {
  return request(`/baoying-car-insurance/front/order?${stringify(params)}`, {
    method: 'DELETE'
  });
}

// 车险订单详情
export async function queryDetail(params) {
  return request(`/baoying-car-insurance/front/order/detail?${stringify(params)}`);
}

// 关闭订单
export async function closeOrder(params) {
  return request(`/baoying-car-insurance/front/order/close?${stringify(params)}`, {
    method: 'PUT'
  });
}

// 车险订单获取支持支付方式
export async function getPayMethods(params) {
  return request(`/baoying-car-insurance/front/pay/mode?${stringify(params)}`);
}

// 车险订单获取支付二维码
export async function getPayQRcode(params) {
  return request(`/baoying-car-insurance/front/pay/qrcode?${stringify(params)}`);
}

// 车险订单查询支付是否成功
export async function getPayStatus(params) {
  return request(`/baoying-car-insurance/front/pay/status?${stringify(params)}`);
}

// 发送验证码
export async function sendCode(params) {
  return request(`/baoying-car-insurance/front/send/code?${stringify(params)}`);
}

// 校验验证码
export async function validCode(params) {
  return request(`/baoying-car-insurance/front/valid/code?${stringify(params)}`);
}

// 获取电子保单
export async function getElectronic(params) {
  return request(`/baoying-car-insurance/front/electronic/insurance?${stringify(params)}`);
}

// 保单详情
export async function queryPolicyDetail(params) {
  return request(`/baoying-car-insurance/performance/policy/detail/${params.id}`);
}