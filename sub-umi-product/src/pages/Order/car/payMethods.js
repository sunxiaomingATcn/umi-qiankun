/**
 * title: 支付方式
 */
import React, { Component } from 'react';
import { Checkbox, Toast } from 'antd-mobile';
import { connect } from 'dva';
import { history } from 'umi';
import routerTrack from '@/components/routerTrack';
import PPBLoading from '@/components/Loading/loading.js';
import styles from '../assets/payMethods.less';

@routerTrack({ id: 'page-order-car-payMethods', autoStart: false })
@connect(({ carOrder, loading }) => ({
  carOrder,
  loading: loading.models.carOrder
}))
class payMethods extends Component {
  constructor(props) {
    super(props);
    this.state = {
      payType: null,
      methodsData: []
    };
  }

  componentDidMount() {
    const { dispatch, location: { query: { orderId } } } = this.props;
    if (orderId) this.props.trackStart(orderId)
    dispatch({
      type: 'carOrder/getPayMethods',
      payload: { orderId }
    }).then(res => {
      if (res && res.code === 200) {
        this.setState({ payType: res.data?.[0], methodsData: res.data?.map(code => (this.methodsCheckbox.find(item => item.value === code))) })
      }
    })
  }

  toPay = () => {
    const { dispatch, location: { query: { orderId } } } = this.props;
    const { payType } = this.state;
    if (!payType) {
      Toast.info('请选择支付方式')
      return;
    }
    PPBLoading.show();
    dispatch({
      type: 'carOrder/getPayQRcode',
      payload: { orderId, payType: payType }
    }).then(res => {
      if (res && res.code === 200) {
        if (res.data && res.data.needCode) {
          history.push(`/order/car/verification?orderId=${orderId}&payType=${payType}`)
        } else {
          history.push(`/order/car/paycode?orderId=${orderId}&payType=${payType}`)
        }
      }
      PPBLoading.hide();
    })
  }
  // 支付方式
  methodsCheckbox = [
    {
      label: "支付宝支付",
      value: 'alipay',
      img: require('../assets/images/alipay.png')
    },
    {
      label: "微信支付",
      value: 'wechat',
      img: require('../assets/images/wechat.png')
    },
    {
      label: "聚合支付",
      value: 'aggregation',
      img: require('../assets/images/aggregation.png')
    }
  ]

  render() {
    const { payType, methodsData } = this.state;

    return (
      <div className={styles.payMethodsContainer}>
        <div className={styles.methodsCheckbox}>
          {methodsData && methodsData.map(item =>
            <p className={styles.payTypeItem}>
              <Checkbox checked={payType === item.value} onChange={({ target: { checked } }) => this.setState({ payType: checked ? item.value : null })}>
                <div className={styles.imgCon}><img src={item.img} /><span>{item.label}</span></div>
              </Checkbox>
            </p>)}
        </div>
        <footer>
          <div className={styles.toPay} onClick={this.toPay}>支  付</div>
        </footer>
      </div>
    );
  }
}

export default payMethods;
