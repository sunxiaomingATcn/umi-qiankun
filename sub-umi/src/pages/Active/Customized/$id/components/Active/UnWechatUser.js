import React, { Component } from 'react';
import { connect } from 'dva';
import Utils from '@/utils/utils';
import { initUserInfo, onPay } from '../../assets/common';
import ArtVerifyCode from '@/components/VerifyCode/Code';
import Captcha from '@/components/Captcha/index';
import Reg from '@/utils/RegEx';
import { InputItem, Toast, Modal } from 'antd-mobile';
import styles from '../../css/index.less';

@connect(({ login, activeV3 }) => ({
    login,
    activeV3
}))
class UnWechatUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            orderIsCreatedAutoMobile: false,//订单已创建未支付,自动回显手机号标识
            mobile: "",
            validationCode: ""
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (JSON.stringify(nextProps.activeV3.customizationInfo) !== JSON.stringify(prevState.customizationInfo)) {
            const { activeV3: { customizationInfo } } = nextProps;
            return { customizationInfo, orderIsCreatedAutoMobile: !!(customizationInfo.status == 1 && customizationInfo.mobile), mobile: customizationInfo.status == 1 ? customizationInfo.mobile : "" }
        }
        return null;
    }

    componentDidMount() {
        const { activeParams } = this.props;
        this.setState({
            activeParams,
            ...activeParams
        })
    }

    validationCode = () => {
        const { dispatch } = this.props;
        const { mobile, validationCode } = this.state;
        Toast.loading('Loading...', 0)
        return dispatch({
            type: 'login/validationCode',
            payload: {
                mobile,
                validationCode
            }
        })
    }

    getOrderLogin = () => {
        const { dispatch } = this.props;
        const { amount, mobile, channel, crmAdviserId, crmCustomerId } = this.state;
        // 创建订单
        Toast.loading('Loading...', 0)
        return dispatch({
            type: 'activeV3/getPayOrderIdNoWechat',
            payload: {
                businessType: 1,
                mobile,
                paymentAmount: amount,
                channel,
                crmAdviserId,
                crmCustomerId,
                sourceUrl: window.location.href
            }
        }).then(res => {
            Toast.hide()
            if (res && res.code == 0) {
                Utils.collectBaiduHm(`1v1_v3.0_${amount}_${channel}_在线定制保险方案`, 'click1')
                return res.payload;
            } else {
                Utils.collectBaiduHm(`1v1_v3.0_${amount}_${channel}_在线定制保险方案`, 'click0')
                Toast.fail(res && res.message || "获取订单失败")
                return Promise.reject()
            }
        })
    }

    submit = () => {
        const { userStatusInfo, setUserStatus } = this.props;
        const { orderIsCreatedAutoMobile, activeParams, mobile, validationCode, amount, paybackLink, search, channel } = this.state;
        const checkMobile = this.handleBlur('mobile', mobile, Reg.mobile);
        const checkValidationCode = orderIsCreatedAutoMobile ? false : this.handleBlur('validationCode', validationCode, Reg.validationCode6);
        const checkSubmit = !checkMobile && !checkValidationCode;
        if (!checkSubmit) {
            Toast.info("请按红字提示正确填写信息")
            Utils.collectBaiduHm(`1v1_v3.0_${amount}_${channel}_在线定制保险方案`, 'click0')
            return;
        }
        if (orderIsCreatedAutoMobile && userStatusInfo.status == 1) {
            // 自动回显手机号且待支付
            const { userStatusInfo: { payOrderId } } = this.props;
            if (amount) {
                onPay({ amount, payOrderId, mobile, paybackLink, search, channel })
            } else {
                setUserStatus && setUserStatus(3)
            }
        } else {
            this.validationCode()
                .then(res => {
                    if (!res) return; // 验证码验证失败
                    this.getOrderLogin()
                        .then(({ payOrderId, mobile }) => {
                            initUserInfo(this, false, activeParams)
                                .then(res => {
                                    const { status } = res;
                                    if (status == 1) {
                                        if (amount) {
                                            onPay({ amount, payOrderId, mobile, paybackLink, search, channel })
                                        } else {
                                            setUserStatus && setUserStatus(3)
                                        }
                                    } else {
                                        setUserStatus && setUserStatus(status)
                                    }
                                })
                        })
                })
        }
    }

    handleBlur = (key, val, reg) => {
        const result = !reg.test(val);
        this.setState({
            [`${key}ValErr`]: result ? `请输入${val ? '正确' : ''}${key == 'mobile' ? '手机号码' : '短信验证码'}` : undefined
        })
        return result;
    }

    handleChange = (key, val) => {
        this.setState({
            [key]: val
        })
    }

    render() {
        const { visCode, mobileValErr, validationCodeValErr, search, showCaptcha } = this.state;

        return (
            <div className={styles.inputContainer}>
                <div className={[mobileValErr ? styles.errorInput : "", styles.phone].join(" ")}>
                    <InputItem
                        clear
                        type="digit"
                        onBlur={v => this.handleBlur('mobile', v, Reg.mobile)}
                        onFocus={() => { this.setState({ visCode: true, orderIsCreatedAutoMobile: false }) }}
                        value={this.state.mobile}
                        onChange={mobile => this.setState({ mobile: mobile.substr(0, 11) })}
                        placeholder="请输入手机号码,仅用于方案讲解"
                    ></InputItem>
                    {mobileValErr && <p className={styles.error}>{mobileValErr}</p>}
                </div>
                {visCode && <div className={[validationCodeValErr ? styles.errorInput : "", styles.code].join(" ")}>
                    <InputItem
                        placeholder="请输入短信验证码"
                        type="digit"
                        onChange={validationCode => this.setState({ validationCode: validationCode.substr(0, 6) })}
                        value={this.state.validationCode}
                        onBlur={v => this.handleBlur('validationCode', v, Reg.validationCode6)}
                    />
                    <div className={styles.artVerifyCode}
                    // onClick={() => this.collectBaiduHm(5)}
                    >
                        <ArtVerifyCode
                            phone={this.state.mobile}
                            captcha={this.state.captcha}
                            color="#FF7800"
                            border={false}
                            onRef={(ref) => this.refVerifyCode = ref}
                            dispatch={this.props.dispatch}
                            getCodeClick={() => this.setState({ showCaptcha: true })}
                            sendValidationSuccess={() => this.setState({ showCaptcha: false, captcha: undefined })}
                            sendValidationFail={() => this.refCaptcha && this.refCaptcha.getCaptcha()}
                        />
                    </div>
                    {validationCodeValErr && <p className={styles.error}>{validationCodeValErr}</p>}
                </div>}
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
                            <InputItem
                                clear
                                type='text'
                                placeholder=''
                                className={[styles.flex_basis, styles.phone_number].join(' ')}
                                onChange={v => this.handleChange('captcha', v)}
                            />
                        </div>
                        <div className="codetips">请输入下图中的字符，不区分大小写</div>
                        <div className="captchaimg"><Captcha onRef={(ref) => this.refCaptcha = ref} /></div>
                        <div className="getCode" onClick={() => this.refVerifyCode && this.refVerifyCode.sendCode()}>确 定</div>
                    </div>
                </Modal>
                <div className={styles.submit} onClick={this.submit}>
                    立即定制
                </div>
            </div>
        );
    }
}

export default UnWechatUser;