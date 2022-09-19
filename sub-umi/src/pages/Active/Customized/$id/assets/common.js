/**
 * 家庭定制 public function
 * _this, isWechat 必传
 * 表单为微信环境非微信环境公用
 * 家庭定制订单状态 res
    * 1.有待支付订单，需要支付 click btn => cheche pay
    * 2.有支付成功的订单,表单已填写 router go 表单完成
    * 3.有支付成功的订单,表单未填写 router go 表单
    * 4.新用户 click btn => model phone => dispatch getPayOrderId => cheche pay
    * 1，4 dom loaded 不处理
 * @return promise => then response => {status,[ state, mobile, payOrderId]}, untoken => WeChat status  -1 
 *                                      status 用户状态 1，2，3，4同上，0非微信未登录，-1微信未登录
*/
export function initUserInfo(_this, isWechat, activeParams, payload) {
    const { dispatch } = _this.props;
    const { amount, channel, crmAdviserId, crmCustomerId } = activeParams;
    const unLoginRes = { status: isWechat ? -1 : 0, info: "loginFail" };
    const dispatchType = isWechat ? 'activeV3/queryCustomizationInfo' : 'activeV3/queryHomeCustomizationInfo';
    console.log("获取用户信息", activeParams, payload)
    if ((isWechat && !localStorage.getItem('user_token')) || (!isWechat && !payload && !localStorage.getItem('cus_unwechat_token'))) {
        return Promise.resolve(unLoginRes)
    }
    return dispatch({
        type: dispatchType,
        payload: {
            amount,
            channel,
            crmAdviserId,
            crmCustomerId,
            sourceUrl: window.location.href,
            ...payload
        }
    }).then(res => {
        if (res && res.code == 0) {
            const { payload } = res;
            return payload;
        } else {
            return unLoginRes;
        }
    })
}
/**
 * 支付
*/
export function onPay(params) {
    // 车险线上 wx  wxcf02994504264506
    // 车险二云测试环境 wx05444814b830d0c5
    // 车险三云测试环境  wxe127abae975d86d6
    const { amount, payOrderId, mobile, paybackLink, search, channel } = params;
    const origin = window.location.origin;
    const wxOauth = 'https://open.weixin.qq.com/connect/oauth2/authorize';
    const outhSuccessBackUrl = encodeURIComponent(`${origin}/#${paybackLink}${search}`);// 避免回调url的query被截取，所以encode两次
    const callbackUrl = encodeURIComponent(`mobile=${mobile}&amount=${amount}&payOrderId=${payOrderId}&channel=${channel}&callbackUrl=${outhSuccessBackUrl}`);
    const dev1_url = `${wxOauth}?appid=wx05444814b830d0c5&redirect_uri=https://dev1.cc.chetimes.com/v2.1/orders/health/custom/callback&response_type=code&scope=snsapi_base&state=${callbackUrl}`;
    const dev2_url = `${wxOauth}?appid=wxe127abae975d86d6&redirect_uri=https://dev2.cc.chetimes.com/v2.1/orders/health/custom/callback&response_type=code&scope=snsapi_base&state=${callbackUrl}`;
    const url = `${wxOauth}?appid=wxcf02994504264506&redirect_uri=https://cc.chetimes.com/v2.1/orders/health/custom/callback&response_type=code&scope=snsapi_base&state=${callbackUrl}`;

    let target_url = url;
    if (origin.includes('//dev1')) {
        target_url = dev1_url
    } else if (origin.includes('//dev2') || origin.includes('//localhost')) {
        target_url = dev2_url
    }
    console.log(target_url)
    window.location.href = target_url;
}

