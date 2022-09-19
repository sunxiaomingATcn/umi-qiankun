/**
 * title: 保单查询
 */
/**
 * 微信绑定crm
 * */
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './index.scss';
import { Toast, Icon, Modal } from 'antd-mobile';
import Captcha from '@/components/Captcha/index';
import { history } from 'umi';
import { UserInfo } from '../assets/common'
import RegEx from '@/utils/RegEx.js';

@connect(({ login, loading }) => ({
    login,
    loading: loading.models.login,
}))
class Index extends Component {
    constructor(props) {

        super(props);
        this.state = {
            phone: '',
            verifyCode: '',
            disabled: true,
            codeText: '发送验证码',
            isWait: false,
            defaultPhone: false
        }
    }

    componentDidMount() {
        UserInfo(this.props).then(data => {
            const { customerRelation } = data;
            if (customerRelation && customerRelation.mobile) {
                this.setState({
                    phone: customerRelation.mobile,
                    defaultPhone: true
                })
            }
        })
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    handleChange = (key, val) => {
        this.setState({
            [key]: val.target.value
        })
    }

    /**
     * 倒计时
     */
    setTime = () => {
        this.setState({ isWait: true, disabled: false });
        let countdown = 60;
        this.setState({ codeText: countdown + 's后重新发送' });
        this.timer = setInterval(() => {
            if (countdown === 0) {
                this.setState({
                    codeText: '重新获取',
                    isWait: false,
                    disabled: true
                });
                clearInterval(this.timer);
            } else {
                countdown--;
                this.setState({
                    codeText: countdown + 's后重新发送',
                    disabled: false
                });
            }
        }, 1000);
    };

    getCodeClick = (e) => {
        e.preventDefault();
        if (!this.checkData()) return false;
        if (this.state.isWait) {
            return false
        }
        this.setState({ showCaptcha: true })
    };

    sendCode = (e) => {
        e.preventDefault();
        const { phone, captchaCode } = this.state;
        const { dispatch } = this.props;
        if (this.state.isWait) {
            return false
        }
        if (!this.state.captchaCode) {
            Toast.fail('请输入图形验证码', 3);
            return false
        }
        if (!RegEx.validationCaptcha.test(this.state.captchaCode)) {
            Toast.fail('请输入正确图形验证码', 3);
            return;
        }
        Toast.loading('Loading...', 0);
        dispatch({
            type: 'login/sendValidationWithCaptcha',
            payload: {
                mobile: phone,
                captchaCode,
                token: sessionStorage.getItem("validationCaptchaToken")
            }
        }).then((data) => {
            if (data && data.code === 0) {
                Toast.success('验证码发送成功', 2);
                this.setState({ showCaptcha: false, captchaCode: undefined })
                // 接口成功发送验证码并倒计时
                this.setTime()
            } else {
                Toast.info(data && data.message || '验证码发送失败', 2);
                this.refCaptcha && this.refCaptcha.getCaptcha()
            }
        })
    }

    onLogin = () => {
        const { dispatch } = this.props;
        const { phone, verifyCode } = this.state;
        if (!this.checkData('submit')) return false;
        Toast.loading('Loading...', 0);
        dispatch({
            type: 'login/validationCode',
            payload: {
                mobile: phone,
                validationCode: verifyCode,
            }
        }).then((data) => {
            if (data.code !== 0) return;
            dispatch({
                type: 'policy/wechatBindCrmId',
                payload: {
                    bindMobile: phone
                }
            }).then(res => {
                Toast.hide()
                let crmIsBinded = false;
                if (res.code == 0) {
                    crmIsBinded = true;
                } else if (res.code == 1001) {
                    crmIsBinded = false;
                } else if (res.code == 1002) {
                    Toast.info('此手机已绑定其他微信号，请先解绑')
                    return;
                } else {
                    Toast.info(res.message)
                    return;
                }
                history.push({ pathname: '/Policy', query: { searchBy: 'crmUser' }, state: { crmIsBinded } })
            })
        })
    }

    /**
     * 校验表单
     * @return {Boolean} 当信息不完整时退出
     */
    checkData = (type) => {
        if (!this.state.phone) {
            Toast.fail('请输入手机号码', 2);
            return false
        }
        if (!/^1[3456789]\d{9}$/.test(this.state.phone)) {
            Toast.fail('请输入正确的手机号', 2);
            return false
        }
        // if (!type && !this.state.captchaCode) {
        //     Toast.fail('请输入图形验证码', 3);
        //     return false
        // }
        // if (!type && !RegEx.validationCaptcha.test(this.state.captchaCode)) {
        //     Toast.fail('请输入正确图形验证码', 3);
        //     return;
        // }
        if (type === 'submit') {
            if (!this.state.verifyCode) {
                Toast.fail('请输入短信验证码', 2);
                return false
            }

            if (!/^\d{6}$/.test(this.state.verifyCode)) {
                Toast.fail('请输入正确6位验证码', 2);
                return false
            }
        }

        return true
    };

    clearDefaultPhone = () => {
        this.setState({
            phone: "",
            defaultPhone: false
        })
    }

    render() {
        const { disabled, codeText, phone, defaultPhone, showCaptcha } = this.state;
        return (
            <div className={styles.container_wrapper}>
                <ul>
                    <li className={[styles.flex, styles.justify_between, styles.align_center].join(' ')}>
                        {defaultPhone && <div className={defaultPhone ? styles.defaultPhone : ''}><Icon type="cross" onClick={this.clearDefaultPhone} /><p>{phone.replace(phone.substring(3, 7), '****')}</p></div>}
                        <div className={styles.title}>手机号</div>
                        <input type='text'
                            placeholder='请输入手机号'
                            className={[styles.flex_basis, styles.phone_number].join(' ')}
                            onChange={v => this.handleChange('phone', v)}
                            value={phone}
                        />
                        <div className={styles.line}></div>
                        <div className={[styles.send, disabled ? undefined : styles.disabled].join(' ')} onClick={this.getCodeClick}>{codeText}</div>
                    </li>
                    <li className={[styles.flex, styles.justify_between, styles.align_center].join(' ')}>
                        <div className={styles.title}>验证码</div>
                        <input type='text'
                            name="phone"
                            placeholder='请输入短信验证码'
                            maxLength={6}
                            onChange={v => this.handleChange('verifyCode', v)}
                            className={[styles.flex_basis, styles.phone_number].join(' ')} />
                    </li>
                    <Modal
                        visible={showCaptcha}
                        transparent
                        maskClosable={false}
                        closable
                        className="cus_modal"
                        onClose={() => this.setState({ showCaptcha: false })}
                        title="请输入验证码"
                    >
                        <div className="captchaContainer">
                            <div className="captcha">
                                <input
                                    clear
                                    type='text'
                                    placeholder=''
                                    onChange={v => this.handleChange('captchaCode', v)}
                                />
                            </div>
                            <div className="codetips">请输入下图中的字符，不区分大小写</div>
                            <div className="captchaimg"><Captcha onRef={(ref) => this.refCaptcha = ref} /></div>
                            <div className="getCode" onClick={this.sendCode}>确 定</div>
                        </div>
                    </Modal>
                </ul>
                <div
                    onClick={(e) => this.onLogin(e)}
                    className={[styles.flex, styles.center, styles.submit].join(' ')}
                >绑定
                </div>
            </div>
        );
    }
}

export default Index;
