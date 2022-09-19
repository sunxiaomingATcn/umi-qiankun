import * as requestMethod from "@/services/poster";
export default {
    namespace: 'poster',
    state: {
    },
    effects: {
        *submit({ payload }, { call, put }) {
            const response = yield call(requestMethod.submit, payload)
            return response;
        },
        
    },
    reducers: {
        
    },
};
