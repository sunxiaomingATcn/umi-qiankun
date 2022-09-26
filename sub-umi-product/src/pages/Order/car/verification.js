/**
 * title: 验证码
*/

import React, { Component } from 'react';
import { connect } from 'dva';
import { Toast } from 'antd-mobile';
import styles from '../assets/verification.less';
import { history } from 'umi';
import routerTrack from '@/components/routerTrack';
import PPBLoading from '@/components/Loading/loading.js';

@routerTrack({ id: 'page-order-car-verify', autoStart: false })
@connect(({ carOrder, loading }) => ({
  carOrder,
  loading: loading.models.carOrder
}))
class verification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSending: false,
      phone: '',
      code: '',
      codeText: '获取验证码'
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (JSON.stringify(nextProps.carOrder.detail) !== JSON.stringify(prevState.detail)) {
      const { carOrder: { detail: { policyHolder = {} } = {} } } = nextProps;
      return {
        detail: nextProps.carOrder.detail,
        phone: policyHolder.supplyInfos?.find?.(item=>item.key === 'applicantMobile')?.value
      }
    }
    return null;
  }

  componentDidMount() {
    const { dispatch, location: { query: { orderId } } } = this.props;
    if (orderId) this.props.trackStart(orderId)
    dispatch({
      type: 'carOrder/queryDetail',
      payload: { orderId },
      role: 'agent'
    })
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }

  getCode = () => {
    const { phone } = this.state;
    if (this.state.isSending || this.state.disabled) {
      return false;
    }
    this.setState({ isSending: true })
    const { dispatch, location: { query: { orderId, payType } } } = this.props;
    dispatch({
      type: 'carOrder/sendCode',
      payload: {
        orderId,
        payType,
        phone
      }
    }).then(res => {
      this.setState({ isSending: false })
      if (res && res.code === 200) {
        this.setTime();
      }
    })
  }

  setTime = () => {
    let countdown = 60;
    this.setState({ codeText: countdown + 's获取', disabled: true });
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (countdown === 0) {
        this.setState({
          codeText: '重新获取',
          disabled: false
        });
        clearInterval(this.timer);
      } else {
        countdown--;
        this.setState({
          codeText: countdown + 's获取',
          disabled: true
        });
      }
    }, 1000);
  };

  validCode = () => {
    const { dispatch, location: { query: { orderId, payType } } } = this.props;
    const { phone, code } = this.state;
    if (!code) {
      Toast.info('请输入验证码', 2)
      return Promise.reject();
    }
    PPBLoading.show();
    return dispatch({
      type: 'carOrder/validCode',
      payload: {
        orderId,
        payType,
        phone,
        code
      }
    }).then(res => {
      PPBLoading.hide();
      return !!(res && res.code === 200)
    })
  }

  toPay = () => {
    const { location: { query: { orderId, payType } } } = this.props;
    this.validCode()
      .then(validCodeSuccess => {
        if (validCodeSuccess) {
          history.push(`/order/car/paycode?orderId=${orderId}&payType=${payType}`)
        }
      })
  }

  render() {
    const { carOrder: { detail: { policyHolder = {} } = {} } } = this.props;
    const { codeText, disabled, isSending,phone } = this.state;

    return (
      <div className={styles.verifyContainer}>
        <div className={styles.form}>
          <div className={styles.formItem}>
            <span>姓名</span>
            <a>{policyHolder.name}</a>
          </div>
          <div className={styles.formItem}>
            <span>手机号</span>
            <a>{phone && phone.replace(/(\d{3})\d*(\d{4})/, '$1****$2')}</a>
            <span className={styles.getCode} style={{ ...(isSending || disabled ? { color: '#BDBFBF' } : {}) }} onClick={this.getCode}>{codeText}</span>
          </div>
          <div className={styles.formItem}>
            <span>验证码</span>
            <input placeholder='请输入验证码' maxLength={6} value={this.state.code} onChange={({ target: { value } }) => this.setState({ code: value && value.replace(/[^\w\.\/]/ig, '').toLocaleUpperCase() })} />
          </div>
        </div>
        <footer>
          <div className={styles.toPay} onClick={this.toPay}>确认支付</div>
        </footer>

      </div>
    );
  }
}

export default verification;
