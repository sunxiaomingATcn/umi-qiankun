export default {
    namespace: 'publichome',
    state: {
        gdLocation: {},
        weatherObj: {},
        userInfo: {}
    },
    effects: {
       
    },
    reducers: {
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
