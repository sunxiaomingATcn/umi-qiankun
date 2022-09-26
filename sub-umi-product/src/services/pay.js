import { stringify } from 'qs';
import request from '@/utils/request';

// 获取支付信息
export async function queryPaymentChannel(param) {
    return request(`/rest/api/third_product/payment_channel/${param.id}`,{
        headers:{token:param.token}
    });
}

export async function thirdPartPayment(params){
    return request(`/rest/api/third_product/payment`, {
        method: 'POST',
        body: params.params,
        headers:{token:params.token}
    });
}

export async function payment(params){
    return request(`/rest/api/abao_product/payment/sign`, {
        method: 'POST',
        body: params.params,
        headers:{token:params.token}
    });
}
