import { stringify } from 'qs';
import request from '@/utils/request';

// 意见反馈
export async function submitSuggestion(params) {
  return request(`/blade-system/feedback`, {
    method: 'POST',
    body: params,
  });
}
//团队关系职级统计
export async function entry_statistic() {
  return request(`/blade-user/workuser/entry_statistic`);
}
//团队关系查询
export async function team_relation(params) {
  return request(`/blade-user/workuser/team_relation?${stringify(params)}`);
}

//团队业绩排行榜 (人身险)
export async function teamRankList(params) {
  return request(`/baoying-life-insurance/life/purchase/leaderboard?${stringify(params)}`);
}

//团队业绩排行榜 (车险)
export async function carTeamRankList(params) {
  return request(`/baoying-car-insurance/performance/team?${stringify(params)}`);
}

//公众号订单列表
export async function orderList(params) {
  return request(`/baoying-life-insurance/life/purchase/public/list?${stringify(params)}`);
}

//更新头像
export async function updateImage(params) {
  return request(`/blade-user/workuser/headimg`, {
    method: 'POST',
    body: params,
  });
}

//更改手机号码前校验
export async function beforeCheck(params) {
  return request(`/blade-user/workuser/mobile/verify`, {
    method: 'PUT',
    body: params,
  });
}

//更改手机号码
export async function changeMobile(params) {
  return request(`/blade-user/workuser/mobile/chanage`, {
    method: 'PUT',
    body: params,
  });
}


//邀请好友列表
export async function inviteFriend() {
  return request(`/blade-user/workuser/invite_friend`);
}

//查询对应租户列表
export async function tenants(params) {
  return request(`/blade-user/workuser/tenants/${params.id}`);
}

// 个人业绩车险
export async function carPersonal(params) {
  return request(`/baoying-car-insurance/performance/personal?${stringify(params)}`);
}