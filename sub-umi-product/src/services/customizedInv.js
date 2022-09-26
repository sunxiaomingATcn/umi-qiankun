import { stringify } from 'qs';
import request from '@/utils/request';

// export async function sendCode(mobile) {
//     return request(`/rest/api/article_acquisition/judge?mobile=${mobile}`);
// }

// export async function submit(params) {
//     return request(`/rest/api/article_acquisition/submit`, {
//         method: 'POST',
//         body: params
//     });
// }

export async function queryUserInfo() {
    return request(`/rest/api/user_center/crm/user`, {
        headers: {
            token: "Bearer " + localStorage.getItem("wechat_user_token")
        }
    });
}

export async function queryPoster(url) {
    return request(`/rest/api/user_center/poster?content=${encodeURIComponent(url)}`)
}

export async function searchCrmUserByPhone(mobile) {
    return request(`/rest/api/user_center/crm/user/${mobile}`)
}