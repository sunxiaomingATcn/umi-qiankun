import { stringify } from 'qs';
import request from '@/utils/request';
//获取规则获取补充信息动态字段
export async function getDynamicFields(params) {
  return request(`/baoying-car-insurance/front/rule?${stringify(params)}`);
}
//获取上传oss配置
export async function getOSSSettings() {
  return request(`/blade-resource/oss/getPolicy`);
}

//获取oss链接
export async function getOSSUrl(osskey) {
  return request(`/blade-resource/oss/endpoint/file-link?fileName=${encodeURIComponent(osskey)}`);
}

// 获取省code与省别名映射列表
export async function alias() {
  return request(`/baoying-car-insurance/front/code/alias`,{
    headers:{
      // 'Content-Type':'application/x-www-form-urlencoded'
    }
  });
}

// 获取当前用户所属机构地区集合
export async function region() {
  return request(`/baoying-car-insurance/front/region`);
}
// 获取广东省可选市区
export async function regionGD() {
  return request(`/baoying-car-insurance/front/gd/city`);
}

// 获取车辆信息
export async function car(params) {
  return request(`/baoying-car-insurance/front/car?carLicenseNo=${params.carLicenseNo}`);
}
// ocr识别证件
export async function ocr(params) {
  return request(`/baoying-car-insurance/front/ocr`,{
    method:'POST',
    body: params
  });
}

//完善车辆信息
export async function completeCar(params) {
  return request(`/baoying-car-insurance/front/check/car`,{
    method:'POST',
    body: params
  });
}

// 获取当前租户是否开通续保查询能力
export async function renewal() {
  return request(`/baoying-car-insurance/front/renewal`);
}
// 获取投保方案列表
export async function plans() {
  return request(`/baoying-car-insurance/front/plans`);
}
// 获取车型列表
export async function model(params) {
  return request(`/baoying-car-insurance/front/model?${stringify(params)}`);
}

// 续保查询
export async function xbcx(params) {
  return request(`/baoying-car-insurance/front/renewal`,{
    method:'POST',
    body: params
  });
}

// 获取证件类型
export async function cardTypes() {
  return request(`/baoying-car-insurance/front/card/types`);
}

// 提交报价基础信息
export async function quoteCommit(params) {
  return request(`/baoying-car-insurance/front/quote/commit`,{
    method:'POST',
    body: params
  });
}
//获取可报价保司账号信息列表
export async function companys(params) {
  return request(`/baoying-car-insurance/front/account?${stringify(params)}`);
}

// 去报价调用
export async function quote(params) {
  return request(`/baoying-car-insurance/front/quote`,{
    method:'POST',
    body: params
  });
}

//获取报价结果
export async function quotes(params) {
  return request(`/baoying-car-insurance/front/quotes?${stringify(params)}`);
}

// 修改车型后,去报价调用
export async function byModel(params) {
  return request(`/baoying-car-insurance/front/quote/byModel`,{
    method:'POST',
    body: params
  });
}

//获取成功报价详情列表
export async function details(params) {
  return request(`/baoying-car-insurance/front/quote/details?${stringify(params)}`);
}
//获取分享的报价详情
export async function shareDetail(params) {
  return request(`/baoying-car-insurance/front/quote/detail?${stringify(params)}`);
}
//获取报价关联人员信息
export async function persons(params) {
  return request(`/baoying-car-insurance/front/persons?${stringify(params)}`);
}

// 提交订单
export async function commit(params) {
  return request(`/baoying-car-insurance/front/order/commit`,{
    method:'POST',
    body: params
  });
}
