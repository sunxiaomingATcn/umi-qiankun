/**投保*/
import { connect } from 'dva';
import React, { useState, useEffect, useCallback } from 'react';
import { List, Checkbox, Input, Switch, DatePicker, Picker, Toast, Space } from 'antd-mobile-v5';
import styles from './success.scss';
import { history } from 'umi';
import routerTrack from '@/components/routerTrack';

function Index(props) {
  useEffect(() => {
    document.title = '提交结果';
    props.trackStart(localStorage.quoteRes);

  }, []);

  const goback = () => {
    history.push('/publichome?tab=order&orderType=1')
  }
  return <div className={styles.con}>
    <img src={require('../images/success.png')}/>
    <span>提交成功</span>
    <div className={styles.submit} onClick={goback}>返回</div>
  </div>
}

const routerTrackIndex = routerTrack({ id: 'pageSuccess', autoStart: false})(Index);

export default connect(({ publicautomobile, publichome }) => ({ publicautomobile, publichome }))(
  routerTrackIndex,
);
