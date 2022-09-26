import { stringify } from 'qs';
import request from '@/utils/request';


// 列表
export async function queryList(params) {
    return request(`/blade-system/cyclopedia/page?${stringify(params)}`);
}

// 详情
export async function queryDetail(params) {
  return request(`/blade-system/cyclopedia/detail?${stringify(params)}`);
}

//获取字典
export async function queryDictionary(params) {
  return request(`/blade-system/dict/dictionary?code=${params.code}`);
}

