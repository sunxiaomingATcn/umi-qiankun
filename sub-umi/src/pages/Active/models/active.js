import * as requestMethod from "@/services/active";
export default {
    namespace: 'active',
    state: {
        mobile: "",
        customizationInfo: {},
        crmUserKey: localStorage.getItem("crmUserKey") || null
    },
    effects: {
        *submitCustomized({ payload }, { call, put }) {
            const response = yield call(requestMethod.submitCustomized, payload)
            return response;
        },
        *queryCustomizationInfo({ payload }, { call, put }) {
            const response = yield call(requestMethod.queryCustomizationInfo, payload)
            if (response && response.code === 0) {
                yield put({
                    type: "saveCustomizationInfo",
                    payload: response.payload
                })
            }
            return response;
        },
        *initCustomizationOrder({ payload }, { call, put }) {
            const response = yield call(requestMethod.initCustomizationOrder, payload)
            return response;
        },
        *short_video_submit({ payload }, { call, put }) {
            const response = yield call(requestMethod.short_video_submit, payload)
            return response;
        },
        * getCrmUserKey({ payload }, { call, put }) {
            const response = yield call(requestMethod.getCrmUserKey, payload)
            if (response && response.code === 0) {
                yield put({
                    type: "saveCrmUserKey",
                    payload: response.payload
                })
            }
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
        saveCrmUserKey(state, action) {
            const { crmUserKey } = action.payload;
            localStorage.setItem("crmUserKey", crmUserKey)
            return {
                ...state,
                crmUserKey: crmUserKey
            };
        },
    },
};
