import { stringify } from 'qs';
import request from '@/utils/request';

const getUserId = () => {
    const userInfo = localStorage.getItem("userInfo");
    const { id: userWorkId } = userInfo ? JSON.parse(userInfo) : {};
    return userWorkId;
}
export async function getCustomerList(params) {
    return request(`/blade-user/customerInfo/list/${getUserId()}?${stringify(params)}`)
}

export async function getCustomerBirthdayList(params) {
    return request(`/baoying-life-insurance/customer/birthday?${stringify(params)}`);
}

export async function customerDetail(params) {
    return request(`/blade-user/customerInfo/getPolicyListByTwoId/${getUserId()}/${params.id}`);
}

export async function  queryCustomerDetail(params){
    return request(`/blade-user/customerInfo/info/${params.id}`)
}

export async function customerSave(params) {
    return request(`/baoying-life-insurance/customer/save`, {
        method: 'POST',
        body: params
    });
}

export async function queryCustomerPolicyList(params){
    return request(`/blade-user/customerInfo/getPolicyListAndOrderListByUserWorkIdAndCustomerId/${getUserId()}/${params.id}`)
}