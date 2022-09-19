import React, { Component } from 'react';
import { connect } from 'dva';
import { initUserInfo, onPay } from '../../assets/common';
import Reg from '@/utils/RegEx'
import { InputItem, Toast } from 'antd-mobile';
import Utils from '@/utils/utils';
import md5Map from '../../assets/md5Price';
import styles from '../../css/index.less';

@connect(({ common, activeV3, loading }) => ({
    common,
    activeV3,
    loading: loading.models.activeV3
}))
class WechatUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLogin: false,
            mobile: ""
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (JSON.stringify(nextProps.activeV3.customizationInfo) !== JSON.stringify(prevState.customizationInfo)) {
            const { activeV3: { customizationInfo } } = nextProps;
            return { customizationInfo, mobile: customizationInfo.mobile }
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

    handleBlur = (key, val, reg) => {
        const result = !reg.test(val);
        this.setState({
            [`${key}ValErr`]: result ? `请输入${val ? '正确' : ''}手机号码` : undefined
        })
        return result;
    }

    handleChange = (key, val) => {
        this.setState({
            [key]: val
        })
    }

    // 新用户生成订单 返回payOrderId
    getOrder = () => {
        Toast.loading('Loading...', 0);
        return new Promise((resolve, reject) => {
            const { amount, mobile, channel, crmAdviserId, crmCustomerId } = this.state;
            const { dispatch } = this.props;
            dispatch({
                type: 'activeV3/initCustomizationOrder',
                payload: {
                    mobile,
                    amount,
                    channel,
                    crmAdviserId,
                    crmCustomerId,
                    sourceUrl: window.location.href
                }
            }).then(res => {
                Toast.hide()
                if (res && res.code == 0) {
                    Utils.collectBaiduHm(`1v1_v3.0_${amount}_${channel}_在线定制保险方案`, 'click1')
                    if (!res.payload.isHistoryUser) {
                        resolve(res.payload)
                    } else {
                        const { setUserStatus } = this.props;
                        setUserStatus && setUserStatus(3)
                        reject()
                    }
                } else {
                    Toast.fail(res && res.message || "获取订单失败")
                    Utils.collectBaiduHm(`1v1_v3.0_${amount}_${channel}_在线定制保险方案`, 'click0')
                    reject()
                }
            })
        })
    }

    submit = () => {
        const { activeParams, mobile, channel, amount, paybackLink, search } = this.state;
        const { setUserStatus } = this.props;
        const checkMobileIsErr = this.handleBlur('mobile', mobile, Reg.mobile);
        if (checkMobileIsErr) {
            Toast.info("请按红字提示正确填写信息")
            Utils.collectBaiduHm(`1v1_v3.0_${amount}_${channel}_在线定制保险方案`, 'click0')
            return;
        }
        initUserInfo(this, true, activeParams, { mobile }).then(res => {
            const { status } = res;
            if (status == 2 || status == 3) {
                Utils.collectBaiduHm(`1v1_v3.0_${amount}_${channel}_在线定制保险方案`, 'click1')
                setUserStatus(status)
            } else {
                this.getOrder().then(({ payOrderId, mobile }) => {
                    const { setUserStatus } = this.props;
                    if (amount) {
                        // 去支付
                        onPay({ amount, payOrderId, mobile, channel, paybackLink, search })
                    } else {
                        // 新用户0元订单
                        setUserStatus && setUserStatus(3)
                    }
                })
            }
        })
    }

    render() {
        const { mobileValErr } = this.state;

        return (
            <div className={styles.inputContainer}>
                <div className={[mobileValErr ? styles.errorInput : "", styles.phone].join(" ")}>
                    <InputItem
                        clear
                        type="digit"
                        onBlur={v => this.handleBlur('mobile', v, Reg.mobile)}
                        onFocus={() => { this.setState({ visCode: true }) }}
                        value={this.state.mobile}
                        onChange={mobile => this.setState({ mobile: mobile.substr(0, 11) })}
                        placeholder="请输入手机号码,仅用于方案讲解"
                    ></InputItem>
                    {mobileValErr && <p className={styles.error}>{mobileValErr}</p>}
                </div>
                <div className={styles.submit} onClick={this.submit}>
                    立即定制
                </div>
            </div>
        );
    }
}

export default WechatUser;