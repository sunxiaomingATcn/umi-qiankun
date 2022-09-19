import React, { Component, Fragment } from 'react';
import { Modal, Toast, ActivityIndicator } from 'antd-mobile';
import { connect } from 'dva';
import styles from './index.scss';
import Utils from '@/utils/utils';
import WxSDK from "@/utils/wx-sdk";
import { history } from 'umi';
import Warning from '@/components/wxWarning';
import md5Map from './md5Price';

@connect(({ common, loading }) => ({
    common,
    commonLoading: loading.models.common,
    activeLoading: loading.models.activeCustom
}))
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            phone: '',
            amount: undefined,
            isTourist: true,
            isWxLogin: false
        }
    }

    componentDidMount() {
        const { match: { params: { id: activeId } }, location: { query: { code } } } = this.props;
        const activeParams = md5Map(activeId);
        const { amount, wxShareData, channel } = activeParams;

        this.setState({
            ...activeParams,
            activeId
        }, _ => {
            if (code) {
                this.wxLogin(code)
            } else {
                this.queryCustomizationInfo()
            }
        })
        WxSDK.share(wxShareData)
        if (amount !== undefined) Utils.collectBaiduHm(`1v1_${amount}_${channel}_在线定制保险方案`, "open")
    }
    /**
     * 获取用户家庭定制信息
    */
    queryCustomizationInfo = () => {
        const { dispatch } = this.props;
        const { amount } = this.state;
        // 判断用户登陆状态
        dispatch({
            type: 'activeCustom/queryCustomizationInfo',
            payload: amount
        }).then(res => {
            if (res && res.code == 0) {
                this.setState({
                    isTourist: false
                })
                this.judgeOrderStatus(res)
            }
        })
    }

    /**
     * 家庭定制订单状态
     * 1.有待支付订单，需要支付 click btn => cheche pay
     * 2.有支付成功的订单,表单已填写 router go 表单完成
     * 3.有支付成功的订单,表单未填写 router go 表单
     * 4.新用户 click btn => model phone => dispatch getPayOrderId => cheche pay
     * 1，4 dom loaded 不处理
     * */
    judgeOrderStatus = (res) => {
        const { amount, channel, formLink, formResLink } = this.state;
        let { payload: { status, payOrderId, mobile } } = res;
        const { isWxLogin } = this.state;
        this.setState({
            status, payOrderId, mobile
        })
        switch (status) {
            case 1:
                !mobile && Toast.fail("有待支付订单，但无手机号")
                break;
            case 2:
                history.replace(formResLink)
                break;
            case 3:
                history.replace(formLink)
                break;
            case 4:
                if (isWxLogin) {
                    this.setState({
                        visible: true
                    })
                    Utils.collectBaiduHm(`1v1_${amount}_${channel}_手机号填写弹窗`, "open")
                }
        }
    }

    wxLogin = (code) => {
        const { dispatch } = this.props;
        const { channel } = this.state;
        dispatch({
            type: "common/wechatLogin",
            payload: {
                code,
                channel,
                source: 3
            }
        }).then(res => {
            if (!res || res.code !== 0) {
                this.toAuthorize();
                // Toast.fail(res.message || "微信授权登录失败", 3)
            } else {
                this.setState({ isWxLogin: true })
                this.queryCustomizationInfo()
            }
        })
    }

    toAuthorize = () => {
        const { activeLink } = this.state;
        const callbackUrl = `${window.location.origin}/#${activeLink}`;
        history.push(`/Authorize?cb=${encodeURIComponent(callbackUrl)}`)
    }

    immediateCustom = () => {
        const { amount, channel } = this.state;
        Utils.collectBaiduHm(`1v1_${amount}_${channel}_在线定制保险方案`)

        Promise.resolve().then(() => {
            const { amount, status, isTourist, channel } = this.state;
            // status 2，3已经跳转，1拉起支付，4弹窗
            if (isTourist) {
                this.toAuthorize()
                return;
            }
            if (status == 1 && amount) {
                this.onPay();
                return;
            } else if (status == 4) {
                this.setState({ visible: true })
                Utils.collectBaiduHm(`1v1_${amount}_${channel}_手机号填写弹窗`, "open")
            }
        })
    }

    modalClickOk = () => {
        // 生成订单
        const { amount, phone, formLink, channel } = this.state;
        Utils.collectBaiduHm(`1v1_${amount}_${channel}_手机号填写弹窗`)

        if (!/^1[3456789]\d{9}$/.test(phone)) {
            Toast.fail('请输入正确的手机号', 2);
            return false;
        }
        this.getOrder().then(({ payOrderId, mobile }) => {
            this.setState({
                payOrderId,
                mobile
            }, () => {
                if (amount) {
                    // 去支付
                    this.onPay()
                } else {
                    // 新用户0元订单
                    history.replace(formLink)
                }
            })
        })
    }

    // 新用户生成订单 返回payOrderId
    getOrder = () => {
        Toast.loading('Loading...', 0);
        return new Promise((resolve, reject) => {
            const { amount, phone, formResLink } = this.state;
            const { dispatch } = this.props;
            dispatch({
                type: 'activeCustom/initCustomizationOrder',
                payload: {
                    mobile: phone,
                    amount: amount
                }
            }).then(res => {
                Toast.hide()
                if (res && res.code == 0) {
                    if (!res.payload.isHistoryUser) {
                        resolve(res.payload)
                    } else {
                        history.replace(formResLink)
                        reject()
                    }
                } else {
                    Toast.fail(res && res.message || "获取订单失败")
                    reject()
                }
            })
        })
    }

    onClose = () => {
        this.setState({ visible: false })
    }

    onPay = () => {
        // 车险线上 wx  wxcf02994504264506
        // 车险二云测试环境 wx05444814b830d0c5
        // 车险三云测试环境  wxe127abae975d86d6
        const { amount, payOrderId, mobile, paybackLink, channel } = this.state;
        const origin = window.location.origin;
        const wxOauth = 'https://open.weixin.qq.com/connect/oauth2/authorize';
        const callbackUrl = encodeURIComponent(`mobile=${mobile}&amount=${amount}&payOrderId=${payOrderId}&channel=${channel}&callbackUrl=${origin}/#${paybackLink}`);
        const dev1_url = `${wxOauth}?appid=wx05444814b830d0c5&redirect_uri=https://dev1.cc.chetimes.com/v2.1/orders/health/custom/callback&response_type=code&scope=snsapi_base&state=${callbackUrl}`;
        const dev2_url = `${wxOauth}?appid=wxe127abae975d86d6&redirect_uri=https://dev2.cc.chetimes.com/v2.1/orders/health/custom/callback&response_type=code&scope=snsapi_base&state=${callbackUrl}`;
        const url = `${wxOauth}?appid=wxcf02994504264506&redirect_uri=https://cc.chetimes.com/v2.1/orders/health/custom/callback&response_type=code&scope=snsapi_base&state=${callbackUrl}`;

        let target_url = url;
        if (origin.includes('//dev1')) {
            target_url = dev1_url
        } else if (origin.includes('//dev2')) {
            target_url = dev2_url
        }
        console.log(target_url)
        window.location.href = target_url;
    }

    handleChange = (key, val) => {
        this.setState({
            [key]: val.target.value
        })
    }

    render() {
        const { visible, phone, amount } = this.state;
        const { activeLoading, commonLoading } = this.props;

        return (
            <div className={styles.container}>
                {Utils.isWeiXin() ? <Fragment>
                    <ActivityIndicator animating={commonLoading || activeLoading} />
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
                                text: amount == 0 ? '获取服务' : '去支付', onPress: () => {
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
                </Fragment> : <Warning />}
            </div>
        );
    }
}

export default Index;
