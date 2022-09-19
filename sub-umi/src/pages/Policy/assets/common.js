/**
 * 保单获取微信userinfo
 * @params props
 * @return promise if 没有登录信息=>授权
 * */

export const toAuthorize = () => window.location.href = `${window.location.origin}/#/Authorize?cb=${encodeURIComponent(`${window.location.origin}/#/policy/wechat/authBack`)}`

export function UserInfo(props) {
    const { dispatch } = props;
    if (!localStorage.getItem("wechat_user_token")) {
        toAuthorize()
        return Promise.reject()
    } else {
        return dispatch({
            type: 'common/querywechatUserInfo'
        }).then(res => {
            if (res.code === 0) {
                return res.payload
            }
            toAuthorize()
        })
    }
}

