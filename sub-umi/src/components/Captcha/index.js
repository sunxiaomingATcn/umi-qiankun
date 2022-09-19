/**
 * Class Captcha ： 图形验证码组件（用于发送短信验证码）
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Icon } from 'antd-mobile';
import styles from './index.scss';

@connect(({ login }) => ({
    login,
}))
class Captcha extends Component {
    constructor(props) {

        super(props);
        this.state = {}
    }

    componentDidMount() {
        this.props.onRef(this)
        // 获取图形验证码
        this.getCaptcha()
    }

    getCaptcha = () => {
        if (this.props.loading) return;
        const { dispatch, dispatchType = 'login/getCaptchaForSendMsgToMobile' } = this.props;
        dispatch({
            type: dispatchType
        })
    };

    render() {
        const { login: { captchaForSendMsgToMobile }, textColor = '#FF7C08' } = this.props;
        return (
            <div className={styles.captcha}>
                {captchaForSendMsgToMobile ? <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <img src={captchaForSendMsgToMobile} alt="图片验证码" title="图片验证码" />
                    <span
                        style={{
                            color: textColor,
                            fontSize: '0.2rem',
                            fontFamily: 'PingFang SC',
                            fontWeight: 300,
                            marginLeft: '.2rem'
                        }}
                        onClick={(e) => this.getCaptcha(e)}
                    >换一换</span>
                </div> : <Icon type={"loading"} />
                }
            </div>
        );
    }
}

export default Captcha;
