import * as requestMethod from "@/services/login";
import { Toast } from 'antd-mobile';

export default {
    namespace: 'login',
    state: {
        token: '4a5f101a-eb28-41e1-a409-cbdfd2d9f2d2'
    },

    effects: {
        * sendValidation({ payload }, { call, put }) {
            const response = yield call(requestMethod.sendValidation, payload);
            if (response.code === 200) {
                return response;
            } else {
                Toast.fail(`${response.msg || '验证码发送失败'}`, 2);
                return false;
            }
        },
        // 发送验证码短信
        * sendValidationWithCaptcha({ payload }, { call, put }) {
            const response = yield call(requestMethod.sendValidation, payload);
            if (!response || response.code != 200) Toast.fail(`${response ? response.msg : '验证码发送失败'}`, 2);
            return response;
        },
        // 图片验证码(验证发送验证码短信)
        * getCaptchaForSendMsgToMobile({ payload }, { call, put }) {
            yield put({
                type: 'saveCaptchaForSendMsgToMobile',
                payload: null
            });
            const response = yield call(requestMethod.getCaptchaForSendMsgToMobile, payload);
            if (response && response.code === 200) {
                yield put({
                    type: 'saveCaptchaForSendMsgToMobile',
                    payload: response.data.image
                });
                sessionStorage.setItem("validationCaptchaToken", response && response.data.key)
                return response;
            } else {
                Toast.fail(`获取图片验证码失败`, 2);
                return false;
            }
        },
        * validationCode({ payload }, { call, put }) {
            const response = yield call(requestMethod.validationCode, payload);
            if (response.code === 0) {
                localStorage.setItem('token', response.payload.token);
                yield put({
                    type: 'saveValidationCode',
                    payload: response.payload
                });
                return response;
            } else {
                Toast.fail(`${response.message}`, 2);
                return false;
            }
        },
    },

    reducers: {
        saveValidationCode(state, action) {
            return {
                ...state,
                token: action.payload.token
            }
        },
        saveCaptcha(state, action) {
            return {
                ...state,
                captcha: action.payload
            }
        },
        saveCaptchaForSendMsgToMobile(state, action) {
            return {
                ...state,
                captchaForSendMsgToMobile: action.payload
            }
        },
    },

};
