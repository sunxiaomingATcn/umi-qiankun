/**
 * title: 家庭保险方案定制服务
*/
/**
 * 家庭定制微信授权成功回调页面
 * Authorize success => wechat login success => router to active index
*/
import React, { Component } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import md5Map from './assets/md5Price';

@connect(({ common }) => ({
    common
}))
class AuthorizedBack extends Component {
    constructor(props) {
        super(props);
        this.state = {
            wechatLoginSuccess: true
        };
    }

    componentDidMount() {
        const { location: { query: { code } } } = this.props;
        this.wxLogin(code)
    }

    wxLogin = (code) => {
        if (!code) {
            this.setState({ wechatLoginSuccess: false })
            return;
        }
        const { dispatch, match: { params: { id: activeId } } } = this.props;
        const activeParams = md5Map(activeId);
        dispatch({
            type: "common/wechatLogin",
            payload: {
                code,
                channel: activeParams.channel,
                source: 3
            }
        }).then(res => {
            if (res && res.code === 0) {
                // history.replace({ pathname: activeParams.activeLink, search: activeParams.search })
            } else {
                this.setState({ wechatLoginSuccess: false })
            }
            // 不论成功失败都返回活动首页
            history.replace({ pathname: activeParams.activeLink, search: activeParams.search })
        })
    }

    render() {
        const { wechatLoginSuccess } = this.state;
        return (
            <div></div>
        );
    }
}

export default AuthorizedBack;
