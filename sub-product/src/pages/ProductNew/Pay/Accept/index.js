/**
 * title: 承保完成
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Toast } from 'antd-mobile';
import routerTrack from '@/components/routerTrack';
import styles from './index.scss';

@routerTrack({ id: 'page40' })
@connect(({ commonOrder, loading }) => ({
    commonOrder,
    loading: loading.models.commonOrder
}))
class Index extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const { location: { query: { orderId } }, dispatch } = this.props;
        Toast.loading('Loading...', 0);
        dispatch({
            type: 'commonOrder/queryDetail',
            payload: { id: orderId }
        }).then(res => {
            this.props.trackStop(false);
        })
    }

    componentWillUnmount() {
    }

    render() {
        const success = true;
        const { commonOrder: { detail, detail: { applicant = {}, insurants = [] } = {} }, location: { query: { plan } } } = this.props;

        return (
            <div className={styles.payback_detail}>
                <div className={styles.result}>
                    <img src={require(`@/assets/icon/${success ? 'paysuccess' : 'fail'}.svg`)} alt="" />
                    <p>承保完成</p>
                </div>
                <div className={styles.order_detail}>
                    <div className={styles.order_item}><span>产品</span><span>{detail.productName}</span></div>
                    <div className={styles.order_item}><span>保障计划</span><span>{plan}</span></div>
                    <div className={styles.order_item}><span>投保人</span><span>{applicant.name}</span></div>
                    <div className={styles.order_item}><span>被保人</span><span>{insurants && insurants.map(item => item.name).join(',')}</span></div>
                    <div className={styles.order_item}><span>支付金额</span><span>{detail.premium}元</span></div>
                </div>
            </div>
        );
    }
}

export default Index;
