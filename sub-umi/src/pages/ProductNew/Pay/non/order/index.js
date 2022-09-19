/**
 * title: 订单详情
 */
/***
 * 非车险产品 =>订单详情页面(去支付)
 * 众惠疫保通
*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Toast } from 'antd-mobile';
import Collapse from '@/components/Collapse';
import routerTrack from '@/components/routerTrack';
import miniProgramPays from '@/utils/miniProgramPays';
import styles from './assets/css/order.less';

@routerTrack({ id: 'page34', autoStart: false })
@connect(({ commonOrder, loading }) => ({
  commonOrder,
  loading: loading.models.commonOrder,
}))
class detail extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.initData();
  }

  // 保单id获取订单&保单信息
  initData = () => {
    const { location: { query: { policyId, purchaseOrderId } }, dispatch } = this.props;
    this.setState({ policyId: policyId || purchaseOrderId },
      () => {
        const { policyId } = this.state;
        Toast.loading('Loading...', 0);
        dispatch({
          type: 'commonOrder/queryOrderDetail',
          payload: { policyId },
        }).then(res => {
          if (res && res.code === 0) {
            const { tracebackCode } = res.payload || {};
            this.props.trackStart(tracebackCode || policyId);
          }
        });
      })
  };

  // 去支付
  pay = async () => {
    const { dispatch } = this.props;
    const { policyId } = this.state;
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
    const {
      commonOrder: { detail },
    } = this.props;
    return (
      <div className={styles.detailContainer}>
        <div className={styles.orderNo}>
          <div>订单号：{detail?.purchaseOrderNo}</div>
          <div>
            {detail?.status == 1 ? '核保中' : ''}
            {detail?.status == 2 ? `核保未通过 失败原因：${detail?.policyVO?.remark}` : ''}
            {detail?.status == 3 ? '待支付' : ''}
          </div>
        </div>
        <Collapse title={`产品信息`} defaultActive={true}>
          {detail &&
            detail?.policyVO?.clauses?.map((item, index) => {
              return (
                <div className={styles.detailCard} key={index}>
                  <div className={styles.item}>
                    <span className={styles.name}>基本保额</span>
                    <span className={styles.value}>{item.amount}元</span>
                  </div>
                  <div className={styles.item}>
                    <span className={styles.name}>保费</span>
                    <span className={styles.value}>{detail?.policyVO?.premium}元</span>
                  </div>
                </div>
              );
            })}
        </Collapse>
        <Collapse title={`投保人信息`} defaultActive={true}>
          <div className={styles.detailCard}>
            <div className={styles.item}>
              <span className={styles.name}>姓名</span>
              <span className={styles.value}>{detail?.policyVO?.applicant?.name}</span>
            </div>
            <div className={styles.item}>
              <span className={styles.name}>证件类型</span>
              <span className={styles.value}>{detail?.policyVO?.applicant?.identityVO?.name}</span>
            </div>
            <div className={styles.item}>
              <span className={styles.name}>证件号码</span>
              <span className={styles.value}>{detail?.policyVO?.applicant?.identityVO?.value}</span>
            </div>
            <div className={styles.item}>
              <span className={styles.name}>手机号码</span>
              <span className={styles.value}>{detail?.policyVO?.applicant?.mobile}</span>
            </div>
            <div className={styles.item}>
              <span className={styles.name}>邮箱</span>
              <span className={styles.value}>{detail?.policyVO?.applicant?.email}</span>
            </div>
          </div>
        </Collapse>
        <Collapse title={`被保险人信息`} defaultActive={true}>
          <div className={styles.detailCard}>
            <div className={styles.item}>
              <span className={styles.name}>与投保人关系</span>
              <span className={styles.value}>{detail?.policyVO?.insurants[0]?.relationName}</span>
            </div>
            <div className={styles.item}>
              <span className={styles.name}>姓名</span>
              <span className={styles.value}>{detail?.policyVO?.insurants[0]?.name}</span>
            </div>
            <div className={styles.item}>
              <span className={styles.name}>证件类型</span>
              <span className={styles.value}>
                {detail?.policyVO?.insurants[0]?.identityVO?.name}
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.name}>证件号码</span>
              <span className={styles.value}>
                {detail?.policyVO?.insurants[0]?.identityVO?.value}
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.name}>手机号码</span>
              <span className={styles.value}>{detail?.policyVO?.insurants[0]?.mobile}</span>
            </div>
            <div className={styles.item}>
              <span className={styles.name}>邮箱</span>
              <span className={styles.value}>{detail?.policyVO?.insurants[0]?.email}</span>
            </div>
          </div>
        </Collapse>
        {detail?.status == 3 ? (
          <Fragment>
            <div style={{ height: '1.2rem' }} />
            <div className={styles.payment}>
              <div className={styles.premium}>保费：{detail?.policyVO?.premium}</div>
              <div>
                <Button type="primary" className={styles.payBtn} onClick={() => this.pay()}>
                  去支付
                </Button>
              </div>
            </div>
          </Fragment>
        ) : (
          ''
        )}
      </div>
    );
  }
}

export default detail;
