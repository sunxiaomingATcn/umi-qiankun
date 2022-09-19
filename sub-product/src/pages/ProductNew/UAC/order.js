/**
 * title: 订单详情
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Toast } from 'antd-mobile';
import Collapse from '@/components/Collapse';
import styles from './assets/css/order.less';
import routerTrack from '@/components/routerTrack';
@routerTrack({ id: 'page34' })
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

  // 获取订单投保信息
  initData = () => {
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
    });
  };

  pay = async () => {
    const {
      location: {
        query: { purchaseOrderId },
      },
      commonOrder: { detail },
    } = this.props;
    const { quoteRestrictGenes = [] } = this.state;
    let toPayUrl = null;
    let params = {
      clientId: '1',
      productId: '2', //localStorage.product_id
      orderNo: purchaseOrderId,
      amount: detail && detail?.policyVO?.premium * 100,
      productTitles: [
        {
          title: '产品名称',
          desc: localStorage.ppb_visting_productName,
        },
        {
          title: '基本保额',
          desc: detail?.policyVO?.clauses[0].amount,
        },
        {
          title: '投保人姓名',
          desc: detail?.policyVO?.applicant.name,
        },
      ],
    };
    let payUrl = 'http://h.bedrock.chetimes.com';
    if (!(window.origin.includes('dev') || window.origin.includes('localhost'))) {
      payUrl = 'https://cc.chetimes.com';
      params.productId = '6';
    }
    let cmdString = JSON.stringify(params);
    console.log(cmdString);
    toPayUrl = `${payUrl}/pay-center/platform/redirectPayPage?cmdString=${cmdString}`;
    if (localStorage.getItem('uuid')) {
      if (toPayUrl) {
        this.props.trackStop().then(() => {
          window.location.href = toPayUrl;
        });
      }
    } else {
      window.location.href = toPayUrl;
    }
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
                <div className={styles.detailCard}>
                  <div className={styles.item}>
                    <span className={styles.name}>保障范围</span>
                    <span className={styles.value}>{item.clauseExtVO.guaranteeScope}</span>
                  </div>
                  <div className={styles.item}>
                    <span className={styles.name}>延保里程数</span>
                    <span className={styles.value}>
                      {item.clauseExtVO.extendedWarrantyKilometers}公里
                    </span>
                  </div>
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
        <Collapse title={`车辆信息`} defaultActive={true}>
          <div className={styles.detailCard}>
            <div className={styles.item}>
              <span className={styles.name}>车架号</span>
              <span className={styles.value}>
                {detail?.policyVO?.moPolicyExtInfo?.policyCarInfoVO?.vinCode}
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.name}>车牌号</span>
              <span className={styles.value}>
                {detail?.policyVO?.moPolicyExtInfo?.policyCarInfoVO?.carLicenseNo}
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.name}>发动机号</span>
              <span className={styles.value}>
                {detail?.policyVO?.moPolicyExtInfo?.policyCarInfoVO?.engineNo}
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.name}>使用性质</span>
              <span className={styles.value}>
                {detail?.policyVO?.moPolicyExtInfo?.policyCarInfoVO?.carProperty}
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.name}>品牌型号</span>
              <span className={styles.value}>
                {detail?.policyVO?.moPolicyExtInfo?.policyCarInfoVO?.standardFullName}
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.name}>初登日期</span>
              <span className={styles.value}>
                {detail?.policyVO?.moPolicyExtInfo?.policyCarInfoVO?.registDate}
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.name}>二手车成交价（万元）</span>
              <span className={styles.value}>
                {detail?.policyVO?.moPolicyExtInfo?.policyCarInfoVO?.fairMarketPrice / 10000}
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.name}>当前里程数（公里）</span>
              <span className={styles.value}>
                {detail?.policyVO?.moPolicyExtInfo?.policyCarInfoVO?.currentMileage}
              </span>
            </div>
          </div>
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
          </div>
        </Collapse>
        {detail?.status == 3 ? (
          <Fragment>
            <div style={{ height: '1rem' }} />
            <div className={styles.payment}>
              <div className={styles.premium}>保费：{detail?.policyVO?.premium}</div>
              <div>
                <Button type="primary" onClick={() => this.pay()}>
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
