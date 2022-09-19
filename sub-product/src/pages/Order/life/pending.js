/**
 * title: 待支付信息
 */
/**
 * 代理人 待处理订单详情/待支付页面 => 用于转发给客户
*/
import React, { Component } from 'react';
import { connect } from 'dva';
import { Toast, Modal } from 'antd-mobile';
import WxSDK from "@/utils/wx-sdk";
import getUserWorkId, { getAgentInfo } from '@/utils/tool/agentInfo';
import OrderContent from '../components/OrderContent';
import ShareGuide from '@/components/ShareGuide';
import styles from '../assets/order.less';
import PPBLoading from '@/components/Loading/loading.js';

@connect(({ commonOrder, loading }) => ({
  commonOrder,
  loading: loading.models.commonOrder
}))
class Pending extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.queryDetail();
  }

  queryDetail = () => {
    const { dispatch, location: { query: { purchaseOrderId } } } = this.props;
    PPBLoading.show();
    dispatch({
      type: 'commonOrder/queryDetail',
      payload: { id: purchaseOrderId },
      role: 'agent'
    }).then(res => {
      PPBLoading.hide();
      if (res && res.code === 200) {
        this.initWXshare(res.data)
        if (res.data.purchaseOrderStatus != 3) document.title = '订单详情';
      }
    })
  }

  initWXshare = (data) => {
    // 微信分享出去link（给用户） 分享授权接口 authUrl?tenant=&callback=/productnew/insured/bepaid;
    const { location: { search } } = this.props;
    const userWorkId = getUserWorkId();
    const { tenantId } = getAgentInfo();
    console.log("代理人id", userWorkId, search)
    WxSDK.share({
      title: `【待支付】${data.applicant ? data.applicant.name : ''}`,
      desc: `您的${data.productName}订单已生成，可点击本链接完成支付。`,
      link: `${window.location.origin}/blade-auth/authUrl?tenantId=${tenantId}&url=${encodeURIComponent(`${window.location.origin}/#/productnew/insured/bepaid${search}`)}`,
      imgUrl: '/wx/images/bepaid.png',
    })
  }

  closeOk = () => {
    const { dispatch, location: { query: { purchaseOrderId: orderId } } } = this.props;
    this.setState({ closeModalVisible: false })
    PPBLoading.show();
    dispatch({
      type: 'commonOrder/closeOrder',
      payload: { id: orderId }
    }).then(res => {
      if (res && res.code === 200) {
        this.queryDetail();
      }
      PPBLoading.hide();
    })
  }

  render() {
    const { commonOrder: { detail = {} } } = this.props;
    const { closeModalVisible } = this.state;

    return (
      <div className={styles.order_detail_pending}>
        <Modal
          visible={closeModalVisible}
          transparent
          className={styles.modalContainer}
          style={{ width: '5.5rem', padding: 0 }}
        >
          <div className={styles.modal}>
            <div className={styles.modalContentHeader}>确定关闭当前订单？</div>
            <div className={styles.modalContentButtons}>
              <div onClick={() => this.setState({ closeModalVisible: false })}>否</div>
              <div onClick={this.closeOk}>是</div>
            </div>
          </div>
        </Modal>
        <div className={styles.orderNo}><span>订单号</span><span>{detail.purchaseOrderNo}</span></div>
        <OrderContent status={{ name: detail.purchaseOrderStatusName, value: detail.purchaseOrderStatus }} data={detail} />
        {([1, 3].includes(detail.purchaseOrderStatus)) &&
          <footer>
            <div className={styles.flexFooter}>
              <div className={styles.footerBtn} onClick={() => this.setState({ closeModalVisible: true })}>关闭订单</div>
              {detail.purchaseOrderStatus === 3 && <div className={[styles.footerBtn, styles.gradualChange].join(" ")} style={{ flex: 2 }} onClick={() => ShareGuide.open()}>转给客户</div>}
            </div>
          </footer>
        }
      </div>
    );
  }
}

export default Pending;