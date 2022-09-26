/**
 * title: 待支付信息
 */
/**
 * 客户投保待支付页面 from:代理人分享
*/
import React, { Component } from 'react';
import { connect } from 'dva';
import { Toast } from 'antd-mobile';
import OrderContent from '@/pages/Order/components/ConfirmOrderContent';
import { setCustomerToken } from '@/utils/tool/customer';
import styles from '@/pages/Order/assets/order.less';
import iosnohistory from '@/utils/tool/iosnohistory';
import routerTrack from '@/components/routerTrack';

@routerTrack({ id: 'page32', autoStart: false })
@connect(({ commonOrder, loading }) => ({
  commonOrder,
  loading: loading.models.commonOrder
}))
class Bepaid extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { dispatch, location: { query, query: { purchaseOrderId } } } = this.props;
    Toast.loading('Loading...', 0)
    // 存储客户token
    setCustomerToken(query['blade-auth'])
    dispatch({
      type: 'commonOrder/queryDetail',
      payload: { id: purchaseOrderId }
    }).then(res => {
      if (res && res.code === 200) {
        const { tracebackCode } = res.data || {};
        this.props.trackStart(tracebackCode);
      }
    })
  }

  componentWillUnmount() {
  }

  pay = async() => {
    const { dispatch, location: { query } } = this.props;
    const toPayUrl = await dispatch({
      type: 'commonOrder/getPaymentLink',
      payload: { ...query }
    })
    this.props.trackStop()
    .then(() => {
      window.location.href = toPayUrl;
    })
  }

  render() {
    const { commonOrder: { detail = {} } } = this.props;

    return (
      <div className={styles.bepaid}>
        <OrderContent status={{ name: detail.purchaseOrderStatusName, value: detail.purchaseOrderStatus }} data={detail} />
        {detail.purchaseOrderStatus === 3 &&
          <footer style={{ height: `${iosnohistory() ? 1.8 : 1.2}rem` }}>
            <div className={styles.orderFlexFooter}>
              <div className={styles.cost}><span>￥</span>{detail.premium}</div>
              <div className={styles.pay} onClick={this.pay}>继续支付</div>
            </div>
          </footer>
        }
      </div>
    );
  }
}

export default Bepaid;
