import * as requestMethod
    from "@/services/health";
import { Toast } from 'antd-mobile';
export default {
    namespace: 'healthNew',
    state: {
        healthStatement: [],
        submitReturn:null
    },
    effects: {
        // 获取安盛健康告知
        * healthStatementInfo({ payload }, { call, put }) {
            const response = yield call(requestMethod.getHealthStatement, payload);
            if (response && response.code === 0) {
                yield put({
                    type: 'getHealthStatement',
                    payload: response.payload,
                });
                return response;
            } else {
                Toast.fail(`${response.message}`);
            }
        },
    },
    reducers: {
        getHealthStatement(state, action) {
            return {
                ...state,
                healthStatement: action.payload
            };
        }
    },
};
