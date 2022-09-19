
// 页面间数据缓存用
var CacheUtil = {
    getBigDataCarInfo: function () {
        let info = {}
        try {
            info = JSON.parse(window.localStorage.getItem('carInfo'))
        } catch (error) {
        }
        return info??{};
    },
    getRenewalCarInfo: function () {
        let info = {}
        try {
            info = JSON.parse(window.localStorage.getItem('renewalCarInfo'));
        } catch (error) {
        }
        return info??{};
    },
    setStorage: function (key, val) {
        return window.localStorage.setItem(key, val)
    },
    getStorage: function (key) {
        return window.localStorage.getItem(key)
    },
    removeStorage: function (key) {
        return window.localStorage.removeItem(key)
    },

    getUser() {
        return JSON.parse(window.localStorage.getItem('user'))
    },
    setUser(user) {
        this.setStorage('user', JSON.stringify(user))
    }

    // order:{
    //     amount:886,
    //     applicantName:"唐小米",
    //     createTime:"2017-06-25 13:50:20",
    //     effectiveTime:"2017-06-25 00:00:00",
    //     id:46,
    //     insuredName:"唐小米",
    //     merchId:1,
    //     merchLogo:"平安E生保",
    //     merchname:"/sr/itg/abao/merch/logo/PAYSB.jpg",
    //     orderstatus:"APPROVED",
    //     payUrl:"http://182.92.10.68/m/index.html#pay&N20170625000016&no_header",
    //     policyEndDate:"2018-06-25 00:00:00",
    //     policyStatus:"EFFECT",
    // }

}

export default CacheUtil
