/**
 * title: 投保成功
 */
import React, { Component } from 'react';
import { ActivityIndicator } from 'antd-mobile';
import styles from './index.scss';
import { history } from 'umi';

class Index extends Component {
  constructor(props) {
    super(props);

  }

  componentDidMount() {
  }

  render() {
    const success = true;


    return (
      <div className={styles.container}>
        <div className={[styles.payback_detail, 'flex-c-cc'].join(' ')}>
          <img src={require(`@/assets/icon/${success ? 'paysuccess' : 'fail'}.svg`)} alt="" />
          <div
            className={[styles.payback_detail_msg, !success ? styles.fail : undefined].join(' ')}>{success ? '恭喜投保成功' : '支付失败'}</div>
          {/* {success && <div className={styles.payback_success_des}>请登录投保邮箱查收您的电子保单</div>} */}
        </div>
      </div>
    );
  }
}

export default Index;
