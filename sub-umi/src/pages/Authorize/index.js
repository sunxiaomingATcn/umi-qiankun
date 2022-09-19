/**
 * title: 阿保保险
 */
/**
 * 授权页面
 * history.push(`/Authorize?cb=${encodeURIComponent(callbackUrl)}`)
 * callbackUrl:授权回调页面
 * 授权成功页面将跳转至 callbackUrl/?code=CODE
*/
import React, { Component, Fragment } from 'react';
import styles from './index.scss';
import Utils from '@/utils/utils';
import { connect } from 'dva';
import { ActivityIndicator } from 'antd-mobile';
import Warning from '@/components/wxWarning';

@connect((common) => ({
    common
}))
class Index extends Component {

    state = {
        isWeiXin: Utils.isWeiXin()
    };

    componentDidMount() {
        this.state.isWeiXin && this.toAuthorize()
    }

    toAuthorize = () => {
        const { cb } = this.props.location.query;
        if (!cb) {
            console.error("请添加授权回调地址：history.push(`/Authorize?cb=${encodeURIComponent(callbackUrl)}`)")
            return;
        }
        const { dispatch } = this.props;
        // 获取wechat授权地址 callbackUrl进行了2次 encodeURIComponent
        dispatch({
            type: 'common/getWxAuthorizeUrl',
            payload: cb
        }).then(res => {
            if (res && res.code === 0) {
                Utils.toAuthorize(res.payload)
            }
        })
    }

    render() {
        const { isWeiXin } = this.state;
        return (
            <div className={`${styles.active_container} ${styles.authorize}`}>
                {isWeiXin ? <Fragment>
                    <ActivityIndicator animating={false} />
                    <div className={styles.logo}>
                        <img src={require('@/assets/png/logo.png')} />
                        <p>请先允许微信授权</p>
                    </div>
                    <button className={styles.authorizeBtn} onClick={this.toAuthorize}>去授权</button>
                </Fragment> : <div className={styles.wechatTips}>
                        <Warning />
                    </div>}
            </div>
        );
    }
}

export default Index;
