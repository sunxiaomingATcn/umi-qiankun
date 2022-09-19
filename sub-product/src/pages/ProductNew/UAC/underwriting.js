/**
 * title: 核保中
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import TracBacks from '@/utils/trackBacks';
import styles from './assets/css/index.less';
import { Toast } from 'antd-mobile';
import { history } from 'umi';
import routerTrack from '@/components/routerTrack';


@routerTrack({ id: 'page33' })

@connect(({ commonOrder, loading }) => ({
  commonOrder,
  loading: loading.models.commonOrder,
}))
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { query } = this.props.location;
    if(query['blade-auth'])
    localStorage.setItem('customer-blade-auth',query['blade-auth'])
    this.initData();
  }

  // 获取订单投保信息
  initData = (isRefresh = false) => {
    const {
      location: {
        query: { purchaseOrderId },
      },
      dispatch,
    } = this.props;
    Toast.loading('Loading...', 0);
    dispatch({
      type: 'commonOrder/queryOrderDetail',
      payload: { policyId: purchaseOrderId },
    }).then(res => {
      if (res && res.code == 0) {
        if (res.payload.status && res.payload.status !== 1) {
          this.orderDetail();
        } else {
          if (isRefresh) {
            Toast.info('刷新成功');
          }
        }
      }
    });
  };

  orderDetail = () => {
    const { query } = this.props.location;
    history.push({
      pathname: '/ProductNew/UAC/order',
      query: {
        ...query,
      },
    });
  };

  render() {
    const {
      commonOrder: { detail, detail: { applicant = {} } = {} },
    } = this.props;
    return (
      <div className={styles.underwriting}>
        <div className={styles.infoItem}>
          <div>订单号</div>
          <div>{detail?.purchaseOrderNo}</div>
        </div>
        <div className={styles.line} />
        <div className={styles.infoItem}>
          <div>产品名称</div>
          <div>{localStorage.ppb_visting_productName}</div>
        </div>
        <div className={styles.line} />
        <div className={styles.infoItem}>
          <div>投保人</div>
          <div>{detail?.policyVO?.applicant?.name}</div>
        </div>
        <div className={styles.line} />
        <div className={styles.infoItem}>
          <div>总价</div>
          <div>{detail.policyVO?.premium}元</div>
        </div>
        <div className={styles.line} />
        <button
          className={styles.orderView}
          onClick={() => {
            this.orderDetail();
          }}
        >
          查看订单
        </button>
        <div className={styles.toast}>
          <div>人工核保中···</div>
          <button
            className={styles.refresh}
            onClick={() => {
              this.initData(true);
            }}
          >
            刷新
          </button>
        </div>
      </div>
    );
  }
}

export default Index;
