/**
 * title: 分享支付
 */
/**
 * 代理人微信分享支付二维码link => 用于客户支付
*/
import React, { Component } from 'react';
import { connect } from 'dva';
import { Toast } from 'antd-mobile';
import { setCustomerToken } from '@/utils/tool/customer';
import QRCode from '@/utils/tool/QRCode';
import routerTrack from '@/components/routerTrack';
import styles from '../assets/order.less';

@routerTrack({ id: 'page-order-car-sharePay', autoStart: false })
@connect(({ carOrder, loading }) => ({
  carOrder,
  loading: loading.models.carOrder
}))
class Pending extends Component {
  constructor(props) {
    super(props);
    this.state = {
      qrAmount: null,
      qrCode: null
    };
  }

  componentDidMount() {
    const { dispatch, location: { query, query: { orderId, payType } } } = this.props;
    if (orderId) this.props.trackStart(orderId)
    // 存储客户token
    setCustomerToken(query['blade-auth'])
    dispatch({
      type: 'carOrder/queryDetail',
      payload: { orderId },
      toast: false,
      role: 'customer'
    })
    dispatch({
      type: 'carOrder/getPayQRcode',
      payload: { orderId, payType }
    }).then(async res => {
      if (res && res.code === 200) {
        this.setState({
          qrAmount: res.data.amount,
          qrCode: res.data.needToQrCode ? await QRCode(res.data.url) : res.data.url
        })
      }
    })
  }

  render() {
    const { qrAmount, qrCode } = this.state;
    const { carOrder: { detail, detail: { order = {}, car = {}, policy = {}, risks: { bizSuiteInfo = {}, bizSuiteInfo: { suites = [] } = {}, efcSuiteInfo = {}, taxSuiteInfo = {} } = {} } } } = this.props;

    return (
      <div className={[styles.orderContent, styles.carOrderContent].join(' ')}>
        <div className={styles.orderTitle}>
          <div className={styles.orderBriefly}>
            <img src={policy.icLogo} />
            <span className={styles.orderBrieflyCom}>{policy.icName}</span>
            <span className={styles.orderBrieflyPrice}>¥ {detail.totalPremium}</span>
          </div>
          <p className={styles.orderTitleDes}>支付有效期：请于 {order.effectiveTime} 之前支付</p>
          <p className={styles.toOwner}>尊敬的{car.carLicenseNo}车主，您的车险报价单如下：</p>
        </div>
        <div className={[styles.detailCard, styles.detailHeadersCard].join(" ")}>
          <header className={styles.flexHeader}><span>品牌型号</span><span>{car.standardFullName}</span></header>
          <header className={styles.flexHeader}><span>车型</span><span>{car.modelStr}</span></header>
          <header className={styles.flexHeader}><span>交强险起保日期</span><span>{policy.jqStartDate}</span></header>
          <header className={styles.flexHeader}><span>商业险起保日期</span><span>{policy.syStartDate}</span></header>
        </div>
        <div className={styles.detailCard}>
          <header className={styles.flexHeader}><span>交强险</span><span className={styles.price}>¥ {efcSuiteInfo && efcSuiteInfo.discountCharge || 0}</span></header>
          <div className={styles.item}><span className={styles.name}>交强险</span><span className={styles.value}>¥ {efcSuiteInfo && efcSuiteInfo.discountCharge}</span></div>
          <div className={styles.item}><span className={styles.name}>车船税</span><span className={styles.value}>¥ {taxSuiteInfo && taxSuiteInfo.charge}</span></div>
        </div>
        <div className={styles.detailCard}>
          <header className={styles.flexHeader}><span>商业险</span><span className={styles.price}>¥ {bizSuiteInfo && bizSuiteInfo.discountCharge || 0}</span></header>
          {suites && suites.map(item => <div className={styles.item}><span className={styles.name}>{item.name}{item.showAmount && `（${item.showAmount}）`}</span><span className={styles.value}>¥ {item.discountCharge}</span></div>)}
        </div>
        <div className={styles.detailCard}>
          <header className={styles.flexHeader}><span>保费总金额</span><span className={styles.price}>¥ {qrAmount}</span></header>
          <div className={styles.payCode}><img src={qrCode || require('../assets/images/QRerror.png')} /></div>
        </div>
      </div>
    );
  }
}

export default Pending;
