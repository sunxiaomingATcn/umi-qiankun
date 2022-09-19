import * as requestMethod from "@/services/madeSpecial";
export default {
    namespace: 'activeCustom',
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
        // 非微信环境提交
        *submitUnUserCustomized({ payload }, { call, put }) {
            const response = yield call(requestMethod.submitUnUserCustomized, payload)
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
        * queryCustomizationDate(_, { call, put }) {
            const response = yield call(requestMethod.queryCustomizationDate)
            if (response && response.code === 0) {
                yield put({
                    type: "saveCustomizationDate",
                    payload: response.payload
                })
            }
            return response;
        },
        * queryHomeCustomizationInfo({ payload, isWeiXin }, { call, put }) {
            const response = yield call(requestMethod.queryHomeCustomizationInfo, payload)
            if (response && response.code === 0) {
                console.log(isWeiXin, "isWeiXin")
                const { crmUserKey } = response.payload;
                if (!isWeiXin) localStorage.setItem("crmUserKey", crmUserKey)
            }
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
        saveCustomizationDate(state, action) {
            return {
                ...state,
                customizationDate: action.payload
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
    }
};
