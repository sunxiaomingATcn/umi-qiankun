/**
 * 废弃 禁用
 * 
 * Class VerifyCode ： 短信验证码组件
 * @prop phone：手机号 required
 * @prop codeText：展示文案，默认：发送验证码
 * @prop countdown：验证码倒计时总时长，默认: 60 （单位秒）
 * @prop type： 验证码样式类型：active，form； 默认：form
 */
import React, {Component} from 'react';
import {connect} from 'dva';
import {Toast} from 'antd-mobile';
import styles from './index.scss';
import RegEx from '@/utils/RegEx.js';
import PropTypes from 'prop-types';


@connect(({login, loading}) => ({
    login,
    loading: loading.models.login,
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
        const {codeText, phone} = this.props;
        this.setState({
            codeText,
            phone
        })
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const {type, countdown} = nextProps;
        if (type !== prevState.type || countdown !== prevState.type) {
            return {type, countdown}
        }
        return null;
    }

    /**
     * 倒计时
     */
    setTime = () => {
        let countdown = this.state.countdown;
        this.setState({isTiming: true, disabled: false, codeText: countdown + '秒后重发'});
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
                    codeText: countdown + '秒后重发',
                    disabled: false
                });
                countdown--;
            }
        }, 1000);
    };

    getCodeClick = (e) => {
        e.preventDefault();
        const {dispatch, phone} = this.props;
        if (this.state.isTiming || this.props.loading) {
            return false;
        }
        const err = RegEx.handleVerification('mobile', phone);
        if (err) {
            Toast.fail(err, 2);
            return false
        }
        Toast.loading('Loading...', 0);
        dispatch({
            type: 'login/sendValidation',
            payload: {
                mobile: phone
            }
        }).then((data) => {
            if (data.code === 0) {
                Toast.success('验证码发送成功', 2);
                // 成功发送验证码并倒计时
                this.setTime()
            } else {
                Toast.fail('验证码发送失败', 2);
            }
        })
    };

    render() {
        const {disabled, codeText, type} = this.state;

        return (
            <div className={styles[type]}>
                <div className={disabled ? styles.send : styles.disabled}
                     onClick={(e) => this.getCodeClick(e)}>
                    {codeText}
                </div>
            </div>
        );
    }
}

VerifyCode.propTypes = {
    phone:PropTypes.string.isRequired,
    codeText: PropTypes.string,
    countdown: PropTypes.number,
    type: PropTypes.oneOf(['form', 'active'])
};

VerifyCode.defaultProps = {
    codeText:'发送验证码',
    countdown: 60,
    type: 'form'
};

export default VerifyCode;
