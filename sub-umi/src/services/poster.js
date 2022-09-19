import request from '@/utils/request';

export async function submit(params) {
    return request("/rest/api/poster_appointment/submit", {
        method: 'POST',
        body: params,
    });
}
