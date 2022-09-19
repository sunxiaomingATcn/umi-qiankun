/**
 * 微信授权成功回调页面，负责微信登陆
*/
import React, { Component } from 'react';
import { connect } from "dva";
import { Toast } from "antd-mobile";
import { history } from 'umi';
import WxSDK from "@/utils/wx-sdk";
import QueryExcludeCode from '@/utils/tool/queryExcludeCode';

@connect(({ common }) => ({
    common
}))
class Auth extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        new WxSDK().hideMenuItems();
        const { dispatch, location: { query, query: { code } } } = this.props;
        dispatch({
            type: 'common/wechatLogin',
            payload: {
                code,
                source: 6
            }
        }).then(res => {
            if (res && res.code == 0) {
                history.replace({ pathname: '/policy', search: QueryExcludeCode(query) })
            } else {
                Toast.info("微信登录失败")
            }
        })
    }

    render() {
        return (
            <div></div>
        );
    }
}

export default Auth;
