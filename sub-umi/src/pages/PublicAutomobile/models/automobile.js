export default {
    namespace: 'publicautomobile',
    state: {
        gdLocation: {},
        weatherObj: {},
        userInfo: {},
        imageMap:{},
        quoteCache: undefined,//投保信息缓存
        preImageFiles: undefined,//接口返回的影像缓存
        savedImageFiles: undefined,//保存的影像缓存
        insureCache: undefined,//提交订单缓存
    },
    effects: {
       
    },
    reducers: {
        clearAllCache(state){
            return {
                ...state,
                imageMap: undefined,
                quoteCache: undefined,
                preImageFiles: undefined,
                savedImageFiles: undefined,
                insureCache: undefined
            };
        },
        savePreImageFiles(state,action){
            return {
                ...state,
                preImageFiles: [
                    ...action.payload
                ]
            };
        },
        saveSavedImageFiles(state,action){
            return {
                ...state,
                savedImageFiles: [
                    ...action.payload
                ]
            };
        },
        clearPreImageFiles(state){
            return {
                ...state,
                preImageFiles: undefined
            };
        },
        saveQuoteCache(state,action){
            return {
                ...state,
                quoteCache: {
                    ...action.payload
                }
            };
        },
        clearQuoteCache(state,action){
            return {
                ...state,
                quoteCache: undefined
            };
        },
        saveInsureCache(state,action){
            return {
                ...state,
                insureCache: {
                    ...action.payload
                }
            };
        },
        clearInsureCache(state,action){
            return {
                ...state,
                insureCache: undefined
            };
        },
        saveImage(state,action){
            return {
                ...state,
                imageMap: {
                    ...state.imageMap,
                    ...action.payload
                }
            };
        },
        saveLocation(state, action) {
            return {
                ...state,
                gdLocation: action.payload
            };
        },
        saveUserInfo(state, action) {
            return {
                ...state,
                userInfo: action.payload
            };
        },
        saveWeather(state, action) {
            return {
                ...state,
                weatherObj: action.payload
            };
        },
    }
};
