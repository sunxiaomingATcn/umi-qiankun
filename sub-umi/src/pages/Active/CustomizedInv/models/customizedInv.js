import * as requestMethod from "@/services/customizedInv";
export default {
    namespace: 'customizedInv',
    state: {
    },
    effects: {
        *queryUserInfo({ payload }, { call, put }) {
            const response = yield call(requestMethod.queryUserInfo)
            return response;
        },
        * searchCrmUserByPhone({ payload }, { call, put }) {
            const response = yield call(requestMethod.searchCrmUserByPhone, payload.mobile)
            return response;
        },
        // submit
        * queryPoster({ payload }, { call, put }) {
            const response = yield call(requestMethod.queryPoster, payload.content)
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
