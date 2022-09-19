/**
 * title: 邀请好友，赢千元奖励
*/
import React, { Component } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Toast } from 'antd-mobile';
import WxSDK from "@/utils/wx-sdk";

@connect(({ common }) => ({
    common
}))
class AuthorizedBack extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        const { location: { query: { code } } } = this.props;
        new WxSDK().hideMenuItems()
        this.wxLogin(code)
    }

    wxLogin = (code) => {
        if (!code) {
            Toast.fail("微信登录失败")
            return;
        }
        const { dispatch, match: { params: { channel } } } = this.props;
        dispatch({
            type: "common/wechatLogin",
            payload: {
                code,
                source: 3,
                channel
            }
        }).then(res => {
            if(res.code === 0){
                history.push('/Active/customizedInv')
            }
        })
    }

    render() {
        return (
            <div></div>
        );
    }
}

export default AuthorizedBack;
