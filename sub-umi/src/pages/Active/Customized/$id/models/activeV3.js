import * as requestMethod from "@/services/active";

export default {
    namespace: 'activeV3',
    state: {
        customizationInfo: {},
        discount: {
            remainingNumber: undefined,
            countDownTime: undefined//24 * 60 * 60 * 1000
        },
        mobile: "",
        name: "",
        buyWhat: '',
        insuranceTarget: '',
        communicationDate: null,// 预约时间
        customizationDate: {},
    },

    effects: {
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
        // 非微信环境 userinfo
        * queryHomeCustomizationInfo({ payload }, { call, put }) {
            const response = yield call(requestMethod.queryHomeCustomizationInfoV2, payload)
            if (response && response.code === 0) {
                yield put({
                    type: "saveCustomizationInfo",
                    payload: response.payload
                })
            }
            return response;
        },
        
        * queryDiscount(_, { call, put }) {
            const response = yield call(requestMethod.queryDiscount)
            if (response && response.code === 0) {
                yield put({
                    type: "saveDiscount",
                    payload: response.payload
                })
            }
            return response;
        },
        // 非微信环境创建订单
        * getPayOrderIdNoWechat({ payload }, { call, put }) {
            const response = yield call(requestMethod.getPayOrderIdNoWechat, payload)
            if (response && response.code === 0) {
                localStorage.setItem("cus_unwechat_token", response.payload.token)
            }
            return response;
        },
        // 微信环境创建订单
        *initCustomizationOrder({ payload }, { call, put }) {
            const response = yield call(requestMethod.initCustomizationOrder, payload)
            return response;
        },
        * name({ payload }, { _, put }) {
            yield put({
                type: "saveName",
                payload
            })
        },
        * buyWhat({ payload }, { _, put }) {
            yield put({
                type: "saveBuyWhat",
                payload
            })
        },
        * forWho({ payload }, { _, put }) {
            yield put({
                type: "saveForWho",
                payload
            })
        },
        * communicationDate({ payload }, { _, put }) {
            yield put({
                type: "saveCommunicationDate",
                payload
            })
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
        // 微信环境提交表单
        * submitCustomized({ payload }, { call, put }) {
            return yield call(requestMethod.submitCustomized, payload)
        },
        // 非微信环境提交表单
        * submitUnWcCustomized({ payload }, { call, put }) {
            return yield call(requestMethod.submitUnUserCustomizedV2, payload)
        }
    },
    reducers: {
        saveCustomizationInfo(state, action) {
            return {
                ...state,
                customizationInfo: action.payload
            };
        },
        
        saveDiscount(state, action) {
            return {
                ...state,
                discount: action.payload
            };
        },
        saveName(state, action) {
            return {
                ...state,
                name: action.payload
            };
        },
        saveBuyWhat(state, action) {
            return {
                ...state,
                buyWhat: action.payload
            };
        },
        saveForWho(state, action) {
            return {
                ...state,
                insuranceTarget: action.payload
            };
        },
        saveCommunicationDate(state, action) {
            return {
                ...state,
                communicationDate: action.payload
            };
        },
        saveCustomizationDate(state, action) {
            return {
                ...state,
                customizationDate: action.payload
            };
        },
    },
};
