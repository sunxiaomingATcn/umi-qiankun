import * as requestMethod from "@/services/common";
import { Toast } from 'antd-mobile';

export default {
    namespace: 'common',
    state: {
        jobs: null,
        genes: null,
        area: null,
        fullArea: null,
        priceArgs: null,
        price: null,
        confirmDetial: null,
        profession: null,
        wxSdkConfig: null,
        userInfo: {},
        fxProfession: [],
        jdalProfession: [],
        dictionary:{}
    },

    effects: {
        *queryDictionary({ payload }, { call, put, select }) {
            const dictionary = yield select(state => state.common.dictionary);
            if (dictionary && dictionary[payload.code]) {
              return { code: 200, data: dictionary[payload.code] };
            }
            const response = yield call(requestMethod.queryDictionary, payload);
            if (response && response.code === 200) {
              yield put({
                type: 'saveDictionary',
                payload: { [payload.code]: response.data },
              });
            } else {
                Toast.fail(`${response.message}`);
            }
            return response;
          },
          *getTreeList({ payload }, { call, put }) {
            const response = yield call(requestMethod.getAreaList);
            if (response && response.code == 200) {
                yield put({
                    type: 'saveAreaList',
                    payload: response.data,
                });
            } else {
                Toast.fail(response.message)
            }
            return response;
        },
        * queryJobList({ payload }, { call, put }) {
            const response = yield call(requestMethod.queryJobList, payload);
            if (response.code === 0) {
                yield put({
                    type: 'getProductInsuredJob',
                    payload: response.payload,
                });
                return response;
            } else {
                Toast.fail(`${response.message}`, 2);
                return false;
            }
        },
        * queryGenesList({ payload }, { call, put }) {
            yield put({
                type: 'SaveGenesList',
                payload,
            });
        },
        * queryArea({ payload }, { call, put }) {
            const response = yield call(requestMethod.queryArea, payload);
            if (response.code === 0) {
                yield put({
                    type: 'getAreaList',
                    payload: response.payload,
                });
                return response;
            } else {
                Toast.fail(`${response.message}`, 2);
                return false;
            }
        },
        * queryFullArea({ payload }, { call, put }) {
            yield put({
                type: 'SaveFullArea',
                payload
            });
        },
        * queryPriceArgs({ payload }, { call, put }) {
            yield put({
                type: 'savePriceArgs',
                payload
            });
        },
        * queryPrice({ payload }, { call, put }) {
            yield put({
                type: 'savePrice',
                payload
            });
        },
        * queryConfirmDetial({ payload }, { call, put }) {
            yield put({
                type: 'saveConfirmDetial',
                payload
            });
        },
        // 获取职业信息
        * getProfession({ payload }, { call, put }) {
            const response = yield call(requestMethod.getProfession, payload);
            if (response && (response.code === 0)) {
                yield put({
                    type: 'GetProfessionData',
                    payload: response,
                });
                return response;
            } else {
                Toast.fail(`${response.message}`);
            }
        },
        * getFxProfession({ payload, pids }, { call, put }) {
            const response = yield call(requestMethod.getFxProfession, payload);
            if (response && (response.code === 0)) {
                yield put({
                    type: 'saveFxProfession',
                    payload: response.payload,
                    ...payload,
                    pids
                });
                return response;
            } else {
                Toast.fail(`${response.message}`);
            }
            return response;
        },
        * getJdalProfession({ payload, pids }, { call, put }) {
            console.log("pids",pids)
            const response = yield call(requestMethod.getJdalProfession, payload);
            if (response && (response.code === 0)) {
                yield put({
                    type: 'savejdalProfession',
                    payload: response.payload,
                    ...payload,
                    pids
                });
                return response;
            } else {
                Toast.fail(`${response.message}`);
            }
            return response;
        },
        // 获取投保地区getArea
        * getArea({ payload, vendorCode }, { call, put }) {
            const response = yield call(requestMethod.getArea, payload);
            if (response && (response.code === 0)) {
                yield put({
                    type: 'GetAreaData',
                    payload: response,
                });
                return response;
            } else {
                Toast.fail(`${response.message}`);
            }
        },
        // 获取微信分享配置
        * getWeChatShareConfig({ payload }, { call, put }) {
            const response = yield call(requestMethod.WxSdkConfig, payload || window.location.href.split("#")[0]);
            if (response && response.code === 0) {
                yield put({
                    type: "savewxSdkConfig",
                    payload: response.payload
                })
            }
            return response;
        },
        // 获取微信授权地址
        * getWxAuthorizeUrl({ payload }, { call }) {
            return yield call(requestMethod.wxAuthorizeUrl, encodeURIComponent(payload));
        },
        // 获取用户信息
        * queryUserInfo({ payload }, { call, put }) {
            const response = yield call(requestMethod.userInfo);
            if (response && response.code === 0) {
                yield put({
                    type: 'saveUserInfo',
                    payload: response.payload,
                });
            }
            return response;
        },
        // 微信登录
        * wechatLogin({ payload }, { call, put }) {
            const response = yield call(requestMethod.wechatLogin, payload);
            if (response && response.code === 0) {
                // user_token:阿保用户token ， 微信登陆token:wechat_user_token
                localStorage.setItem("user_token", response.payload.token)
                localStorage.setItem("wechat_user_token", response.payload.token)
            }
            return response;
        },
        // 微信登录token用户信息
        * querywechatUserInfo({ payload }, { call, put }) {
            return yield call(requestMethod.wechatUserInfo);
        },
    },

    reducers: {
        saveAreaList(state, action) {
            return {
                ...state,
                Area: action.payload,
            };
        },
        saveDictionary(state, action) {
            return {
              ...state,
              dictionary: {
                ...state.dictionary,
                ...action.payload,
              },
            };
        },
        getProductInsuredJob(state, action) {
            return {
                ...state,
                jobs: action.payload
            }
        },
        SaveGenesList(state, action) {
            return {
                ...state,
                genes: action.payload
            }
        },
        SaveFullArea(state, action) {
            return {
                ...state,
                fullArea: action.payload
            }
        },
        getAreaList(state, action) {
            return {
                ...state,
                area: action.payload
            }
        },
        savePriceArgs(state, action) {
            return {
                ...state,
                priceArgs: action.payload
            }
        },
        savePrice(state, action) {
            return {
                ...state,
                price: action.payload
            }
        },
        saveConfirmDetial(state, action) {
            return {
                ...state,
                confirmDetial: action.payload
            }
        },
        GetAreaData(state, action) {
            return {
                ...state,
                area: action.payload
            }
        },
        GetProfessionData(state, action) {
            return {
                ...state,
                profession: action.payload
            }
        },
        savewxSdkConfig(state, action) {
            return {
                ...state,
                wxSdkConfig: action.payload
            }
        },
        saveUserInfo(state, action) {
            return {
                ...state,
                userInfo: action.payload
            }
        },
        saveFxProfession(state, action) {
            const { pids } = action;
            let fxProfession = state.fxProfession;

            if (!pids) {
                fxProfession = action.payload;
            } else if (pids.length == 1) {
                fxProfession.find(i => i.code == pids[0]).children = action.payload;
            } else if (pids.length == 2) {
                const secParent = fxProfession.find(i => i.code == pids[0]) || [];
                secParent.children.find(i => i.code == pids[1]).children = action.payload;
            }
            console.log(233, pids,fxProfession)
            return {
                ...state,
                fxProfession
            }
        },
        savejdalProfession(state, action) {
            const { pids } = action;
            let jdalProfession = state.jdalProfession;

            if (!pids) {
                jdalProfession = action.payload;
            } else if (pids.length == 1) {
                jdalProfession.find(i => i.id == pids[0]).children = action.payload;
            } else if (pids.length == 2) {
                const secParent = jdalProfession.find(i => i.id == pids[0]) || [];
                secParent.children.find(i => i.id == pids[1]).children = action.payload;
            }
            return {
                ...state,
                jdalProfession
            }
        },
    },
};
