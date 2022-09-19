/**
 * 2020/10/30
 * Class VerifyCode ： 短信验证码组件(与VerifyCode组件区别:支持自定义 dispatch type, 默认login/sendValidation)
 * @prop phone：手机号 required
 * @prop dispatch
 * @prop dispatchType
 * @prop codeText：展示文案，默认：发送验证码
 * @prop countdown：验证码倒计时总时长，默认: 60 （单位秒）
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Toast } from 'antd-mobile';
import RegEx from '@/utils/RegEx.js';
import PropTypes from 'prop-types';

const commonStyle = {
    fontSize: "0.3rem",
}

@connect(({ login }) => ({
    login
}))
class VerifyCode extends Component {
    constructor(props) {

        super(props);
        this.state = {
            verifyCode: '',
            disabled: true,
            isTiming: false,
        }
    }

    componentDidMount() {
        const { codeText, phone } = this.props;
        this.setState({
            codeText,
            phone
        })
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const { type, countdown, countdownSuffix, mobileRegName } = nextProps;
        if (type !== prevState.type || countdown !== prevState.type) {
            return { type, countdown, countdownSuffix, mobileRegName }
        }
        return null;
    }

    /**
     * 倒计时
     */
    setTime = () => {
        let countdown = this.state.countdown;
        const { countdownSuffix } = this.state;
        this.setState({ isTiming: true, disabled: false, codeText: countdown + countdownSuffix });
        this.timer = setInterval(() => {
            if (countdown < 1) {
                this.setState({
                    codeText: '重发验证码',
                    isTiming: false,
                    disabled: true
                });
                clearInterval(this.timer);
            } else {
                this.setState({
                    codeText: countdown + countdownSuffix,
                    disabled: false
                });
                countdown--;
            }
        }, 1000);
    };

    getCodeClick = (e) => {
        e.preventDefault();
        const { dispatch, dispatchType = 'login/sendValidation', phone } = this.props;
        const { mobileRegName } = this.state;
        if (this.state.isTiming) {
            return false;
        }
        const err = RegEx.handleVerification(mobileRegName, phone);
        if (err) {
            Toast.fail(err, 2);
            return false
        }
        Toast.loading('Loading...', 0);
        dispatch({
            type: dispatchType,
            payload: {
                mobile: phone
            }
        }).then((data) => {
            if (data.code === 0) {
                Toast.info(data.message || '验证码发送成功', 2);
                // 成功发送验证码并倒计时
                this.setTime()
            } else {
                Toast.info(data && data.message || '验证码发送失败', 2);
            }
        })
    };

    render() {
        const { disabled, codeText } = this.state;
        const { activeStyle, disableStyle } = this.props;

        return (
            <div
                style={{ ...commonStyle, ...(disabled ? activeStyle : disableStyle) }}
                onClick={(e) => this.getCodeClick(e)}>
                {codeText}
            </div>
        );
    }
}

VerifyCode.propTypes = {
    phone: PropTypes.string.isRequired,
    codeText: PropTypes.string,
    countdown: PropTypes.number,
    color: PropTypes.string
};

VerifyCode.defaultProps = {
    codeText: '获取验证码',
    countdown: 60,
    countdownSuffix: '秒后重发',
    mobileRegName: 'mobile',
    activeStyle: { color: 'rgba(255, 120, 0, 1)' },
    disableStyle: { color: '#BDBFBF' }
};

export default VerifyCode;
