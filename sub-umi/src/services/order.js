import { stringify } from 'qs';
import request from '@/utils/request';
import { getCustomerToken } from '@/utils/tool/customer';

// 获取订单列表
export async function queryList(params) {
  return request(`/baoying-life-insurance/life/purchase/public/list?${stringify(params)}`);
}

// 订单详情
export async function queryDetail(params) {
  const query = { purchaseOrderId: params.id, ...params, id: undefined }
  return request(`/baoying-life-insurance/life/purchase/public/getPolicyDetail?${stringify(query)}`);
}

// 续期列表
export async function queryRenewalList(params) {
  return request(`/baoying-life-insurance/life/purchase/public/renewalList?${stringify(params)}`);
}

// 续期详细
export async function queryRenewalDetail(params) {
  return request(`/baoying-life-insurance/life/purchase/public/getRenewalDetail?renewalId=${params.id}`);
}

// 代理人 人身险 保单详情
export async function queryAgentPolicyDetail(params) {
  return request(`/baoying-life-insurance/life/policies/public/getPolicyDetail?${stringify(params)}`);
}

// 删除人身险订单
export async function removeOrder(params) {
  return request(`/baoying-life-insurance/life/purchase/${params.id}`, {
    method: 'DELETE'
  });
}

// 关闭人身险订单
export async function closeOrder(params) {
  return request(`/baoying-life-insurance/life/purchase/close/${params.id}`, {
    method: 'PUT'
  });
}


//=================================================================================================

// 获取支付链接
export async function getPaymentLink(params) {
  const query = {
    'blade-auth': getCustomerToken(), // 客户token
    orderId: params.orderId || params.purchaseOrderId,
    type: params.type ? params.type : undefined, // 非车1
  }
  return request(`/baoying-product-center/api/order/payment?${stringify(query)}`);
}

// 非车详情
export async function queryPolicyDetail(params) {
  return request(`/baoying-product-center/api/order/policy/detail?${stringify(params)}`);
}

//非车详情
export async function queryOrderDetail(params) {
  return request(`/baoying-product-center/api/order/policy/order/detail?${stringify(params)}`);
}
