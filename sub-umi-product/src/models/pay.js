import * as requestMethod from "@/services/pay";
import { Toast } from 'antd-mobile';


export default {
    namespace: 'pay',
    state: {
        healthStatement: null,
        submitReturn:null,
        paymentChannel:[],
        paymentInfo:null
    },
    effects: {
        // 获取支付方式
        * queryPaymentChannel({ payload }, { call, put }) {
            const response = yield call(requestMethod.queryPaymentChannel, payload);
            if (response && response.code === 0) {
                yield put({
                    type: 'saveQueryPaymentChannel',
                    payload: response,
                });
                return response;
            } else {
                Toast.fail(`${response.message}`);
            }
        },
        // 支付
        * paymentInfo({ payload }, { call, put }) {
            const response = yield call(requestMethod.payment, payload);
            if (response && response.code === 0) {
                yield put({
                    type: 'savePaymentInfo',
                    payload: response,
                });
                return response;
            } else {
                Toast.fail(`${response.message}`);
            }
        },
        * thirdPartPaymentInfo({ payload }, { call, put }) {
            const response = yield call(requestMethod.thirdPartPayment, payload);
            if (response && response.code === 0) {
                yield put({
                    type: 'savePaymentInfo',
                    payload: response,
                });
                return response;
            } else {
                Toast.fail(`${response.message}`);
            }
        }
    },
    reducers: {
        saveQueryPaymentChannel(state, action) {
            return {
                ...state,
                paymentChannel: action.payload.payload.channelsInfo
            };
        },
        savePaymentInfo(state, action) {
            return {
                ...state,
                paymentInfo: action.payload
            };
        }
    },
};
