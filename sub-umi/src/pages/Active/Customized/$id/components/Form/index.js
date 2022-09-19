/**
 * title: 家庭保险方案定制服务
*/
import React, { Component, Fragment } from 'react';
import Utils from '@/utils/utils';
import { initUserInfo } from '../../assets/common';
import { connect } from 'dva';
import AppointmentSuccess from './appointmentSuccess';
import styles from '../../css/form.less';
import { Toast } from 'antd-mobile';
import FormPage from "./pageindex"

@connect(({ activeV3, loading }) => ({
    activeV3,
    loading: loading.models.activeV3
}))
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userStatus: 0,
            second: 2,
            formflag: false
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.userStatus !== prevState.initUserStatus) {
            const { userStatus } = nextProps;
            return {
                initUserStatus: userStatus,
                formflag: nextProps.formflag?nextProps.formflag:prevState.formflag,
                userStatus
            }
        }
        return null;
    }

    componentDidMount() {
        // status3：统计q1
        const { userStatus } = this.state;
        const { activeParams: { amount, channel } } = this.props
        Utils.collectBaiduHm(`1v1_v3.0_${amount}_${channel}_${userStatus === 2 ? '预约成功' : '支付成功页'}`, "open")
        let flag = true
        if (amount == 0 && userStatus == 3)
            flag = false
        if (localStorage.getItem("pay") && userStatus == 3) {
            flag = true
        }
        this.setState({
            formflag: flag
        }, () => {
            if (this.state.formflag && userStatus == 3)
                this.secondcount()
            if (localStorage.getItem("pay"))
                localStorage.removeItem("pay")
        })
    }

    secondcount() {
        if (this.state.second > 0) {
            setTimeout(() => {
                this.setState({
                    second: --this.state.second
                }, () => {
                    if (this.state.second >= 0) {
                        this.secondcount()
                    }
                })
            }, 1000)
        } else {
            this.setState({
                formflag: false
            })
            // window.location.href=window.location.origin
        }
    }


    submit = (communicationDate, communicationTimeRange) => {
        const { dispatch, activeV3: { name, insuranceTarget, buyWhat }, activeParams, activeParams: { channel = "", crmAdviserId } } = this.props;
        const payload = { communicationDate, communicationTimeRange, name, insuranceTarget, buyWhat, channel, crmAdviserId, sourceUrl: window.location.href };
        const type = Utils.isWeiXin() ? 'activeV3/submitCustomized' : 'activeV3/submitUnWcCustomized';
        Toast.loading('Loading...', 0);
        dispatch({
            type,
            payload
        })
            .then(res => {
                if (res && res.code == 0) {
                    Toast.hide()
                    initUserInfo(this, Utils.isWeiXin(), activeParams); // 避免跳出返回状态未更新
                    this.setState({ userStatus: 2 })
                } else {
                    Toast.info(res && res.message)
                }
            })
    }


    handlink(flag) {
        const { activeParams: { amount, channel } } = this.props
        Utils.collectBaiduHm(`1v1_v3.0_${amount}_${channel}_支付成功页`, `${flag == 1 ? "click1" : "click2"}`)
        this.setState({
            formflag: false
        })
    }

    render() {
        const { userStatus } = this.state;
        return (
            <Fragment>
                {
                    userStatus && (userStatus == 2 || userStatus == 3) && this.state.formflag &&
                    <div className={styles.container} id="form-container">
                        <div className={styles.statusBox}>
                            <ul>
                                <li className={userStatus >= 2 ? styles.active : undefined}>
                                    <p>支付成功</p>
                                    <img src={require('../../images/pay_orange.png')} />
                                </li>
                                <li className={styles.arrow}>
                                    <img src={require('../../images/arrow_orange.png')} />
                                </li>
                                <li className={userStatus === 2 ? styles.active : undefined}>
                                    <p>{userStatus === 2 ? '预约成功' : '待预约'}</p>
                                    <img src={require(`../../images/appointment_${userStatus === 2 ? 'orange' : 'grey'}.png`)} />
                                </li>
                                <li className={styles.arrow}>
                                    <img src={require(`../../images/arrow_${userStatus === 2 ? 'orange' : 'grey'}.png`)} />
                                </li>
                                <li>
                                    <p>方案定制</p>
                                    <img src={require('../../images/made_grey.png')} />
                                </li>
                            </ul>
                            {
                                userStatus == 3 && this.state.formflag && <Fragment>
                                <p className={styles.paysuccess} >支付成功！</p>
                                <p className={styles.paysuccess} >您已购买该服务</p>
                                </Fragment>
                            }
                            {
                                userStatus == 3 && this.state.formflag && <div className={styles.subject}>
                                    <div onClick={() => { this.handlink(1) }} className={styles.write}>去填写表单信息<img src={require("./images/jiantou.png")}></img></div>
                                    <p onClick={() => { this.handlink(1) }}>即可成功预约顾问</p>
                                    <p onClick={() => { this.handlink(1) }}>顾问将按照您约定的时间与您沟通</p>
                                    <div className={styles.line}></div>
                                    <div><span className={styles.second}>{this.state.second}</span><span className={styles.content}>秒后自动跳转至表单填写页</span></div>
                                    <div onClick={() => { this.handlink(2) }} className={styles.handlink}>手动跳转</div>
                                </div>
                            }
                            {
                                userStatus == 2 &&<div className={styles.detail}>
                                    <p className={styles.appointmentSuccessTitle}>预约成功！</p>
                                    <p className={styles.appointmentSuccessDes}>您的专属规划师会如约而至<br />请耐心等待</p>
                                    <p className={styles.reminder}>温馨提示：规划师工作时间，周一至周日9:00-19:00</p>
                                </div>
                            }
                        </div>
                            {userStatus == 2 &&<AppointmentSuccess activeParams={this.props.activeParams} />}
                    </div>
                }
                {
                    userStatus == 3 && !this.state.formflag &&<FormPage  {...this.props}></FormPage>
                }
            </Fragment>

        );
    }
}

export default Index;