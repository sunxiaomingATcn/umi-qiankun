/**
 * 弹出图形验证
 * Class VerifyCode ： 短信验证码组件(与VerifyCode组件区别:支持自定义 dispatch type, 默认login/sendValidation)
 * @prop phone：手机号 required
 * @prop dispatch
 * @prop dispatchType
 * @prop codeText：展示文案，默认：发送验证码
 * @prop countdown：验证码倒计时总时长，默认: 60 （单位秒）
 * @prop color： 指定codeText颜色，默认添加border，如不需要指定border:false
 *
 *  需求3441
 * 发送短信需要验证图形验证码
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Toast } from 'antd-mobile';
import styles from './modelVerifyCode.scss';
import RegEx from '@/utils/RegEx.js';
import PropTypes from 'prop-types';

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
        this.props.onRef && this.props.onRef(this)

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

    // 点击发送验证码弹出图形验证
    getCodeClick = () => {
        const { getCodeClick, phone } = this.props;
        const { mobileRegName } = this.state;
        // 已发送正在倒计时isTiming不弹出验证码弹窗
        if (this.state.isTiming) {
            return false;
        }
        const err = RegEx.handleVerifications({ [mobileRegName]: phone });
        if (err) {
            Toast.fail(err, 2);
            return false
        }
        getCodeClick && getCodeClick();
    };

    // 提供给父组件发送短信function
    sendCode = () => {
        const { dispatch, dispatchType = 'login/sendValidationWithCaptcha', phone, captcha, sendValidationSuccess, sendValidationFail } = this.props;
        const { mobileRegName } = this.state;
        if (this.state.isTiming) {
            return false;
        }
        const err = RegEx.handleVerifications({ [mobileRegName]: phone, validationCaptcha: captcha });
        if (err) {
            Toast.fail(err, 2);
            return false
        }
        Toast.loading('Loading...', 0);
        dispatch({
            type: dispatchType,
            payload: {
                mobile: phone,
                captchaCode: captcha,
                token: sessionStorage.getItem("validationCaptchaToken")
            }
        }).then((data) => {
            if (data && data.code === 200) {
                Toast.info(data.message || '验证码发送成功', 2);
                // 成功发送验证码并倒计时
                sendValidationSuccess && sendValidationSuccess()
                this.setTime()
            } else {
                Toast.info(data && data.message || '验证码发送失败', 2);
                sendValidationFail && sendValidationFail()
            }
        })
    }

    render() {
        const { disabled, codeText } = this.state;
        const { color, disabledColor, border } = this.props;

        return (
            <div style={
                color && disabled ?
                    { color, border: border === false ? 'none' : `0.02rem solid ${color}` } :
                    { color: disabledColor, border: border === false ? 'none' : '0.01rem solid rgba(223,223,223,1)' }}
                className={disabled ? styles.send : styles.disabled}
                onClick={(e) => this.getCodeClick(e)}
            >
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
    codeText: '发送验证码',
    countdown: 60,
    countdownSuffix: '秒后重发',
    mobileRegName: 'mobile',
    disabledColor: '#BDBFBF'
};

export default VerifyCode;
