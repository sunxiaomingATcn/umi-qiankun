import { stringify } from 'qs';
import request from '@/utils/request';
import { getCustomerToken } from '@/utils/tool/customer';

// 默认试算
export async function queryDefaultTria(param) {
    const { id } = param;
    return request(`/api/third_product/default/trial/${id}`);
}

// 获取产品详情
export async function queryProductDetailNew(param) {
    const { id } = param;
    return request(`/baoying-product-center/api/product/${id}/detail`);
}

// 查询产品算费因子
export async function queryRestrictGenes(param) {
    return request(`/baoying-product-center/api/quote/${param.id}/restrict_genes`);
}

// 保费试算
export async function queryQuote(param) {
    const { id, info } = param;
    return request(`/baoying-product-center/api/quote/${id}`, {
        method: 'POST',
        body: info
    });
}

// 立即投保 保存报价
export async function saveQuote(param) {
    const { quoteCode, state } = param;
    return request(`/baoying-product-center/api/quote/save/${quoteCode}?${stringify(param)}`, {
        method: 'POST',
    });
}

// 获取算费详情（智能健告返回）
export async function queryQuoteDetail(param) {
    const { id } = param;
    return request(`/baoying-product-center/api/quote/${id}`);
}

// ocr识别
export async function ocrVehicleLicenseFront(params) {
    return request(`/blade-system/ocr/ocrVehicleLicenseFront`, {
        method: 'POST',
        body: params
    });
}

// 
export async function getIdentifyModelByVIN(params) {
    return request(`/baoying-product-center/api/cheSanBai/getIdentifyModelByVIN`, {
        method: 'POST',
        body: params
    });
}

// 基于车架号获取车辆估值 
export async function getEvalPriceByVIN(params) {
    return request(`/baoying-product-center/api/cheSanBai/getEvalPriceByVIN`, {
        method: 'POST',
        body: params
    });
}

// 通过车型id获取车型信息
export async function getCarModelInfo(params) {
    return request(`/baoying-product-center/api/cheSanBai/getCarModelInfo?${stringify(params)}`, {
        method: 'POST',
    });
}

//
export async function sendOrder(params) {
    return request(`/baoying-product-center/api/cheSanBai/sendOrder`, {
        method: 'POST',
        body: params
    });
}


//上传文件
export async function uploadFiles(params) {
    const token = getCustomerToken()
    return request(`/blade-resource/oss/upload?blade-auth=${token}`, {
        method: 'POST',
        body: params
    });
}

