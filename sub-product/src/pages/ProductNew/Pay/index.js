/**
 * title: 支付详情
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import styles from './index.scss';
import { Toast } from "antd-mobile";
import { history } from 'umi';;

import Utils from '@/utils/utils';
import { payFixPrice } from '../assets/productConfig/judgeProductFeature';
@connect(({ pay, loading, productNew }) => ({
    pay,
    productNew,
    loading: loading.models.pay,
}))
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            index: 0,
        }
    }

    componentDidMount() {
        const { location } = this.props;
        let channel = localStorage.getItem('channel')
        Utils.collectBaiduHm(`阿保收银台_曝光_进入阿保收银台_${localStorage.getItem('product_id')}_${channel ? channel : ""}`, "open")
        const token = localStorage.getItem('token');
        const { dispatch } = this.props;
        dispatch({
            type: 'pay/queryPaymentChannel',
            payload: {
                id: this.props.location.query.id,
                token
            }
        })

    }

    pay = () => {
        const { location } = this.props;
        let channel = localStorage.getItem('channel')
        Utils.collectBaiduHm(`阿保收银台_按钮_拉起支付_${localStorage.getItem('product_id')}_${channel ? channel : ""}`, "click")
        Toast.loading('Loading...', 0);
        const token = localStorage.getItem('token');
        const { dispatch } = this.props;
        const { pay: { paymentChannel } } = this.props;
        if (paymentChannel && paymentChannel.length > 0) {
            const { code } = paymentChannel[this.state.index];
            const { id, quoteRecordId, orderNo, purchaseOrderId } = this.props.location.query;
            const params = {
                orderNo,
                productId: +id,
                purchaseOrderId,
                quoteRecordId,
            };
            if (code === 'thirdPartyPay') {
                dispatch({
                    type: 'pay/thirdPartPaymentInfo',
                    payload: {
                        params: { ...params, inWx: Utils.isWeiXin() ? 1 : 0 },
                        token
                    }
                }).then((res) => {
                    Toast.hide();
                    const { code, message, payload } = res;
                    if (code === 0) {
                        window.location.href = payload.gatewayUrl;
                    } else {
                        Toast.fail(message, 2);
                        return false;
                    }
                });
            } else {
                dispatch({
                    type: 'pay/paymentInfo',
                    payload: {
                        params,
                        token
                    }
                }).then((res) => {
                    Toast.hide();
                    const { code, message, payload } = res;
                    if (code === 0) {
                        window.location.href = payload.paymentSignUrl.signLink;
                    } else {
                        Toast.fail(message, 2);
                        return false;
                    }
                })
            }
        } else {
            Toast.info('请选择支付方式')
        }
    };


    render() {
        // console.log(this.props);
        let { index } = this.state;
        const { pay: { paymentChannel } } = this.props;
        const { name } = this.props.location.query;
        const saleName = localStorage.getItem('saleName');
        const premium = localStorage.getItem('premium');
        let channel = localStorage.getItem('channel')
        channel = channel ? { channel } : {}
        return (
            <div className='container'>
                <section className={styles.content}>
                    <div className={styles.payment}>
                        <div className={styles.payment_header}>
                            <div className={[styles.payment_title, 'flex-r-bc'].join(' ')}>
                                <h3>{saleName}</h3>
                                <div className={styles.pay_mount}><span>￥</span>{payFixPrice() || premium}
                                </div>
                            </div>
                            <div className={[styles.payment_detial_container, 'flex-r-bc'].join(' ')}>
                                <div className={styles.payment_detial}>
                                    <div className={styles.payment_detial_item}>
                                        被保险人：{name}
                                    </div>
                                    <div>
                                        份数：1份
                                    </div>
                                </div>
                                {
                                    !saleName.includes("臻爱无限") && <div>
                                        <img onClick={() => {
                                            history.push({
                                                pathname: '/ProductNew/ProductDetail',
                                                query: {
                                                    orderNo: this.props.location.query.orderNo,
                                                    ...channel
                                                }
                                            })
                                        }} width="0.18rem" src={require("../images/arrow.svg")}></img>
                                    </div>
                                }

                            </div>
                        </div>
                        <div className={[styles.payment_item, 'flex-r-bc'].join(' ')}>
                            <div className={styles.grey}>
                                保单形式
                            </div>
                            <span>电子保单</span>
                        </div>
                        <div className={[styles.payment_item, 'flex-r-bc'].join(' ')}>
                            <div>
                                共1份保单
                            </div>
                            <div className={['flex-r-bc'].join(' ')}>
                                共计：
                                <div className={styles.pay_mount}><span>￥</span>{payFixPrice() || premium}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.payment_mode}>
                        <h3 className={styles.payment_mode_title}>
                            支付方式
                        </h3>
                        <ul className={styles.pay_link_container}>
                            {
                                paymentChannel.length > 0 && paymentChannel.map((item, key) => {
                                    return <li className={[styles.pay_link, 'flex-r-bc'].join(' ')} key={key}>
                                        <div className={styles.pay_link_title}>
                                            <img src={item.logo} alt="" />
                                            <span>{item.name}</span>
                                        </div>
                                        <div
                                            className={[styles.check_btn, index == key ? styles.checked : '', 'flex-r-bc'].join(' ')}
                                            onClick={() => this.setState({ index: key })} />
                                    </li>
                                })
                            }
                        </ul>
                    </div>
                </section>
                <footer className={styles.footer}>
                    <div className={[styles.btn_flex, styles.insured_amount].join(' ')}>
                        <span>￥</span>{payFixPrice() || premium}</div>
                    <button className={[styles.btn_flex, 'btn-primary'].join(' ')} onClick={() => this.pay()}>立即投保
                    </button>
                </footer>
            </div>
        );
    }
}

export default Index;
