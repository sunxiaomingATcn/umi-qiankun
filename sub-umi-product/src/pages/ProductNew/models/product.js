import * as requestMethod
    from "@/services/product";
import { Toast } from 'antd-mobile';

export default {
    namespace: 'productNew',
    state: {
        queryProduct: null,
        quoteInfo: null,
        quoteRecord: {},
        restrictGenes: null,
        productDetail: null,
        Dateflag: true
    },
    effects: {
        // 获取产品详情
        * queryProductInfo({ payload }, { call, put }) {
            const response = yield call(requestMethod.queryProductDetailNew, payload);
            if (response && response.code === 0) {
                yield put({
                    type: 'GetProductDetail',
                    payload: response.payload,
                });
                const { payload: { id: product_id, productProtectItems, basicRestrictGene } } = response;
                // sessionStorage.setItem(`productProtectItems_${product_id}`, JSON.stringify(productProtectItems));
                localStorage.setItem(`ppb_product_id`, product_id)
                sessionStorage.setItem(`ppb_productProtect`, JSON.stringify({ basicRestrictGene, productProtectItems }))
                return response;
            } else {
                Toast.info(`${response.message}`);
            }
        },

        // 获取算费因子
        * queryRestrictGenes({ payload }, { call, put }) {
            const response = yield call(requestMethod.queryRestrictGenes, payload);
            if (response && (response.code === 0)) {
                yield put({
                    type: 'SaveRestrictGenes',
                    payload: response,
                });
                sessionStorage.setItem(`ppb_restrictGenes`, JSON.stringify(response.payload))
                return response;
            } else {
                return response;
            }
        },
        * ocrVehicleLicenseFront({ payload }, { call, put }) {
            const response = yield call(requestMethod.ocrVehicleLicenseFront, payload);
            if (response && (response.code === 200)) {
            } else {
                response&& Toast.fail(`${response.message}`);
            }
            return response;
        }, 
        
        * uploadFiles({ payload }, { call, put }) {
            const response = yield call(requestMethod.uploadFiles, payload);
            return response;
        },
        * getIdentifyModelByVIN({ payload }, { call, put }) {
            const response = yield call(requestMethod.getIdentifyModelByVIN, payload);
            if (response && (response.status === '1')) {
            } else {
                response&& Toast.fail(`${response.errorMsg}`);
            }
            return response;
        },
        * getEvalPriceByVIN({ payload }, { call, put }) {
            const response = yield call(requestMethod.getEvalPriceByVIN, payload);
            if (response && (response.status === '1')) {
            } else {
                response&& Toast.fail(`${response.errorMsg}`);
            }
            return response;
        },
        * getCarModelInfo({ payload }, { call, put }) {
            const response = yield call(requestMethod.getCarModelInfo, payload);
            if (response && (response.status === '1')) {
            } else {
                response&& Toast.fail(`${response.errorMsg}`);
            }
            return response;
        },
        * sendOrder({ payload }, { call, put }) {
            const response = yield call(requestMethod.sendOrder, payload);
            if (response && (response.success)) {
            } else {
                response&& Toast.fail(`${response.error_msg}`);
            }
            return response;
        },
        // 获取保费试算
        * queryQuote({ payload, detailedQuotation }, { call, put }) {
            const response = yield call(requestMethod.queryQuote, payload);
            if (response && response.code === 0) {
                yield put({
                    type: 'saveQueryQuote',
                    payload: response.payload,
                });
                // 算费因子
                localStorage.setItem(`ppb_quote_restrictGenes`, JSON.stringify(payload.info))
                // 产品详情页面报价
                if (detailedQuotation) {
                    localStorage.setItem(`ppb_detailedQuotation_result`, JSON.stringify(response.payload))
                } else {
                    // 投保页面报价（产品详情页面从新报价投保页面保费随之改变）
                    localStorage.setItem(`ppb_insuredQuotation_result`, JSON.stringify(response.payload))
                }
                return response;
            } else {
                Toast.info(`${response.message}`);
            }
        },
        // 保存报价
        * saveQuote({ payload }, { call, put }) {
            const response = yield call(requestMethod.saveQuote, payload);
            if (response && (response.code === 0 || response.code === 4000)) {

                yield put({
                    type: 'saveQuoteRecord',
                    payload: response.payload,
                });
                return response;
            } else {
                Toast.info(`${response.message}`);
            }
        },
        * queryQuoteDetail({ payload }, { call, put }) {
            const response = yield call(requestMethod.queryQuoteDetail, payload);
            console.log(response)
            return response;
        },


    },
    reducers: {
        saveQuerydetail(state, action) {
            console.log(action)
            return {
                ...state,
                productDetail: action.payload
            };
        },
        GetProductDetail(state, action) {
            return {
                ...state,
                queryProduct: action.payload
            };
        },
        saveQueryQuote(state, action) {
            return {
                ...state,
                quoteInfo: action.payload
            };
        },
        saveQuoteRecord(state, action) {
            return {
                ...state,
                quoteRecord: action.payload
            };
        },
        SaveRestrictGenes(state, action) {
            return {
                ...state,
                restrictGenes: action.payload
            };
        },
    }
};
