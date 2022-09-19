/**
 * title: 订单详情
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
    const { carOrder: { detail, detail: { policy = {}, rate = {}, risks: { bizSuiteInfo = {}, bizSuiteInfo: { suites } = {}, efcSuiteInfo = {}, taxSuiteInfo = {} } = {} } = {} } } = this.props;
    return (<div className={styles.detailContainer}>
      <Collapse
        title={`投保保司：${policy.icName ? policy.icName : ''}`}
        defaultActive={true}
      >
        <div className={styles.detailCard}>
          <div className={styles.item}><span className={styles.name}>交强险起保日期</span><span className={styles.value}>{policy.jqStartDate}</span></div>
          <div className={styles.item}><span className={styles.name}>商业险起保日期</span><span className={styles.value}>{policy.syStartDate}</span></div>
          {/* <div className={styles.item}><span className={styles.name}>交强险投保单号</span><span className={styles.value}>{policy.jqProposalNo}</span></div>
          <div className={styles.item}><span className={styles.name}>商业险投保单号</span><span className={styles.value}>{policy.syProposalNo}</span></div> */}
          <div className={styles.item}><span className={styles.name}>交强险保单号</span><span className={styles.value}>{policy.jqPolicyNo}</span></div>
          <div className={styles.item}><span className={styles.name}>商业险保单号</span><span className={styles.value}>{policy.syPolicyNo}</span></div>
        </div>
      </Collapse>
      <Collapse
        title={<span>总价：{<span className={styles.price}>{detail.totalPremium || ''}</span>}</span>}
        defaultActive={true}
      >
        <div className={styles.detailTable}>
          <header><span>险别</span><span>保额</span><span>保费</span></header>
          {efcSuiteInfo && <div className={styles.tableItem}><span>交强险</span><span>{efcSuiteInfo.showAmount || efcSuiteInfo.amount}</span><span>{efcSuiteInfo.discountCharge}</span></div>}
          {suites && suites.map(item => <div className={styles.tableItem}><span>{item.name}</span><span>{item.showAmount}</span><span>{item.discountCharge}</span></div>)}
          <div className={styles.border}></div>
          {efcSuiteInfo && <div className={styles.tableItem}><span>交强险</span><span></span><span>{efcSuiteInfo.discountCharge}</span></div>}
          {taxSuiteInfo && <div className={styles.tableItem}><span>车船税</span><span></span><span>{taxSuiteInfo.charge}</span></div>}
          <div className={styles.tableItem}><span>商业险合计</span><span></span><span>{bizSuiteInfo.discountCharge}</span></div>
        </div>
      </Collapse>
    </div>
    );
  }
}

export default detail;