import * as requestMethod
    from "@/services/insured";
import { Toast } from 'antd-mobile';


export default {
    namespace: 'insuredNew',
    state: {
        insured: null,
        isRenewalPay: true,
        Dateflag1: true,
        Dateflag2: true,
        signature1: false,
        signature2: false,
        applicantInfo: null,
        insurantInfo: null,
        applicantInfoProfessionStr: "",
        insurantInfoProfessionStr: "",
        applicantInfoPassport: false,
        insurantInfoPassport: false
    },
    effects: {
        // 安盛获取投保信息
        * insureInfo({ payload }, { call, put }) {
            const response = yield call(requestMethod.insureInfo, payload);
            if (response && response.code === 0) {
                yield put({
                    type: 'GetInsureData',
                    payload: response,
                });
                return response;
            } else {
                Toast.fail(`${response.message}`);
            }
        },
        // 提交投保信息
        * submitInsure({ payload }, { call, put }) {
            const response = yield call(requestMethod.submitInsure, payload);
            if (response && (response.code === 0)) {
                yield put({
                    type: 'SaveSubmitInsured',
                    payload: response,
                });
                return response;
            } else {
                // response&& Toast.fail(`${response.message}`);
                return response;
            }
        },
        // 数据采集
        * dataAcquisition({ payload }, { call, put }) {
            const response = yield call(requestMethod.dataAcquisition, payload);
            if (response && (response.code === 0)) {
                return response;
            } else {
                response&& Toast.fail(`${response.message}`);
            }
        },
        * SaveisRenewalPay({ payload }, { call, put }) {
            yield put({
                type: 'isRenewalPay',
                payload
            });
        },
        * SaveidentityPeriod({ payload }, { call, put }) {
            yield put({
                type: 'identityPeriod',
                payload
            });
        },
        * editdate({ payload }, { call, put }) {
            yield put({
                type: 'editDate',
                payload
            })
        },
        * tracks({ payload }, { call, put }) {
            const response = yield call(requestMethod.tracks, payload);
        },
        * editSignature({ payload }, { call, put }) {
            yield put({
                type: 'editStatus',
                payload
            });
        },
        * sendValidation({ payload }, { call, put }) {
            const response = yield call(requestMethod.sendValidation, payload);
            if (response.code === 200) {
                return response;
            } else {
                const { msg, data } = response;
                const message = msg ? msg : data && data.lockTime ? `${data.lockTime}s后再次获取` : '验证码发送失败'
                Toast.fail(message, 2);
                return false;
            }
        },
    },
    reducers: {
        isRenewalPay(state, action) {
            return {
                ...state,
                ...action.payload
            };
        },
        identityPeriod(state, action) {
            return {
                ...state,
                ...action.payload
            };
        },
        editDate(state, action) {
            return {
                ...state,
                ...action.payload
            }
        },
        editStatus(state, action) {
            let obj = {}
            if (action.payload.index == 1) {
                obj = {
                    signature1: action.payload.signature1,
                    signature2: state.signature2
                }
            } else {
                obj = {
                    signature2: action.payload.signature2,
                    signature1: state.signature1
                }
            }
            return {
                ...state,
                ...obj
            };
        },
        GetInsuredData(state, action) {
            return {
                ...state,
                insured: action.payload
            };
        },
        SaveSubmitInsured(state, action) {
            return {
                ...state,
                insured: action.payload
            };
        },
        GetInsureData(state, action) {
            return {
                ...state,
                insured: action.payload
            };
        },
    },
};
