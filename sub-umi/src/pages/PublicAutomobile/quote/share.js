/**选择保司*/
import { connect } from 'dva';
import React, { useState, useEffect, useCallback } from 'react';
import { createForm } from 'rc-form';
import { List, Radio, Input, Switch, DatePicker, Picker, Toast, Space } from 'antd-mobile-v5';
import styles from './share.scss';
import utils from '@/utils/utils';
import Card from '../components/cardQuote';
import Line from '../components/line';



import * as requestMethodsAutomobile from '@/services/publicAutomobile';
const { generalRequest } = utils;

function Index(props) {
  const [car, setCar] = useState({});
  const [currentQuote, setCurrentQuote] = useState({ "id": "1496036104722788353", "icShortName": "平安财险", "accountName": "平安展业端账号勿动", "icLogo": "https://pengpaibao-src.oss-cn-beijing.aliyuncs.com/dev1/1631180378595pkicK.png", "jqStartDate": "", "jqEndDate": "", "syStartDate": "2022-02-23 00:00:00", "syEndDate": "2023-02-22 00:00:00", "fee": 1206.25, "riskJson": { "bizSuiteInfo": { "discountRate": 1.35, "suites": [{ "amount": 1000000, "code": "ThirdParty", "orgCharge": 893.52, "discountCharge": 1206.25, "name": "第三者责任险" }], "start": "2022-02-23", "end": "2023-02-22", "discountCharge": 1206.25 }, "efcSuiteInfo": {}, "taxSuiteInfo": {} } },
  );
  useEffect(() => {
    document.title = '分享报价';
    composeWXLink();
  }, []);

  const composeWXLink = () => {
    let searchStr = window.location.search;
    console.log('[searchStr]', searchStr);
    if (searchStr) {
      //去掉路径上井号前面的部分
      window.location.replace(window.location.href.replace(searchStr, ''));
    } else {
      const {
        location: { query = {} },
      } = props;
      if (!query.id) {
        Toast.show('没有报价结果id', 2);
        return;
      }
      initData(query.id)
    }
  };
  const initData = (id) => {
    if (!id) {
      return;
    }
    generalRequest({ quoteResultId: id }, requestMethodsAutomobile.shareDetail)
      .then(res => {
        setCurrentQuote(res.data.quotes[0]);
        setCar(res.data.car);
      })
  };
  const { riskJson: { bizSuiteInfo, efcSuiteInfo, taxSuiteInfo } } = currentQuote;
  return <div className={styles.con}>
    <Space direction='vertical' style={{ '--gap': '.2rem', width: '100%', marginTop: '.2rem' }}>
      <Card noTitle>
        <div className={styles.bannerItem}>
          <img src={currentQuote.icLogo} />
          <span>{currentQuote.accountName}</span>
          <span>￥{currentQuote.fee}</span>
        </div>
        <div className={styles.topTime}>报价时间：{currentQuote.quoteTime} （价格仅限当天有效）</div>
        <Line add='.6rem' offset='.3rem' marginTopAndBottom='.3rem' />
        <div className={styles.topTip}>尊敬的{car.carLicenseNo}车主，您的车险报价单如下：</div>
      </Card>
      <Card noTitle>
        <List.Item extra={<span>{car.standardFullName}</span>}>品牌型号</List.Item>
        <Line marginTop='.3rem' />
        <List.Item extra={<span>{car.modelStr}</span>}>车型</List.Item>
        <Line marginTop='.3rem' />
        {efcSuiteInfo && efcSuiteInfo.discountCharge &&
          <>
            <List.Item extra={<span>{currentQuote.jqStartDate}</span>}>交强险起保日期</List.Item>
            {
              bizSuiteInfo && bizSuiteInfo.discountCharge && <Line marginTop='.3rem' />
            }
          </>
        }

        {bizSuiteInfo && bizSuiteInfo.discountCharge &&
          <>
            <List.Item extra={<span>{currentQuote.syStartDate}</span>}>商业险起保日期</List.Item>
          </>
        }
        {/* <List.Item extra={<span>{currentQuote.accountName}</span>}>报价账号</List.Item> */}
      </Card>
      {efcSuiteInfo && efcSuiteInfo.discountCharge && <Card
        leftExtra="交强险"
        rightExtra={
          <span>￥{(efcSuiteInfo?.discountCharge ?? 0) + (taxSuiteInfo?.charge ?? 0)}</span>
        } >
        <List.Item extra={<span>￥{efcSuiteInfo?.discountCharge ?? 0}</span>}>交强险</List.Item>
        <List.Item extra={<span>￥{taxSuiteInfo?.charge ?? 0}</span>}>车船税</List.Item>
      </Card>}

      {bizSuiteInfo && bizSuiteInfo.discountCharge && <Card
        leftExtra="商业险"
        rightExtra={
          <span>￥{bizSuiteInfo?.discountCharge ?? 0}</span>
        } >
        {
          bizSuiteInfo.suites && bizSuiteInfo.suites.map((suite, index) => {
            return <List.Item key={index} extra={<span>￥{suite.discountCharge ?? 0}</span>}>{suite.name}{suite.showAmount ? `(${suite.showAmount})` : ''}</List.Item>
          })
        }
      </Card>}
      <Card leftExtra="保费总金额"
        noContent
        rightExtra={
          <span>￥{currentQuote.fee}</span>
        } >
      </Card>

      <Card leftExtra="报价单链接"
        noContent
        rightExtra={
          <div onClick={() => {
            let clipBoardContent = window.location.href;
            utils.copyText(clipBoardContent);
            Toast.show('复制成功');
          }} className={styles.link}><div>{window.location.href}</div><img src={require('../images/copy.png')} /></div>
        } >
      </Card>
    </Space>
  </div>
}
export default connect(({ publicautomobile, publichome }) => ({ publicautomobile, publichome }))(
  Index,
);
