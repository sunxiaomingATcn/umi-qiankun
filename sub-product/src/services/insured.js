// import { stringify } from 'qs';
import request from '@/utils/request';
import { getCustomerToken } from '@/utils/tool/customer';

// 投保模板
export async function insureInfo(params) {
    // 客户token
    const token = getCustomerToken();
    return request(`/baoying-product-center/api/order/template?blade-auth=${token}&productId=${params.id}&quoteId=${params.quoteId}`);
}

// 投保信息填写
export async function submitInsure(params) {
    // 客户token
    const token = getCustomerToken();
    return request(`/baoying-product-center/api/order?blade-auth=${token}`, {
        method: 'POST',
        body: params.params,
        // headers: { token: params.token }
    });
}

// 根据预定id获取采集数据
export async function dataAcquisition(params) {
    return request(`/baoying-product-center/api/product/data/collection?id=${params.id}`);
}

//记录用户轨迹
export async function tracks(params) {
    return Promise.resolve()
    // return request(`/api/policies/tracks`,{
    //     method:"POST",
    //     body:params,
    // })
}


// 投保发送验证码
export async function sendValidation(params) {
    // 客户token
    const token = getCustomerToken();
    const formdata = new FormData();
    formdata.append('mobile',params.mobile)
    formdata.append('sign','cheche')
    return request(`/blade-resource/sms/sendVerificationCodeBySign?blade-auth=${token}`, {
        method: 'POST',
        body: formdata
    });
}


