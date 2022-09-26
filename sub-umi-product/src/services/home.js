import { stringify } from 'qs';
import request from '@/utils/request';

// 获取分类列表
export async function queryCategoryList() {
    return request(`/baoying-product-center/api/product/categories`);
}

// 获取产品列表
export async function queryProductList(param) {
    return request(`/baoying-product-center/api/product?${stringify(param)}`)
}

// 跳转链接
export async function jumpLink(param) {
    return request(`/baoying-product-center/api/product/${param.id}/link?${stringify(param)}`);
}

//列表
export async function queryTableList(params) {
    return request(`/baoying-product/tenant/product/library/ppb?${stringify(params)}`);
}
