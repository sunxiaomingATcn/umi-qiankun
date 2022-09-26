/**
 * title: 支付失败
 */
import React, { Component } from 'react';
import { ActivityIndicator } from 'antd-mobile';
import styles from './index.scss';
import { history } from 'umi';

class Index extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={styles.error}>
        <div className={styles.container}>
          <div className={[styles.payback_detail, 'flex-c-cc'].join(' ')}>
            <img src={require(`@/assets/icon/fail.svg`)} alt="" />
            <div className={[styles.payback_detail_msg, styles.fail].join(' ')}>{'支付失败'}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default Index;
