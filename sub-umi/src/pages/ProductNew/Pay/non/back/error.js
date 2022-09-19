/**
 * title: 支付失败
 */
/**
 * 链接需要policyId,再次拉起支付需要policyId
*/
import React, { Component } from 'react';
import { Toast } from 'antd-mobile';
import { connect } from 'dva';
import routerTrack from '@/components/routerTrack';
import miniProgramPays from '@/utils/miniProgramPays';
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

  pay = async () => {
    const { location: { query: { policyId } }, dispatch } = this.props;
    if (!policyId) {
      Toast.fail('policyId不存在')
      return;
    }
    const toPayUrl = await dispatch({
      type: 'commonOrder/getPaymentLink',
      payload: { orderId: policyId, type: 1 }
    })
    if (!toPayUrl) return;
    this.props.trackStop()
      .then(() => {
        miniProgramPays(toPayUrl);
      })
  };

  render() {
    return (
      <div className={styles.payback_detail}>
        <div className={styles.error}>
          <img src={require(`@/assets/icon/fail.png`)} alt="" />
          <p className={[styles.payback_detail_msg, styles.fail].join(' ')}>抱歉，支付失败</p>
        </div>
        <div className={styles.footer}><div className={styles.button} onClick={this.pay}>再次支付</div></div>
      </div>
    );
  }
}

export default Index;
