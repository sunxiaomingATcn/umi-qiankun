import { stringify } from 'qs';
import request from '@/utils/request';

export async function queryArea(params) {
  return request(`/blade-system/area/query?${stringify(params)}`);
}
export async function queryCity(params) {
  return request(`/blade-system/area/getCity?${stringify(params)}`);
}
export async function queryWeatherLive(params) {
  return request(`/blade-system/weather/live?${stringify(params)}`);
}
export async function queryWeatherDetail(params) {
  return request(`/blade-system/weather/detail?${stringify(params)}`);
}
export async function queryNoticeList(params) {
  return request(`/blade-system/notice/page?${stringify(params)}`);
}

export async function queryNoticeDetail(id) {
  return request(`/blade-system/notice/${id}`);
}
export async function queryUserDetail(id) {
  return request(`/blade-user/workuser/detail?id=${id}`);
}

//精选产品
export async function queryProductList() {
  return request(`/baoying-product-center/api/product?${stringify({
    pageCount:1,
    pageSize:3
  })}`);
}
//精选产品(新)
export async function queryProductListNew() {
  return request(`/baoying-product/tenant/product/library/ppb?${stringify({
    isRecommend:1,
  })}`);
}
//精选百科
export async function queryEncyList() {
  return request(`/blade-system/cyclopedia/page?${stringify({
    current:1,
    size:3
  })}`);
}
//解绑微信
export async function unbindWechat(id) {
  return request(`/blade-user/workuser/unbind/${id}`,{
    method: 'POST',
  });
}
//解绑微信
export async function agree({wechatId,id}) {
  return request(`/blade-user/workuser/agree/${wechatId}/${id}`,{
    method: 'POST',
  });
}