import * as requestMethod from '@/services/InsuranceEncyclopedia';
import { Toast } from 'antd-mobile';

export default {
    namespace: 'InsuranceEncyclopedia',
    state: {},
    effects: {
        *queryList({ payload }, { call, put }) {
            const response = yield call(requestMethod.queryList, payload);
            if (response && response.code === 200) {
                return response;
            } else {
                Toast.fail(`${response.msg}`);
            }
        },
        *queryDictionary({ payload }, { call, put }) {
            console.log(payload);
            const response = yield call(requestMethod.queryDictionary, payload);
            if (response && response.code === 200) {
                return response;
            } else {
                Toast.fail(`${response.msg}`);
            }
        },
        *queryDetail({ payload }, { call, put }) {
            const response = yield call(requestMethod.queryDetail, payload);
            if (response && response.code === 200) {
                return response;
            } else {
                Toast.fail(`${response.msg}`);
            }
        },
    },
    reducers: {
        // saveList(state, action) {
        //     return {
        //         ...state,
        //     };
        // },
    },
};
