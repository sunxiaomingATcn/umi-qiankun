/**
 * title: 承保完成
 */
/**
 * 非车产品承保完成
 * query { policyId }
 *
 * 产品
 * 全民疫保通（经典版）
*/
import React, { Component } from 'react';
import { connect } from 'dva';
import { Toast } from 'antd-mobile';
import { history } from 'umi';
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
        this.state = {
            detail: {},
        }
    }

    componentDidMount() {
        Toast.loading('正在查询保单，请稍等', 0);
        this.queryDetail()
    }

    queryDetail = () => {
        const { location: { query: { policyId } }, dispatch } = this.props;
        dispatch({
            type: 'commonOrder/queryPolicyDetail',
            payload: { policyId },
            toast: false
        }).then(res => {
            if (res && res.code == 0) {
                if (res.payload.policyNo) {
                    this.props.trackStop(false);
                    this.setState({
                        detail: {
                            ...res.payload,
                            productName: res.payload.productName || localStorage.ppb_visting_productName,
                        },
                        policyId: res.payload.id
                    }, () => {
                        Toast.hide();
                    })
                } else {
                    setTimeout(() => {
                        this.queryDetail()
                    }, 1000);
                }
            }
        })
    }

    toOrder = () => {
        const { policyId } = this.state;
        if (policyId) {
            history.push(`/productNew/pay/non/order?policyId=${policyId}`)
        }
    }

    render() {
        const { detail, detail: { applicant = {} } = {}, policyId } = this.state;
        return (
            <div className={styles.payback_detail}>
                <div className={styles.result}>
                    <img src={require(`@/assets/icon/paysuccess.png`)} alt="" />
                    <p>恭喜您，支付成功</p>
                </div>
                <div className={styles.order_detail}>
                    <div className={styles.order_item}><span>保单号</span><span>{detail.policyNo}</span></div>
                    <div className={styles.order_item}><span>产品</span><span>{detail.productName}</span></div>
                    <div className={styles.order_item}><span>保费</span><span>{detail.premium}</span></div>
                    <div className={styles.order_item}><span>投保人</span><span>{applicant.name}</span></div>
                </div>
                {policyId && <div className={styles.footer}><div className={styles.button} onClick={this.toOrder}>查看订单</div></div>}
            </div>
        );
    }
}

export default Index;
