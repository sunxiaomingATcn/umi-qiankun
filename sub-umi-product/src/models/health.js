import * as requestMethod
    from "@/services/health";
import { Toast } from 'antd-mobile';
import Modal from '@/components/modal';

export default {
    namespace: 'health',
    state: {
        healthStatement: null,
        submitReturn:null
    },
    effects: {
        // 获取健康告知
        * queryHealthStatementInfo({ payload }, { call, put }) {
            const response = yield call(requestMethod.queryHealthStatement, payload);
            if (response && response.code === 0) {
                yield put({
                    type: 'postHealthStatement',
                    payload: response,
                });
                return response;
            } else {
                Toast.fail(`${response.message}`);
            }
        },
        // 提交健康告知
        * submitHealthStatement({ payload }, { call, put }) {
            const response = yield call(requestMethod.SubmitHealthStatement, payload);
            if (response && response.code === 0) {
                yield put({
                    type: 'saveSubmitHealthStatement',
                    payload: response,
                });
                return response;
            } else if( response.code === -1){
                Modal.confirm({
                    content: '很抱歉，您不符合该产品投保条件，无法获得保障，如有疑问请咨询客服。',
                    okText: '联系客服 ',
                    cancelText: '我知道了',
                    onOk: () => window.location.href = 'https://www.sobot.com/chat/h5/index.html?sysNum=4debc641aefd4d859181fcca74633b67',
                    onCancel: () => console.log('cancel')
                });
                return response;
            }else {
                Toast.fail(`${response.message}`);
            }
        },

        // 获取安盛健康告知
        * healthStatementInfo({ payload }, { call, put }) {
            const response = yield call(requestMethod.getHealthStatement, payload);
            if (response && response.code === 0) {
                yield put({
                    type: 'getHealthStatement',
                    payload: response,
                });
                return response;
            } else {
                Toast.fail(`${response.message}`);
            }
        },
    },
    reducers: {
        postHealthStatement(state, action) {
            return {
                ...state,
                healthStatement: action.payload
            };
        },
        getHealthStatement(state, action) {
            return {
                ...state,
                healthStatement: action.payload
            };
        },
        saveSubmitHealthStatement(state, action) {
            return {
                ...state,
                submitReturn: action.payload
            };
        }
    },
};
