import { stringify } from 'qs';
import request from '@/utils/request';

export async function sendCode(params) {
    return request(`/rest/api/article_acquisition/judge`, {
        method: 'POST',
        body: params
    });
}

export async function submit(params) {
    return request(`/rest/api/article_acquisition/submit`, {
        method: 'POST',
        body: params
    });
}