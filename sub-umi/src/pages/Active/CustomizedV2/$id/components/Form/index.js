/**
 * title: 家庭保险方案定制服务
*/
import React, { Component, Fragment } from 'react';
import Utils from '@/utils/utils';
import { initUserInfo } from '../../assets/common';
import { connect } from 'dva';
import Question1 from './question1';
import Question2 from './question2';
import Question3 from './question3';
import Question4 from './question4';
import AppointmentSuccess from './appointmentSuccess';
import styles from '../../css/form.less';
import { Toast } from 'antd-mobile';

@connect(({ customizedV2, loading }) => ({
    customizedV2,
    loading: loading.models.customizedV2
}))
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userStatus: 0,
            currentQuestionNum: 1,
            pageNameToCollect: {
                '1': '表单1-联系方式',
                '2': '表单2-为谁咨询保险',
                '3': '表单3-考虑哪些险种',
                '4': '表单4-预约时间'
            }
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.userStatus !== prevState.initUserStatus) {
            const { userStatus } = nextProps;
            return {
                initUserStatus: userStatus,
                userStatus
            }
        }
        return null;
    }

    componentDidMount() {
        // status3：统计q1
        const { userStatus } = this.state;
        if (userStatus == 3) this.collectBaiduHm(1)
    }

    // 统计每题
    collectBaiduHm = (pageNum) => {
        const { activeParams } = this.props;
        Utils.collectBaiduHm(`1v1_${activeParams.amount}_${activeParams.channel}_${this.state.pageNameToCollect[pageNum]}`, "open")
    }

    submit = (communicationDate, communicationTimeRange) => {
        const { dispatch, customizedV2: { name, insuranceTarget, buyWhat }, activeParams, activeParams: { channel = "", crmAdviserId } } = this.props;
        const payload = { communicationDate, communicationTimeRange, name, insuranceTarget, buyWhat, channel, crmAdviserId, sourceUrl: window.location.href };
        console.log('submit', payload)
        const type = Utils.isWeiXin() ? 'customizedV2/submitCustomized' : 'customizedV2/submitUnWcCustomized';
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

    nextQuestion = (nextStep, communicationDate, communicationTimeRange) => {
        let next = nextStep;
        if (!nextStep) {
            next = this.state.currentQuestionNum + 1;
        } else if (next === 'submit') {
            this.submit(communicationDate, communicationTimeRange)
            return;
        }
        if (next > 4) {
            return;
        }
        this.collectBaiduHm(next)
        this.setState({
            currentQuestionNum: next
        })
    }

    preQuestion = (preStep) => {
        let pre = preStep;
        if (!preStep) {
            pre = this.state.currentQuestionNum - 1;
        }
        if (pre <= 0) {
            return;
        }
        this.collectBaiduHm(pre)
        this.setState({
            currentQuestionNum: pre
        })
    }

    renderSubject = () => {
        const componentMap = {
            1: Question1,
            2: Question2,
            3: Question3,
            4: Question4,
        }
        const ComponentName = componentMap[this.state.currentQuestionNum]
        return ComponentName ? <ComponentName nextQuestion={this.nextQuestion} preQuestion={this.preQuestion} /> : null
    }

    render() {
        const { userStatus } = this.state;

        return (
            <Fragment>
                {
                    userStatus ? <div className={styles.container} id="form-container">
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
                                userStatus === 3 ? <div className={styles.detail}>
                                    <p className={styles.firstDes}>支付成功！您已购买该服务</p>
                                    <p className={styles.thirdDes}>填写如下表单信息，即可成功预约顾问</p>
                                    <p className={styles.fourthDes}>顾问将按照您约定的时间与您沟通</p>
                                </div> : userStatus === 2 ? <div className={styles.detail}>
                                    <p className={styles.appointmentSuccessTitle}>预约成功！</p>
                                    <p className={styles.appointmentSuccessDes}>您的专属规划师会如约而至<br />请耐心等待</p>
                                    <p className={styles.reminder}>温馨提示：规划师工作时间，周一至周日9:00-19:00</p>
                                </div> : null
                            }
                        </div>
                        {userStatus === 3 && <div className={styles.subject}> {this.renderSubject()}</div>}
                        {userStatus === 2 && <AppointmentSuccess activeParams={this.props.activeParams} />}
                    </div> : null
                }
            </Fragment>

        );
    }
}

export default Index;