// import { stringify } from 'qs';
import request from '@/utils/request';


// 齐欣获取健康告知
export async function queryHealthStatement(params) {

    return request(`/rest/api/third_product/health_statement`, {
        method: 'POST',
        body: params
    });
}

// 齐欣提交健康告知
export async function SubmitHealthStatement(params) {

    return request(`/rest/api/third_product/submit_health_statement`, {
        method: 'POST',
        body: params
    });
}

// 获取健康告知
export async function getHealthStatement(params) {
    return request(`/baoying-product-center/api/product/health/detail/${params.id}`);
}

