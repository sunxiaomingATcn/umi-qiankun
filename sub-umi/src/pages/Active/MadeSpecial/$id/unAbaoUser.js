import React, { Component, Fragment } from 'react';
import { Modal, Toast, ActivityIndicator } from 'antd-mobile';
import { connect } from 'dva';
import styles from './index.scss';
import { history } from 'umi';
import Warning from '@/components/wxWarning';
import md5Map from './md5Price';

const alert = Modal.alert;

@connect(({ activeCustom, loading }) => ({
    activeCustom,
    activeLoading: loading.models.activeCustom
}))
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            phone: '',
            amount: undefined,
            activeLoading: false
        }
    }

    componentDidMount() {
        const { match: { params: { id: activeId } } } = this.props;
        const activeParams = md5Map(activeId);

        this.setState({
            activeParams,
            ...activeParams,
            activeId
        }, () => {
            const { activeCustom: { crmUserKey } } = this.props;
            if (!crmUserKey) return;
            this.setState({ activeLoading: true })
            this.init()
        })
    }

    init = () => {
        const { dispatch, activeCustom: { crmUserKey } } = this.props;
        dispatch({
            type: 'activeCustom/queryHomeCustomizationInfo',
            payload: {
                crmUserKey
            }
        }).then(res => {
            this.setState({ activeLoading: false })
            if (res && res.code === 0) {
                const { status, qrcode } = res.payload;
                this.judgeStatusJump(status, qrcode)
            } else {
                // Toast.info(res && res.message)
            }
        })
    }

    judgeStatusJump = (status, qrcode, showCode) => {
        const { activeParams } = this.state;
        if (status == 1) {
            this.setState({ needPayCode: qrcode })
            if (showCode) {
                this.setState({ visible: false })
                this.showPayCode(qrcode)
            }
        } else if (status == 2) {
            history.replace(activeParams.formResLink)
        } else if (status == 3) {
            history.replace(activeParams.formLink)
        }
        return status;
    }

    showPayCode = (url) => {
        alert('', <div><img className={styles.qrcode} src={url} alt="二维码" /><p>请用手机微信扫描二维码付款</p></div>, [])
    }

    getOrder = () => {
        const { dispatch } = this.props;
        const { amount, phone, channel, specialPayBackLink } = this.state;
        // 创建订单
        dispatch({
            type: 'activeCustom/getCrmUserKey',
            payload: {
                businessType: 1,
                mobile: phone,
                paymentAmount: amount,
                businessVersion: 'special',
                channel,
                callBackUrl: `${window.location.origin}/#${specialPayBackLink}`
            }
        }).then(res => {
            Toast.hide()
            if (res && res.code === 0) {
                if (res.payload.qrcodeUrl) {
                    this.showPayCode(res.payload.qrcodeUrl)
                }
            } else {
                Toast.info(res && res.message)
            }
        })
    }
    /**
     * 获取该手机号表单状态
    */
    queryHomeCustomization = () => {
        const { dispatch } = this.props;
        const { phone } = this.state;
        Toast.loading('Loading...', 0);
        dispatch({
            type: 'activeCustom/queryHomeCustomizationInfo',
            payload: {
                mobile: phone
            }
        }).then(res => {
            if (res && res.code === 0) {
                if (res.payload && (res.payload.status === 4)) {
                    localStorage.setItem("customizedInitPhone", phone)
                    this.getOrder()
                } else {
                    // 表单填写成功
                    Toast.hide()
                    this.judgeStatusJump(res.payload && res.payload.status, res.payload.qrcode, true)
                }
            } else {
                Toast.info(res && res.message)
            }
        })
    }

    onPay = () => {

    }

    immediateCustom = () => {
        const { needPayCode } = this.state;
        if (needPayCode) {
            // 去支付
            this.showPayCode(needPayCode)
        } else {
            this.setState({ visible: true })
        }
    }

    modalClickOk = () => {
        const { phone } = this.state;
        if (!/^1[3456789]\d{9}$/.test(phone)) {
            Toast.fail('请输入正确的手机号', 2);
            return false;
        }
        this.queryHomeCustomization()
    }

    onClose = () => {
        this.setState({ visible: false })
    }

    handleChange = (key, val) => {
        this.setState({
            [key]: val.target.value
        })
    }

    render() {
        const { visible, phone, amount, activeLoading } = this.state;
        return (
            <div className={styles.container}>
                <ActivityIndicator animating={activeLoading} />
                {amount !== undefined ? <div className={styles.main}>
                    <div className={styles.content}>
                        {[...Array(13)].map((v, k) => k).map(i => (<img className={styles.imgs} src={require(`./images/${i + 1}.png`)} alt="" />))}
                    </div>
                    <div className={styles.footer} onClick={() => this.immediateCustom()}>
                        <img className={styles.imgs} src={require(`./images/btn${amount}.png`)} alt="" />
                    </div>
                </div> : <p className={styles.illegalParam}>参数错误</p>}
                <div className="modal">
                    <Modal
                        visible={visible}
                        transparent
                        animationType="slide-down"
                        footer={[{
                            text: '取消', onPress: () => {
                                this.onClose()
                            }
                        }, {
                            text: '获取服务', onPress: () => {
                                this.modalClickOk()
                            }
                        }]}
                    >
                        <div className="phone">
                            <input type='text'
                                name="phone"
                                placeholder='请输入手机号'
                                maxLength={11}
                                value={phone}
                                onBlur={v => window.scrollTo(0, 0)}
                                onChange={v => this.handleChange('phone', v)}
                            />
                        </div>
                        <p className="tips">请优先填写微信绑定的手机号，便于后续服务。</p>
                    </Modal>
                </div>
            </div>
        );
    }
}

export default Index;
