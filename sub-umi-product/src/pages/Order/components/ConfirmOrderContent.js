/**
 * 投保人投保信息确认/投保人待支付页面 内容组件
 * */
import React, { Component } from 'react';
import styles from '../assets/order.less';
import { RZ_RZB } from '@/pages/ProductNew/assets/productConfig/judgeProductFeature';
const car300 = localStorage.ppb_visting_productName == '机动车延长保修保险UAC' || localStorage.ppb_visting_productName == '人保驾乘意外险产品EAU'
class OrderContent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { data = {}, data: { applicant = {} } = {}, status, quote, plan } = this.props;

    return (
      <div className={styles.orderContent}>
        <div className={styles.productCard}>
          <header><span>{data.productName}</span>{(status && status.name) && <span className={[styles[`order_status_${status.value}`], styles.order_status].join(" ")}>{status.name}</span>}</header>

          {RZ_RZB.is() ? <>
            <div className={styles.item}><span className={styles.name}>保障计划</span><span className={styles.value}>{plan}</span></div>
            <div className={styles.item}><span className={styles.name}>保费</span><span className={styles.value}>{data.premium}</span></div>
            <div className={styles.item}><span className={styles.name}>保障期限</span><span className={styles.value}>{data.policyTerm}</span></div>
          </> :
            quote && quote.map(item => <div className={styles.item}><span className={styles.name}>{item.name}</span><span className={styles.value}>{item.value}</span></div>)
          }
        </div>
        <div className={styles.detailCard}>
          <header>投保人信息</header>
          <div className={styles.item}><span className={styles.name}>姓名</span><span className={styles.value}>{applicant.name}</span></div>
          <div className={styles.item}><span className={styles.name}>证件类型</span><span className={styles.value}>{applicant.identityVO && applicant.identityVO.name}</span></div>
          <div className={styles.item}><span className={styles.name}>证件号码</span><span className={styles.value}>{applicant.identityVO && applicant.identityVO.value}</span></div>
          <div className={styles.item}><span className={styles.name}>手机号</span><span className={styles.value}>{applicant.mobile}</span></div>
          {RZ_RZB.is() ? null : applicant.address && <div className={styles.item}><span className={styles.name}>家庭住址</span><span className={styles.value}>{applicant.address}</span></div>}
          <div className={styles.item}><span className={styles.name}>邮箱</span><span className={styles.value}>{applicant.email}</span></div>
        </div>
        {
          data.insurants && data.insurants.length && !car300 ?
            <div className={styles.detailCard}>
              <header>被保人信息</header>
              {data.insurants && data.insurants.map((insurant, index) => (
                <div className={styles.innerCard}>
                  <div className={styles.item}><span className={styles.name}>与投保人关系</span><span className={styles.value}>{insurant.relationName}</span></div>
                  <div className={styles.item}><span className={styles.name}>姓名</span><span className={styles.value}>{insurant.name}</span></div>
                  <div className={styles.item}><span className={styles.name}>证件类型</span><span className={styles.value}>{insurant.identityVO && insurant.identityVO.name}</span></div>
                  <div className={styles.item}><span className={styles.name}>证件号码</span><span className={styles.value}>{insurant.identityVO && insurant.identityVO.value}</span></div>
                  <div className={styles.item}><span className={styles.name}>手机号</span><span className={styles.value}>{insurant.mobile}</span></div>
                  {RZ_RZB.is() ? null : insurant.address && <div className={styles.item}><span className={styles.name}>家庭住址</span><span className={styles.value}>{insurant.address}</span></div>}
                  <div className={styles.item}><span className={styles.name}>邮箱</span><span className={styles.value}>{insurant.email}</span></div>
                </div>
              ))}
            </div> : ''
        }
        {data.beneficiaryTypeName === '指定' ?
          <div className={styles.detailCard}>
            <header><span>受益人信息</span><span>{data.beneficiaryTypeName}</span></header>
            {data.benefit && data.benefit.length && data.benefit.map(bene => (
              <div className={styles.innerCard}>
                <div className={styles.item}><span className={styles.name}>姓名</span><span className={styles.value}>{bene.name}</span></div>
                <div className={styles.item}><span className={styles.name}>年龄</span><span className={styles.value}>{bene.age}</span></div>
                <div className={styles.item}><span className={styles.name}>性别</span><span className={styles.value}>{bene.sexName}</span></div>
                <div className={styles.item}><span className={styles.name}>电话</span><span className={styles.value}>{bene.mobile}</span></div>
              </div>
            ))}
          </div> :
          data.beneficiaryTypeName ? <div className={styles.detailNoCollapseItem}><span>受益人信息</span><span>{data.beneficiaryTypeName}</span></div> : ''
        }
      </div>
    );
  }
}

export default OrderContent;
