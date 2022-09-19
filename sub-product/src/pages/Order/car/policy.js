/**
 * title: 保单详情
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Toast, Modal } from 'antd-mobile';
import { history } from 'umi';
import Collapse from '../components/Collapse';
import CarDetailBasic from '../car/CarDetail/basic';
import CarDetailInsurance from '../car/CarDetail/insurance';
import routerTrack from '@/components/routerTrack';
import PPBLoading from '@/components/Loading/loading.js';
import OSSFile from '@/components/OSSFile';
import styles from '../assets/detail.less';

@routerTrack({ id: 'page-order-car-policy', autoStart: false })
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
    { title: "保险信息", value: 2, component: CarDetailInsurance }
  ]

  componentDidMount() {
    this.queryDetail();
  }

  queryDetail = () => {
    const { dispatch, location: { query: { policyId } } } = this.props;
    dispatch({
      type: 'carOrder/queryPolicyDetail',
      payload: { id: policyId }
    })
  }

  renderTabContent = () => {
    const { _nav } = this.state;
    const tab = this.navTabs.find(item => item.value === _nav);
    const Component = tab && tab.component;
    return Component && <Component {...this.props} />
  }

  closeOk = () => {

  }

  toPay = () => {

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

  renderCloseBtn = () => <div className={styles.footerBtn} onClick={() => this.setState({ closeModalVisible: true })}>关闭订单</div>;

  render() {
    const { _nav, closeModalVisible } = this.state;
    const { carOrder: { policyDetail: { policy = {}, risk = {}, car = {}, owner = {}, policyHolder = {}, insured = {}, electronicInsurance } = {} } } = this.props;

    return (<div className={styles.navDetailContainer}>
      <div className={styles.tabContent}>
        <div className={styles.detailContainer}>
          <Collapse
            title={`保单号：${policy.policyNo || ''}`}
            defaultActive={true}
          >
            <div className={styles.detailCard}>
              <div className={styles.item}><span className={styles.name}>保险公司</span><span className={styles.value}>{policy.insuranceCompany}</span></div>
              <div className={styles.item}><span className={styles.name}>保险类型</span><span className={styles.value}>{({ "0": "交商同保", "1": "商业险", "2": "交强险" })[policy.riskType]}</span></div>
              <div className={styles.item}><span className={styles.name}>录入日期</span><span className={styles.value}>{policy.entryDate}</span></div>
              <div className={styles.item}><span className={styles.name}>保障期限</span><span className={styles.value}>{policy.startDate} ~ {policy.endDate}</span></div>
              <div className={styles.item}><span className={styles.name}>投保地区</span><span className={styles.value}>{policy.areaName}</span></div>
              <div className={styles.item}><span className={styles.name}>业务归属机构</span><span className={styles.value}>{policy.orgName}</span></div>
              <div className={styles.item}><span className={styles.name}>出单账号</span><span className={styles.value}>{policy.accountName}</span></div>
              <div className={styles.item}><span className={styles.name}>保单状态</span><span className={styles.value}>{({ "1": "未生效", "2": "有效", "3": "终止", "99": "其他" })[policy.policyStatus]}</span></div>
            </div>
          </Collapse>
          <Collapse
            title={<span>总保费：{<span className={styles.price}>{risk.totalPremium || 0}</span>}</span>}
            defaultActive={true}
          >
            <div className={styles.detailCard}>
              {risk.risks && risk.risks.map(item => <div className={styles.item}><span className={styles.name}>{item.name}</span><span className={styles.value}>{item.premium}元</span></div>)}
            </div>
          </Collapse>
          <Collapse
            title={`车牌号：${car.carLicenseNo || ''}`}
            defaultActive={false}
          >
            <div className={styles.detailCard}>
              <div className={styles.item}><span className={styles.name}>车架号</span><span className={styles.value}>{car.vinCode}</span></div>
              <div className={styles.item}><span className={styles.name}>发动机号</span><span className={styles.value}>{car.engineNo}</span></div>
              <div className={styles.item}><span className={styles.name}>初登日期</span><span className={styles.value}>{car.registDate}</span></div>
              <div className={styles.item}><span className={styles.name}>厂牌型号</span><span className={styles.value}>{car.standardFullName}</span></div>
            </div>
          </Collapse>
          <Collapse
            title={`车主：${owner.name || ''}`}
            defaultActive={false}
          >
            <div className={styles.detailCard}>
              <div className={styles.item}><span className={styles.name}>车主类型</span><span className={styles.value}>{owner.personType}</span></div>
              <div className={styles.item}><span className={styles.name}>电话</span><span className={styles.value}>{owner.phone}</span></div>
              <div className={styles.item}><span className={styles.name}>地址</span><span className={styles.value}>{owner.address}</span></div>
            </div>
          </Collapse>
          <Collapse
            title={`投保人：${policyHolder.name || ''}`}
            defaultActive={false}
          >
            <div className={styles.detailCard}>
              <div className={styles.item}><span className={styles.name}>投保人类型</span><span className={styles.value}>{policyHolder.personType}</span></div>
              <div className={styles.item}><span className={styles.name}>电话</span><span className={styles.value}>{policyHolder.phone}</span></div>
              <div className={styles.item}><span className={styles.name}>地址</span><span className={styles.value}>{policyHolder.address}</span></div>
            </div>
          </Collapse>
          <Collapse
            title={`被保人：${insured.name || ''}`}
            defaultActive={false}
          >
            <div className={styles.detailCard}>
              <div className={styles.item}><span className={styles.name}>被保人类型</span><span className={styles.value}>{insured.personType}</span></div>
              <div className={styles.item}><span className={styles.name}>电话</span><span className={styles.value}>{insured.phone}</span></div>
              <div className={styles.item}><span className={styles.name}>地址</span><span className={styles.value}>{insured.address}</span></div>
            </div>
          </Collapse>
        </div>
      </div>
      {electronicInsurance && <div className={styles.footerBtns}>
        <OSSFile files={electronicInsurance}><a className={[styles.footerBtn, styles.gradualChange].join(' ')}>查看电子保单</a></OSSFile>
      </div>}
    </div>
    );
  }
}

export default detail;
