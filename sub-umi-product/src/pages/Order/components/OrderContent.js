// 代理人待支付订单详情（待支付信息） 
import React, { Component } from 'react';
import styles from '../assets/order.less';

class OrderContent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { data = {}, data: { applicant = {} } = {}, status, quote } = this.props;

    return (
      <div className={styles.orderContent}>
        <div className={styles.productCard}>
          <header><span>{data.productName}</span>{(status && status.name) && <span className={[styles[`order_status_${status.value}`], styles.order_status].join(" ")}>{status.name}</span>}</header>
          <>
            <div className={styles.item}><span className={styles.name}>保额</span><span className={styles.value}>{data.amount}</span></div>
            <div className={styles.item}><span className={styles.name}>保费</span><span className={styles.value}>{data.premium}</span></div>
            <div className={styles.item}><span className={styles.name}>保障期限</span><span className={styles.value}>{data.policyTerm}</span></div>
          </>
        </div>
        <div className={styles.detailCard}>
          <header>投保人信息</header>
          <div className={styles.item}><span className={styles.name}>姓名</span><span className={styles.value}>{applicant.name}</span></div>
          <div className={styles.item}><span className={styles.name}>证件类型</span><span className={styles.value}>{applicant.identityVO && applicant.identityVO.name}</span></div>
          <div className={styles.item}><span className={styles.name}>证件号码</span><span className={styles.value}>{applicant.identityVO && applicant.identityVO.value}</span></div>
          <div className={styles.item}><span className={styles.name}>手机号</span><span className={styles.value}>{applicant.mobile}</span></div>
          <div className={styles.item}><span className={styles.name}>家庭住址</span><span className={styles.value}>{applicant.address}</span></div>
          <div className={styles.item}><span className={styles.name}>邮箱</span><span className={styles.value}>{applicant.email}</span></div>
        </div>
        <div className={styles.detailCard}>
          <header>被保人信息</header>
          {data.insurants && data.insurants.map((insurant, index) => (
            <div className={styles.innerCard}>
              <div className={styles.item}><span className={styles.name}>与投保人关系</span><span className={styles.value}>{insurant.relationName}</span></div>
              <div className={styles.item}><span className={styles.name}>姓名</span><span className={styles.value}>{insurant.name}</span></div>
              <div className={styles.item}><span className={styles.name}>证件类型</span><span className={styles.value}>{insurant.identityVO && insurant.identityVO.name}</span></div>
              <div className={styles.item}><span className={styles.name}>证件号码</span><span className={styles.value}>{insurant.identityVO && insurant.identityVO.value}</span></div>
              <div className={styles.item}><span className={styles.name}>手机号</span><span className={styles.value}>{insurant.mobile}</span></div>
              <div className={styles.item}><span className={styles.name}>家庭住址</span><span className={styles.value}>{insurant.address}</span></div>
              <div className={styles.item}><span className={styles.name}>邮箱</span><span className={styles.value}>{insurant.email}</span></div>
            </div>
          ))}
        </div>

        {data.beneficiaryTypeName === '指定' ?
          <div className={styles.detailCard}>
            <header><span>受益人信息</span><span>{data.beneficiaryTypeName}</span></header>
            {data.benefit && data.benefit.map(bene => (
              <div className={styles.innerCard}>
                <div className={styles.item}><span className={styles.name}>姓名</span><span className={styles.value}>{bene.name}</span></div>
                <div className={styles.item}><span className={styles.name}>年龄</span><span className={styles.value}>{bene.age}</span></div>
                <div className={styles.item}><span className={styles.name}>性别</span><span className={styles.value}>{bene.sexName}</span></div>
                <div className={styles.item}><span className={styles.name}>电话</span><span className={styles.value}>{bene.mobile}</span></div>
              </div>
            ))}
          </div> :
          <div className={styles.detailNoCollapseItem}><span>受益人信息</span><span>{data.beneficiaryTypeName}</span></div>
        }
        <div className={styles.detailNoCollapseItem}><span>保费</span><span><div className={styles.cost}><span>￥</span>{data.premium}</div></span></div>
      </div>
    );
  }
}

export default OrderContent;