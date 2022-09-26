/**
 * title: 订单详情
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Toast, Modal } from 'antd-mobile';
import { history } from 'umi';
import { setCustomerToken } from '@/utils/tool/customer';
import CarDetailBasic from '../car/CarDetail/basic';
import CarDetailInsurance from '../car/CarDetail/insurance';
import CarDetailImages from '../car/CarDetail/images';
import routerTrack from '@/components/routerTrack';
import PPBLoading from '@/components/Loading/loading.js';
import styles from '../assets/detail.less';
@routerTrack({ id: 'page-order-car-detail', autoStart: false })
@connect(({ carOrder, loading }) => ({
  carOrder,
  loading: loading.models.carOrder
}))
class detail extends Component {
  constructor(props) {
    super(props);
    const { location: { query: { orderId } } } = props;
    this.state = {
      orderId,
      _nav: 1
    };
  }

  navTabs = [
    { title: "基本信息", value: 1, component: CarDetailBasic },
    { title: "保险信息", value: 2, component: CarDetailInsurance },
    { title: "影像信息", value: 3, component: CarDetailImages },
  ]

  componentDidMount() {
    this.queryDetail();
  }

  queryDetail = () => {
    const { dispatch, location: { query, query: { orderId } } } = this.props;
    if (orderId) this.props.trackStart(orderId)
    // 存储客户token
    setCustomerToken(query['blade-auth'])
    dispatch({
      type: 'carOrder/queryDetail',
      payload: { orderId }
    })
  }

  renderTabContent = () => {
    const { _nav } = this.state;
    const tab = this.navTabs.find(item => item.value === _nav);
    const Component = tab && tab.component;
    return Component && <Component {...this.props} />
  }

  closeOk = () => {
    const { orderId } = this.state;
    const { dispatch } = this.props;
    PPBLoading.show();
    dispatch({
      type: 'carOrder/closeOrder',
      payload: { orderId }
    }).then(res => {
      if (res && res.code === 200) {
        this.setState({ closeModalVisible: false })
        this.queryDetail();
      }
      PPBLoading.hide();
    })
  }

  toPay = () => {
    const { orderId } = this.state;
    history.push(`/order/car/payMethods?orderId=${orderId}`)
  }

  /**
   * 获取电子保单接口判断有电子保单才跳转电子保单页面
  */
  toElectronicPolicy = () => {
    const { dispatch } = this.props;
    const { orderId } = this.state;
    dispatch({
      type: 'carOrder/getElectronic',
      payload: { orderId }
    }).then(res => {
      if (res && res.code === 200) {
        if (res.data.hasElectronicInsurance) {
          history.push(`/order/car/electronicPolicy?orderId=${orderId}`);
          return;
        }
      }
      Toast.info('电子保单下载中，请稍后查看或联系业务人员索要')
    })
  }

  toQuote = () => {
    const { orderId } = this.state;
    history.push(`/PublicAutomobile/quoteInfo?orderId=${orderId}`);
  }

  // renderCloseBtn = () => <div className={styles.footerBtn} onClick={() => this.setState({ closeModalVisible: true })}>关闭订单</div>;
  renderCloseBtn = () => <div className={styles.closeBtn} onClick={() => this.setState({ closeModalVisible: true })}>关闭订单</div>;

  render() {
    const { _nav, closeModalVisible } = this.state;
    const { carOrder: { detail: { order = {},files=[] } = {} } } = this.props;
    let showClose = !['insured','close'].includes(order.status);
    if(_nav ==3 && files.length == 0){
      showClose = false;
    }
    return (<div className={styles.navDetailContainer}>
      <Modal
        visible={closeModalVisible}
        transparent
        className={styles.modalContainer}
      >
        <div className={styles.modal}>
          <div className={styles.modalContentHeader}>确定关闭当前订单？</div>
          <div className={styles.modalContentButtons}>
            <div onClick={() => this.setState({ closeModalVisible: false })}>否</div>
            <div onClick={this.closeOk}>是</div>
          </div>
        </div>
      </Modal>
      <div className={styles.navTab}>
        {this.navTabs.map(item =>
          <div
            onClick={() => this.setState({ _nav: item.value })}
            className={[styles.navTabItem, item.value === _nav ? styles.navTabItemActive : ''].join(" ")}
          >
            {item.title}
          </div>
        )}
      </div>
      <div className={styles.tabContent}>
        {this.renderTabContent()}
        {
         showClose && this.renderCloseBtn()
        }
      </div>

      {(['insured','close','unpaid'].includes(order.status))&&(order.status === 'insured' ? !!order.isSupportElectronicPolicy : !!order.status) && <div className={styles.footerBtns}>
        <div className={styles.fixedFooter}>
          {(() => {
            switch (order.status) {
              case 'unpaid':
                return <>
                  {/* {this.renderCloseBtn()} */}
                  <div className={[styles.footerBtn, styles.gradualChange].join(' ')} style={{ flex: 2 }} onClick={this.toPay}>去支付</div>
                </>
              case 'insured':
                return !!order.isSupportElectronicPolicy && <div className={[styles.footerBtn, styles.gradualChange].join(' ')} onClick={this.toElectronicPolicy}>查看电子保单</div>
              case 'close':
                return <div className={[styles.footerBtn, styles.gradualChange].join(' ')} onClick={this.toQuote}>再次报价</div>
              default:
                // return this.renderCloseBtn()
            }
          })()}
        </div>
      </div>}
    </div>
    );
  }
}

export default detail;
