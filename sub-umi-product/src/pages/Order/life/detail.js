/**
 * title: 保单详情
 */
/**
 * 保单/续期单详情（待处理的订单详情是pending页面）
*/
import React, { Component } from 'react';
import { connect } from 'dva';
import Collapse from '../components/Collapse';
import OSSFile from '@/components/OSSFile';
import styles from '../assets/detail.less';
import { renderSafeguardPeriodVO, renderPaymentPeriodVO } from '../assets/transformType';
@connect(({ commonOrder, loading }) => ({
  commonOrder,
  loading: loading.models.commonOrder
}))
class detail extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { dispatch, location: { query: { renewalId, policyId } } } = this.props;
    const id = policyId ? policyId : renewalId;
    const type = policyId ? 'commonOrder/queryAgentPolicyDetail' : 'commonOrder/queryRenewalDetail'
    dispatch({
      type,
      payload: { id },
      role: 'agent'
    })
  }

  render() {
    const { commonOrder: { detail, detail: { applicant = {} } = {} } } = this.props;
    return (
      <div className={styles.detailContainer}>
        <Collapse
          title={`保单号：${detail.policyNo ? detail.policyNo : ''}`}
          defaultActive={true}
        >
          <div className={styles.detailCard}>
            <div className={styles.item}><span className={styles.name}>承保日期</span><span className={styles.value}>{detail.acceptDate}</span></div>
            <div className={styles.item}><span className={styles.name}>生效日期</span><span className={styles.value}>{detail.effectiveDate}</span></div>
            <div className={styles.item}><span className={styles.name}>保单年度</span><span className={styles.value}>{detail.policyYear}</span></div>
            <div className={styles.item}><span className={styles.name}>总保费</span><span className={styles.value}>{detail.premium}</span></div>
            <div className={styles.item}><span className={styles.name}>保单状态</span><span className={styles.value}>{detail.policyStatus}</span></div>
          </div>
        </Collapse>
        {detail.clauses && detail.clauses.map((clause, index) => (
          <Collapse
            title={`险种${detail.clauses.length > 1 ? index + 1 : ''}名称：${clause.clauseName ? clause.clauseName : ''}`}
            defaultActive={true}
          >
            <div className={styles.detailCard}>
              <div className={styles.item}><span className={styles.name}>缴费年期</span><span className={styles.value}>{renderPaymentPeriodVO(clause.paymentPeriodVO)}</span></div>
              <div className={styles.item}><span className={styles.name}>保险期间</span><span className={styles.value}>{renderSafeguardPeriodVO(clause.safeguardPeriodVO)}</span></div>
              <div className={styles.item}><span className={styles.name}>保额</span><span className={styles.value}>{clause.amount}</span></div>
              <div className={styles.item}><span className={styles.name}>保费</span><span className={styles.value}>{clause.premium}</span></div>
            </div>
          </Collapse>
        ))}
        <Collapse
          title={`投保人：${applicant.name ? applicant.name : ''}`}
          defaultActive={true}
        >
          <div className={styles.detailCard}>
            <div className={styles.item}><span className={styles.name}>电话</span><span className={styles.value}>{applicant.mobile}</span></div>
            <div className={styles.item}><span className={styles.name}>家庭住址</span><span className={styles.value}>{applicant.address}</span></div>
            <div className={styles.item}><span className={styles.name}>年龄</span><span className={styles.value}>{applicant.age}</span></div>
            <div className={styles.item}><span className={styles.name}>性别</span><span className={styles.value}>{applicant.sexName}</span></div>

          </div>
        </Collapse>
        {detail.insurants && detail.insurants.map((insurant, index) => (
          <Collapse
            title={`被保险人：${insurant.name ? insurant.name : ''}`}
            defaultActive={true}
          >
            <div className={styles.detailCard}>
              <div className={styles.item}><span className={styles.name}>与投保人关系</span><span className={styles.value}>{insurant.relationName}</span></div>
              <div className={styles.item}><span className={styles.name}>年龄</span><span className={styles.value}>{insurant.age}</span></div>
              <div className={styles.item}><span className={styles.name}>性别</span><span className={styles.value}>{insurant.sexName}</span></div>
              <div className={styles.item}><span className={styles.name}>电话</span><span className={styles.value}>{insurant.mobile}</span></div>
            </div>
          </Collapse>
        ))}
        {
          detail.beneficiaryTypeName === '指定' ?
            <Collapse
              title={`受益人：${detail.beneficiaryTypeName ? detail.beneficiaryTypeName : ''}`}
              defaultActive={true}
            >{detail.benefit && detail.benefit.map((bene, index) => (
              <div className={styles.detailCard}>
                <div className={styles.item}><span className={styles.name}>姓名</span><span className={styles.value}>{bene.name}</span></div>
                <div className={styles.item}><span className={styles.name}>年龄</span><span className={styles.value}>{bene.age}</span></div>
                <div className={styles.item}><span className={styles.name}>性别</span><span className={styles.value}>{bene.sexName}</span></div>
                <div className={styles.item}><span className={styles.name}>电话</span><span className={styles.value}>{bene.mobile}</span></div>
              </div>
            ))}
            </Collapse> :
            <div className={styles.detailNoCollapseItem}>受益人：{detail.beneficiaryTypeName}</div>
        }
        {<OSSFile files={detail.annexUrl}><div className={styles.viewElectronicPolicy}><div className={styles.fixedFooter}><div>查看电子保单</div></div></div></OSSFile>}
      </div>
    );
  }
}

export default detail;