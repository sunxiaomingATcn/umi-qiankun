/**
 * title: 投保成功
 */
import React, { Component } from 'react';
import { Toast, Modal } from 'antd-mobile';
import Success from './components/success';
import OSSFile from '@/components/OSSFile';
import { connect } from 'dva';
import routerTrack from '@/components/routerTrack';
import styles from './index.scss';
@routerTrack({ id: 'page40' })
@connect()
class Index extends Component {
    constructor(props) {
        super(props);

    }
    state = {
        hasOrder: false,
        loadingSuccess: false,
        data: null,
        count: 0
    }

    timer = null;

    componentDidMount() {
        const { location: { query: { orderId } } } = this.props;
        this.setState({ orderId, hasOrder: !!orderId })
    }

    componentWillUnmount() {
        clearTimeout(this.timer)
    }

    queryOrder = () => {
        const { orderId } = this.state;
        const { dispatch } = this.props;
        if (orderId) {
            return dispatch({
                type: 'commonOrder/queryDetail',
                payload: { id: orderId },
                toast: false
            }).then(res => {
                if (res && res.code === 200) {
                    if (res.data && res.data.policyNo) {
                        this.setState({ data: res.data })
                        return Promise.resolve(res.data);
                    }
                }
                return Promise.reject()
            })
        } else {
            return Promise.reject()
        }
    }

    queryOrderPolling = () => {
        this.setState({ count: this.state.count + 1 })
        return this.queryOrder()
            .then(() => {
                this.setState({ loadingSuccess: true });
                Toast.hide();
                clearTimeout(this.timer)
                // 自动上传
                setTimeout(() => {
                    this.props.trackStop(false);
                }, 1000)
            })
            .catch(() => {
                // 超过5次结束
                if (this.state.count >= 5) {
                    clearTimeout(this.timer)
                    this.setState({ count: 0 });
                    Toast.hide();
                    Modal.alert('', '保单信息还未生成，请稍后重试！', [{ text: '知道了' }])
                } else {
                    this.timer = setTimeout(this.queryOrderPolling, 2000)
                }
            })
    }

    toPaybacView = () => {
        Toast.loading("保单信息加载中，请等待！", 0)
        this.queryOrderPolling()
    }

    render() {
        const { hasOrder, data, loadingSuccess } = this.state;
        const { applicant = {}, insurants = [] } = data || {};

        return (
            <div className={styles.container}>
                <Success />
                <div className={styles.payback_content}>
                    {hasOrder ?
                        loadingSuccess ?
                            <div className={styles.payback_content}>
                                {data.annexUrl && data.annexUrl != '[]' ?
                                    <OSSFile files={data.annexUrl} customer={true}><div className={styles.policy_btn}>查看电子保单</div></OSSFile> :
                                    <div className={styles.policy_btn} onClick={() => {
                                        Toast.info('电子保单加载中，请等待！')
                                        setTimeout(this.queryOrder, 3000)
                                    }}>查看电子保单</div>
                                }
                                <div className={styles.policy_detail}>
                                    <header><span><img src={data.logoPath} /></span><span>{data.productName}</span></header>
                                    <div className={styles.payback_detail_content}>
                                        <p><span>保单号：</span><span>{data.policyNo}</span></p>
                                        <p><span>投保人：</span><span>{applicant.name}</span></p>
                                        {insurants.map(item => <p><span>被保人：</span><span>{item.name}</span></p>)}
                                        <p><span>承保时间：</span><span>{data.acceptDate}</span></p>
                                        <p><span>保费：</span><span className={styles.cost}>{data.premium}</span></p>
                                    </div>
                                </div>
                            </div> :
                            <div className={styles.policy_btn}
                                onClick={this.toPaybacView}
                            >查看保单信息</div>
                        : null
                    }
                </div>
            </div>
        );
    }
}

export default Index;
