/**
 * title: 支付二维码
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Toast } from 'antd-mobile';
import getUserWorkId, { getAgentInfo } from '@/utils/tool/agentInfo';
import ShareGuide from '@/components/ShareGuide';
import WxSDK from "@/utils/wx-sdk";
import QRCode from '@/utils/tool/QRCode';
import { history } from 'umi';
import routerTrack from '@/components/routerTrack';
import PPBLoading from '@/components/Loading/loading.js';
import styles from '../assets/paycode.less';

@routerTrack({ id: 'page-order-car-payCode', autoStart: false })
@connect(({ carOrder, loading }) => ({
  carOrder,
  loading: loading.models.carOrder
}))
class PayCode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      QRSuccess: true,
      qrData: {}
    };
  }

  visibilitychange = () => {

  }
  componentDidMount() {
    this.getQRcode();
    this.initWXshare();
  }

  getQRcode = (type) => {
    if (type === 'retrieve') this.setState({ qrCode: null })
    const { dispatch, location: { query: { orderId, payType } } } = this.props;
    if (orderId) this.props.trackStart(orderId)
    PPBLoading.show()
    dispatch({
      type: 'carOrder/getPayQRcode',
      payload: { orderId, payType, isRetry: type === 'retrieve' ? 1 : undefined }
    }).then(async res => {
      if (res && res.code === 200) {
        if (res.data && res.data.needCode) {
          history.push(`/order/car/verification?orderId=${orderId}&payType=${payType}`);
          return;
        }
        this.setState({
          qrAmount: res.data.amount,
          qrCode: res.data.needToQrCode ? await QRCode(res.data.url) : res.data.url,
          qrData: res.data
        })
        if (type === 'retrieve') {
          Toast.info("获取成功")
        } else {
        }
      }
      PPBLoading.hide();
      this.setState({ QRSuccess: res && res.code === 200 })
    })
  }

  initWXshare = () => {
    const { dispatch, location: { search, query: { orderId } } } = this.props;
    if (orderId) this.props.trackStart(orderId)
    dispatch({
      type: 'carOrder/queryDetail',
      payload: { orderId },
      role: 'agent'
    }).then(res => {
      if (res && res.code === 200) {
        const { policy: { icName, icLogo } = {}, car: { carLicenseNo } = {} } = res.data || {};
        WxSDK.share({
          title: `${icName}订单`,
          desc: ` 尊敬的${carLicenseNo}车主，您的待支付订单如下，请尽快支付`,
          link: `${window.location.origin}/#/order/car/sharePayment${search}`,
          imgUrl: icLogo,
        })
      }
    })
  }

  getPayStatus = () => {
    const { dispatch, location: { query: { orderId } } } = this.props;
    dispatch({
      type: 'carOrder/getPayStatus',
      payload: { orderId },
      role: 'agent'
    }).then(res => {
      if (res && res.code === 200) {
        if (res.data) {
          history.push(`/order/car/detail?orderId=${orderId}`)
        } else {
          Toast.info('未支付完成')
        }
      }
    })
  }

  toPay = () => {
    const { location: { query: { orderId } } } = this.props;
    history.push(`/order/car/payMethods?orderId=${orderId}`)
  }

  render() {
    const { QRSuccess, qrData, qrAmount, qrCode } = this.state;

    return (
      <div className={styles.payCodeContainer}>
        <div className={styles.payQrCode}>
          <img src={QRSuccess ? qrCode : require('../assets/images/QRerror.png')} />
          <div className={styles.retrieveQRCode} onClick={() => this.getQRcode('retrieve')}>重新获取二维码</div>
          {QRSuccess ?
            <div className={styles.qrContent}>
              <p>支付方式：{qrData.payModeStr}</p>
              <p>车牌号码：{qrData.carLicenseNo}</p>
              <p>支付金额：<span className={styles.price}>¥{qrAmount}</span></p>
            </div> :
            <p className={styles.QRError}>该支付方式暂无法使用<br />请稍后再试或者更换其他支付方式</p>
          }
        </div>
        {QRSuccess && <p className={styles.tips}>
          <p>请扫一扫或长按识别二维码进行支付</p>
          <p>温馨提示：支付后请确认是否支付以启动缴费查询</p>
        </p>}
        <footer>
          <div className={[styles.footerBtn, styles.gradualChange].join(' ')} onClick={this.toPay}>选择其他支付方式</div>
          {QRSuccess && <div className={styles.footerBtn} onClick={() => ShareGuide.open()}>分享给好友</div>}
          {/* <div className={styles.complete}>如已支付完成，请点击 <span onClick={this.getPayStatus}>支付成功</span></div> */}
        </footer>
      </div>
    );
  }
}

export default PayCode;
