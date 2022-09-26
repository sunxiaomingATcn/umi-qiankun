import * as requestMethod
    from "@/services/home";
import { Toast } from 'antd-mobile';
export default {
    namespace: 'home',
    state: {
        queryCategoryList: [],
        queryProductList: {
            list: [],
            pagination: null
        }

    },
    effects: {
        // 获取产品分类列表
        * queryCategoryList({ payload }, { call, put }) {
            yield put({
                type: 'saveQueryCategoryList',
                payload: [],
            });
            const response = yield call(requestMethod.queryCategoryList);
            if (response && response.code === 0) {
                yield put({
                    type: 'saveQueryCategoryList',
                    payload: response.payload,
                });
                return response;
            } else {
                Toast.info(`${response.message}`);
            }
        },

        // 获取产品列表
        * queryProductList({ payload }, { call, put }) {
            yield put({
                type: 'saveProductList',
                payload: {
                    list: [],
                    pagination: null
                },
            });
            const response = yield call(requestMethod.queryProductList, payload);
            if (response && response.code === 0) {
                yield put({
                    type: 'saveProductList',
                    payload: {
                        list: response.payload,
                        pagination: response.meta.pagination
                    },
                });

                return response;
            } else {
                Toast.info(`${response.message}`);
            }
        },
        // 获取产品链接
        * jumpLink({ payload }, { call, put }) {
            const response = yield call(requestMethod.jumpLink, payload);
            if (response && response.code == 0) {
                // window.location.href=response.payload.url
                return response.payload;
            } else {
                Toast.info(`${response.message}`);
            }
        },
        // 获取列表
        *queryTableList({ payload }, { call, put }) {
            yield put({
                type: 'saveProductList',
                payload: {
                    list: [],
                    pagination: null
                },
            });
            const response = yield call(requestMethod.queryTableList, payload);
            if (response && response.code === 200) {
                yield put({
                    type: 'saveProductList',
                    payload: {
                        list: response.data,
                    },
                });
            } else {
                yield put({
                    type: 'saveQueryTableList',
                    payload: {
                        list: [],
                        pagination: null,
                        meta: null,
                    },
                });
                Toast.error(`${response.msg}`);
            }
            return response
        },
    },
    reducers: {
        saveQueryCategoryList(state, action) {
            return {
                ...state,
                queryCategoryList: action.payload
            };
        },

        saveProductList(state, action) {
            return {
                ...state,
                queryProductList: action.payload
            };
        },

    },
};
