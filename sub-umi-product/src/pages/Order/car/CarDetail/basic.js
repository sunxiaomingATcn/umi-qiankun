/**
 * title: 订单详情
 */
/**
 * 保单/续期单详情（待处理的订单详情是pending页面）
*/
import React, { Component } from 'react';
import { connect } from 'dva';
import Collapse from '../../components/Collapse';
import styles from '../../assets/detail.less';

@connect(({ carOrder, loading }) => ({
  carOrder,
  loading: loading.models.carOrder
}))
class detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      _nav: 1
    };
  }

  render() {
    const { carOrder: { detail: { order = {}, car = {}, owner = {}, policyHolder = {}, insured = {}, supplyInfos = [] } = {} } } = this.props;
    return (<div className={styles.detailContainer}>
      {(['underwriting_fail', 'close'].includes(order.status) && order.reason) && <div className={styles.loginError}>
        <img src={require('../../assets/images/loginerror.png')} />
        <p>{order.reason}</p>
      </div>}
      <Collapse
        title={`订单状态：${order.statusName || ''}`}
        defaultActive={true}
      >
        <div className={styles.detailCard}>
          <div className={styles.item}><span className={styles.name}>订单号</span><span className={styles.value}>{order.orderNo}</span></div>
          <div className={styles.item}><span className={styles.name}>创建时间</span><span className={styles.value}>{order.createTime}</span></div>
          <div className={styles.item}><span className={styles.name}>投保地区</span><span className={styles.value}>{order.cityName}</span></div>
          <div className={styles.item}><span className={styles.name}>业务机构</span><span className={styles.value}>{order.org}</span></div>
          <div className={styles.item}><span className={styles.name}>出单账号</span><span className={styles.value}>{order.account}</span></div>
        </div>
      </Collapse>
      <Collapse
        title={`车牌号：${car.carLicenseNo || ''}`}
        defaultActive={true}
      >
        <div className={styles.detailCard}>
          <div className={styles.item}><span className={styles.name}>车架号</span><span className={styles.value}>{car.vinCode}</span></div>
          <div className={styles.item}><span className={styles.name}>发动机号</span><span className={styles.value}>{car.engineNo}</span></div>
          <div className={styles.item}><span className={styles.name}>初登日期</span><span className={styles.value}>{car.registDate}</span></div>
          <div className={styles.item}><span className={styles.name}>厂牌型号</span><span className={styles.value}>{car.standardFullName}</span></div>
          <div className={styles.item}><span className={styles.name}>报价车型</span><span className={styles.value}>{car.modelStr}</span></div>
        </div>
      </Collapse>
      <Collapse
        title={`车主：${owner.name || ''}`}
        defaultActive={true}
      >
        <div className={styles.detailCard}>
          <div className={styles.item}><span className={styles.name}>证件类型</span><span className={styles.value}>{owner.idCardTypeName}</span></div>
          <div className={styles.item}><span className={styles.name}>证件号码</span><span className={styles.value}>{owner.idCard}</span></div>
          {owner?.supplyInfos?.map?.(item => {
            return <div key={item.key} className={styles.item}>
              <span className={styles.name}>{item.desc}</span>
              <span className={styles.value}>{item.value}</span>
            </div>
          })}
        </div>
      </Collapse>
      <Collapse
        title={`投保人：${policyHolder.name || ''}`}
        defaultActive={true}
      >
        <div className={styles.detailCard}>
          <div className={styles.item}><span className={styles.name}>证件类型</span><span className={styles.value}>{policyHolder.idCardTypeName}</span></div>
          <div className={styles.item}><span className={styles.name}>证件号码</span><span className={styles.value}>{policyHolder.idCard}</span></div>
          {/* <div className={styles.item}><span className={styles.name}>手机号</span><span className={styles.value}>{policyHolder.phone}</span></div>
          <div className={styles.item}><span className={styles.name}>邮箱</span><span className={styles.value}>{policyHolder.email}</span></div> */}
          {policyHolder?.supplyInfos?.map?.(item => {
            return <div key={item.key} className={styles.item}>
              <span className={styles.name}>{item.desc}</span>
              <span className={styles.value}>{item.value}</span>
            </div>
          })}
        </div>
      </Collapse>
      <Collapse
        title={`被保人：${insured.name || ''}`}
        defaultActive={true}
      >
        <div className={styles.detailCard}>
          <div className={styles.item}><span className={styles.name}>证件类型</span><span className={styles.value}>{insured.idCardTypeName}</span></div>
          <div className={styles.item}><span className={styles.name}>证件号码</span><span className={styles.value}>{insured.idCard}</span></div>
          {/* <div className={styles.item}><span className={styles.name}>手机号</span><span className={styles.value}>{insured.phone}</span></div> */}
          {insured?.supplyInfos?.map?.(item => {
            return <div key={item.key} className={styles.item}>
              <span className={styles.name}>{item.desc}</span>
              <span className={styles.value}>{item.value}</span>
            </div>
          })}
        </div>
      </Collapse>
      {supplyInfos && supplyInfos.length > 0 &&
        <Collapse
          title={`其他信息`}
          defaultActive={true}
        >
          <div className={styles.detailCard}>
            {/* <div className={styles.item}><span className={styles.name}>手机号</span><span className={styles.value}>{insured.phone}</span></div> */}
            {supplyInfos?.map?.(item => {
              return <div key={item.key} className={styles.item}>
                <span className={styles.name}>{item.desc}</span>
                <span className={styles.value}>{item.value}</span>
              </div>
            })}
          </div>
        </Collapse>
      }
    </div>
    );
  }
}

export default detail;