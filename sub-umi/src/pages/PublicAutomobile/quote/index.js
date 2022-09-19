/**选择保司*/
import { connect } from 'dva';
import React, { useState, useEffect, useCallback,useRef } from 'react';
import { createForm } from 'rc-form';
import { List, Radio, Input, Switch, DatePicker, Picker, Toast } from 'antd-mobile-v5';
import styles from './index.scss';
import AutomobileNum from '../../PublicHome/components/automobileNum';
import Line from '../components/line';
import WxSdk from '@/utils/wx-sdk';
import utils from '@/utils/utils';
import CacheUtil from '@/utils/CacheUtil';
import moment from 'moment';
import { history } from 'umi';
import PPBLoading from '@/components/Loading/loading.js';
import routerTrack from '@/components/routerTrack';
import * as requestMethodsAutomobile from '@/services/publicAutomobile';
import Bottom from '../components/bottom';

const { generalRequest } = utils;


function Index(props) {
  const [companys, setCompanys] = useState([
    // { "thirdId": "620b5ecf0c221a6dc07c0e04", "logo": "https://pengpaibao-src.oss-cn-beijing.aliyuncs.com/dev1/1631180378595pkicK.png", "name": "平安展业端账号勿动", "remark": "", "isSelected": 1 },
    // { "thirdId": "620b46120c221a6dc07c0d0b", "logo": "https://pengpaibao-src.oss-cn-beijing.aliyuncs.com/dev1/1636529862333pQQwF.png", "name": "简称223", "remark": "1222", "isSelected": 1 },
    // { "thirdId": "61e7b4fa9a95cf408ee005ec", "logo": "https://pengpaibao-src.oss-cn-beijing.aliyuncs.com/dev1/1631172346958RnxcJ.jpg", "name": "测试new", "remark": "这是新的测试方案skjdd时代峰峻阿拉丁来得及来得及啦氨基酸的垃圾第六届阿萨德", "isSelected": 0 }
  ]);
  const bottomRef = useRef();
  const [bcCode,setBcCode] = useState('');
  useEffect(() => {
    document.title = '选择保险公司';
    props.trackStart(localStorage.quoteBaseRes);
    const bId = CacheUtil.getBigDataCarInfo().companyId;
    const rId = CacheUtil.getRenewalCarInfo().companyId;
    setBcCode(rId??bId??'-999');
    initData();
  }, []);
  const initData = () => {
    generalRequest({ cityCode: localStorage.cityCode, provinceCode: localStorage.regionCode }, requestMethodsAutomobile.companys)
      .then(res => {
        setCompanys(res.data);
        setTimeout(() => {
          bottomRef.current.refresh();
        }, 0);
      })
  };

  const submit = () => {
    const selectedCompanys = companys.filter(item => item.isSelected == 1);
    if (!selectedCompanys || selectedCompanys.length < 1) {
      Toast.show('至少选择一家保险公司报价');
      return;
    }
    PPBLoading.show();
    let params = {
      quoteId: localStorage.quoteBaseRes,
      thirdIds: selectedCompanys.map(item => item.thirdId)
    };
    generalRequest(params, requestMethodsAutomobile.quote)
      .then((res) => {
        localStorage.setItem('quoteRes', res.data);
        localStorage.setItem('quoteCompanys', JSON.stringify(companys));
        history.replace('/PublicAutomobile/quote/quoting');
      })
  };

  const switchProps = {
    style: {
      '--width': '.8rem',
      '--height': '.5rem',
      '--border-width': '.02rem',
      '--checked-color': 'linear-gradient(270deg, #0AB88D 0%, #5B8EFF 100%)'
    }
  };
  return <div className={styles.con}>
    <div style={{ height: '.2rem', background: '#F8F9F9' }}></div>
    <div className={styles.companysCon}>
      {
        companys && companys.map((company, index) => {
          return <div className={styles.company} key={index}>
            {
              company.bcCode == bcCode &&
              <img className={styles.xu} src={require('../images/xu.png')} />
            }
            <div className={styles.logo}>
              <img src={company.logo} />
            </div>
            <div className={styles.mid}>
              <span>{company.name}</span>
              <span>{company.remark||'暂无备注'}</span>
            </div>
            <Switch {...switchProps}
              // beforeChange={(checked) => {
              //   return new Promise((resolve, reject) => {
              //     let selectedCompanys = companys.filter(item => item.isSelected == 1);
              //     if (checked && selectedCompanys && selectedCompanys.length >= 5) {
              //       Toast.show(`最多只能选择五家保险公司`);
              //       reject();
              //     } else {
              //       resolve();
              //     }
              //   })
              // }}
              onChange={(checked) => {
                let changedCompany = companys[index];
                changedCompany.isSelected = checked ? 1 : 0;
                setCompanys([...companys]);
              }}
              checked={company.isSelected}
              className={styles.switch} />
          </div>
        })
      }
    </div>
    <Bottom ref={bottomRef}>
      <div className={styles.submit} onClick={submit}>确认以上信息，去报价</div>
    </Bottom>
  </div>
}
const FormIndex = createForm()(Index);
const routerTrackIndex = routerTrack({ id: 'pageSelectCompany', autoStart: false })(FormIndex);
export default connect(({ publicautomobile, publichome }) => ({ publicautomobile, publichome }))(
  routerTrackIndex,
);
