import * as requestMethod from "@/services/articles";
export default {
    namespace: 'articles',
    state: {
    },
    effects: {
        *sendCode({ payload }, { call, put }) {
            const response = yield call(requestMethod.sendCode, payload)
            return response;
        },
        // submit
        * submit({ payload }, { call, put }) {
            const response = yield call(requestMethod.submit, payload)
            return response;
        },
    },
    reducers: {
        saveCustomizationInfo(state, action) {
            return {
                ...state,
                customizationInfo: action.payload
            };
        },
    },
};
