import * as requestMethod from '@/services/customer';
import { Toast } from 'antd-mobile';

export default {
    namespace: 'customer',
    state: {

    },
    effects: {
        *getCustomerList({ payload }, { call, put }) {
            const response = yield call(requestMethod.getCustomerList, payload);
            if (response && response.code === 200) {
            } else {
                Toast.fail(`${response.msg}`);
            }
            return response;
        },
        *getCustomerBirthdayList({ payload }, { call, put }) {
            const response = yield call(requestMethod.getCustomerBirthdayList, payload);
            if (response && response.code === 200) {
            } else {
                Toast.fail(`${response.msg}`);
            }
            return response;
        },
        *customerSave({ payload }, { call, put }) {
            const response = yield call(requestMethod.customerSave, payload);
            if (response && response.code === 200) {
            } else {
                Toast.fail(`${response.msg}`);
            }
            return response;
        },
        *customerDetail({ payload }, { call, put }) {
            const response = yield call(requestMethod.customerDetail, payload);
            if (response && response.code === 200) {
            } else {
                Toast.fail(`${response.msg}`);
            }
            return response;
        },
        *queryCustomerDetail({ payload }, { call, put }) {
            const response = yield call(requestMethod.queryCustomerDetail, payload);
            if (response && response.code === 200) {
            } else {
                Toast.fail(`${response.msg}`);
            }
            return response;
        },
        *queryCustomerPolicyList({ payload }, { call, put }) {
            const response = yield call(requestMethod.queryCustomerPolicyList, payload);
            if (response && response.code === 200) {
            } else {
                Toast.fail(`${response.msg}`);
            }
            return response;
        },
    },
    reducers: {
        saveSubmitInsured(state, action) {
            return {
                ...state,
                insured: action.payload,
            };
        },
    },
};
