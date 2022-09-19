import * as requestMethod
    from "@/services/policy";
import { Toast } from 'antd-mobile';

export default {
    namespace: 'policy',
    state: {
        queryPoliciesList: {
            list: []
        },
        queryPoliciesDetail: null,
    },
    effects: {
        // 获取保单列表
        * queryPoliciesList({ payload }, { call, put }) {
            yield put({
                type: 'saveQueryPoliciesList',
                payload: {
                    list: []
                },
            });
            const response = yield call(requestMethod.queryPoliciesList, payload);
            if (response && response.code === 0) {
                yield put({
                    type: 'saveQueryPoliciesList',
                    payload: {
                        list: response.payload,
                        // pagination:response.meta.pagination
                    },
                });
            } else {
                // Toast.info(`${response.message}`);
            }
            return response;
        },
        // 清空保单列表
        * clearPoliciesList({ payload }, { call, put }) {
            yield put({
                type: 'saveQueryPoliciesList',
                payload: {
                    list: []
                },
            });
        },
        // 获取保单详情
        * queryPoliciesDetail({ payload }, { call, put }) {
            yield put({
                type: 'saveQueryPoliciesDetail',
                payload: null
            });
            const response = yield call(requestMethod.queryPoliciesDetail, payload);
            if (response && response.code === 0) {
                yield put({
                    type: 'saveQueryPoliciesDetail',
                    payload: response.payload,
                });
            } else {
                response && Toast.info(`${response.message}`);
            }
            return response;
        },
        // 更新电子保单
        * queryPolicieUpdate({ payload }, { call, put }) {
            const response = yield call(requestMethod.queryPolicieUpdate, payload);
            if (response && response.code !== 0) {
                Toast.info(`${response.message}`);
            }
            return response;
        },
        // 微信绑定CRM
        * wechatBindCrmId({ payload }, { call, put }) {
            return yield call(requestMethod.wechatBindCrmId, payload);
        },
        // 微信解除绑定CRM
        * wechatUnBindCrmId({ payload }, { call, put }) {
            const response = yield call(requestMethod.wechatUnBindCrmId, payload);
            if (response && response.code !== 0) {
                Toast.info(`${response.message}`);
            }
            return response;
        },
    },
    reducers: {
        saveQueryPoliciesList(state, action) {
            return {
                ...state,
                queryPoliciesList: action.payload
            };
        },
        saveQueryPoliciesDetail(state, action) {
            return {
                ...state,
                queryPoliciesDetail: action.payload
            };
        },
    },
};
