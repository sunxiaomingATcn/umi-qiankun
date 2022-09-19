/**
 * title: 客户资料
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal } from 'antd-mobile';
import { history } from 'umi';
import PPBLoading from '@/components/Loading/loading.js';
import styles from './assets/css/policy.less';

@connect(({ customer }) => ({
  customer,
}))
class policy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      polices: [],
      emptyPolicy: false
    };
  }

  async componentDidMount() {
    const {
      dispatch,
      location: { query: { id } },
    } = this.props;
    if (id) {
      PPBLoading.show()
      await dispatch({
        type: 'customer/queryCustomerDetail',
        payload: { id },
      }).then(res => {
        if (res && res.code === 200) this.setState({ data: res.data })
      })
      await dispatch({
        type: 'customer/queryCustomerPolicyList',
        payload: { id }
      }).then(res => {
        if (res && res.code === 200) this.setState({ polices: res.data, emptyPolicy: !!(res.data == 0) })
      })
      PPBLoading.hide();
    }
  }

  /**
   * 订单 or 保单
   * policyAndOrderType 1：车险  2：非车险  3：人身险
   * policyOrOrder 1：保单 2：订单
   * */
  renderListItem = (item) => {
    // 默认值（非车险）
    let params = {
      link: null,
      statusName: item.policyOrOrder === 1 ? item.policyStatusName : item.orderStatusName,
      title: item.policyAndOrderType === 1 ? item.insuranceCompanyShortName : item.productName,
      content: [
        { name: "投保人", value: item.applicant?.name },
        { name: "被保人", value: item.insurants?.[0]?.name },
        { name: "出单人", value: item.salepersonRealName },
        { name: "投保时间", value: item.insureTime },
        { name: "保费", price: true, value: item.premium }
      ]
    };
    switch (`${item.policyAndOrderType}_${item.policyOrOrder}`) {
      case '1_1':
      case '1_2':
        params = {
          ...params,
          link: item.policyOrOrder === 1 ?
            `/order/car/policy?policyId=${item.policyId}` :
            `/order/car/detail?orderId=${item.orderId}`,
          content: [
            { name: "车牌号", value: item.carLicenseNo },
            { name: "车主", value: item.carOwner?.name },
            { name: "被保人", value: item.insurants?.[0]?.name },
            { name: "录单时间", value: item.createTime },
            { name: `保&nbsp;&nbsp;&nbsp;&nbsp;费`, price: true, value: item.premium }
          ]
        }
        break;
      case '3_1':
      case '3_2':
        params = {
          ...params,
          link: item.policyOrOrder === 1 ?
            `/order/life/detail?policyId=${item.policyId}` :
            `/order/life/pending?purchaseOrderId=${item.orderId}`,
        }
        break;
      default:
        break;
    }

    return <div className={styles.listItem}>
      <a onClick={() => params.link && history.push(params.link)}>
        <div className={styles.listItemHeader}>
          <div className={styles.insuranceCompanyName}>
            <img src={item.logoPath} />
            <span>{params.title}</span>
          </div>
          <div
            className={[
              styles.statusName,
              styles[`statusColor${params.statusName}`]
            ].join(" ")}
          >{params.statusName}
          </div>
        </div>
        <div className={styles.listItemContent}>
          {params.content.map(item =>
            <div>
              <span dangerouslySetInnerHTML={{ __html: item.name }}></span>：
              <span className={styles.ellipsis}>{item.price ? <span className={styles.yuan}>￥<b>{item.value}</b></span> : item.value}</span>
            </div>)}
        </div>
      </a>
    </div>
  }

  render() {
    const { data, polices, emptyPolicy } = this.state;
    return (
      <div className={styles.customerPolicy}>
        <div className={styles.header}>
          <div className={styles.head}>{data.name?.substring(data.name.length - 2)}</div>
          <div className={styles.info}>
            <div className={styles.name}>{data.name}</div>
            <div className={styles.tel}>电话：{data.mobile}</div>
            <div className={styles.birth}>生日：{data.birthday}</div>
          </div>
          {data.mobile && <div className={styles.callBox}>
            <div className={styles.call} onClick={() => this.setState({ callout: true })}>
              <i><img src={require('./assets/image/tel_bg.png')} /></i><span>呼叫</span>
            </div>
          </div>}
        </div>
        <div className={styles.list}>
          <div className={styles.order_noncar_scroll_content}>
            <>
              {polices.map(item => this.renderListItem(item))}
            </>
          </div>
          {emptyPolicy && <p className={styles.nodata}>
            <img src={require('@/assets/empty.png')} />
            <p>暂无数据</p>
          </p>}
        </div>
        <Modal
          popup
          visible={this.state.callout}
          animationType="slide-up"
        >
          <a href={`tel:${data.mobile}`} className={styles.callout}>
            <img src={require('./assets/image/tel.png')} />
            <p><>呼叫 {data.mobile?.substring(0, 3)}&nbsp;{data.mobile?.substring(3, 7)}&nbsp;{data.mobile?.substring(7)}</></p>
          </a>
          <div className={styles.cancel} onClick={() => { this.setState({ callout: false }) }}>取消</div>
        </Modal>
      </div>
    );
  }
}

export default policy;
