import { stringify } from 'qs';
import request from '@/utils/request';
import { getCustomerToken } from '@/utils/tool/customer';

// 发送验证码
export async function sendValidation(params) {
    // 客户token
    const token = getCustomerToken();
    const formdata = new FormData();
    formdata.append('mobile',params.mobile)
    return request(`/blade-resource/sms/sendVerificationCode?blade-auth=${token}`, {
        method: 'POST',
        body: formdata
    });
}

// 校验短信验证码
export async function validationCode(params) {
    return request(`/api/validation/valid`, {
        method: 'POST',
        body: params,
    });
}

// 获取图形验证码
export async function getCaptchaForSendMsgToMobile(params) {
    return request(`/blade-auth/captcha`);
}



