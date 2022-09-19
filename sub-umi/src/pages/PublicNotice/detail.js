/**
 * title: 公告详情
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './detail.scss';
import { Toast } from 'antd-mobile';
// import Util from '@/utils/utils';
import { history } from 'umi';
import * as requestMethods from '@/services/public';

@connect()
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {}
    };
  }

  componentDidMount() {
    document.title = '公告详情';
    const { location: { query:{id} } } = this.props;
    if(id){
      requestMethods
      .queryNoticeDetail(id)
      .then(res => {
        if(!res)return;
        console.log('[queryNoticeDetail]', res);
        if (res.code === 200) {
          this.setState({
            data: res.data
          })
        }else{
          Toast.fail(res.msg);
        }
      });
    }
  }

  componentWillUnmount() {}

  render() {
    const { data } = this.state;
    return (
      <div className={styles.container}>
        <span className={styles.title}>{data.title}</span>
        <span className={styles.time}>{data.releaseTime	}</span>
        <span className={styles.content}>
          {data.content}
        </span>
      </div>
    );
  }
}

export default Index;
