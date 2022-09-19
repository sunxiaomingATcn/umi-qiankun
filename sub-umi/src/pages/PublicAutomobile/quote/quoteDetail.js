/**选择保司*/
import { connect } from 'dva';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createForm } from 'rc-form';
import { List, Radio, Input, Switch, DatePicker, Picker, Toast, Space, Mask } from 'antd-mobile-v5';
import styles from './quoteDetail.scss';
import WxSdk from '@/utils/wx-sdk';
import utils from '@/utils/utils';
import { history } from 'umi';
import PPBLoading from '@/components/Loading/loading.js';
import Swiper from 'swiper/dist/js/swiper.js';
import 'swiper/dist/css/swiper.min.css';
import Card from '../components/cardQuote';
import Ball from '../components/ball';
import routerTrack from '@/components/routerTrack';
import Bottom from '../components/bottom';



import * as requestMethodsAutomobile from '@/services/publicAutomobile';
const { generalRequest } = utils;

function Index(props) {
  const [quotes, setQuotes] = useState([
    // { "id": "1496036104722788353", "icShortName": "平安财险", "accountName": "平安展业端账号勿动111", "icLogo": "https://pengpaibao-src.oss-cn-beijing.aliyuncs.com/dev1/1631180378595pkicK.png", "jqStartDate": "", "jqEndDate": "", "syStartDate": "2022-02-23 00:00:00", "syEndDate": "2023-02-22 00:00:00", "fee": 1206.25, "riskJson": { "bizSuiteInfo": { "discountRate": 1.35, "suites": [{ "amount": 1000000, "code": "ThirdParty", "orgCharge": 893.52, "discountCharge": 1206.25, "name": "第三者责任险" }], "start": "2022-02-23", "end": "2023-02-22", "discountCharge": 1206.25 }, "efcSuiteInfo": {}, "taxSuiteInfo": {} } },
    // { "id": "1496036104722788354", "icShortName": "平安财险", "accountName": "平安展业端账号勿动222", "icLogo": "https://pengpaibao-src.oss-cn-beijing.aliyuncs.com/dev1/1631180378595pkicK.png", "jqStartDate": "", "jqEndDate": "", "syStartDate": "2022-02-23 00:00:00", "syEndDate": "2023-02-22 00:00:00", "fee": 1206.25, "riskJson": { "bizSuiteInfo": { "discountRate": 1.35, "suites": [{ "amount": 1000000, "code": "ThirdParty", "orgCharge": 893.52, "discountCharge": 1206.25, "name": "第三者责任险" }], "start": "2022-02-23", "end": "2023-02-22", "discountCharge": 1206.25 }, "efcSuiteInfo": {}, "taxSuiteInfo": {} } },
    // { "id": "1496036104722788355", "icShortName": "平安财险", "accountName": "平安展业端账号勿动333", "icLogo": "https://pengpaibao-src.oss-cn-beijing.aliyuncs.com/dev1/1631180378595pkicK.png", "jqStartDate": "", "jqEndDate": "", "syStartDate": "2022-02-23 00:00:00", "syEndDate": "2023-02-22 00:00:00", "fee": 1206.25, "riskJson": { "bizSuiteInfo": { "discountRate": 1.35, "suites": [{ "amount": 1000000, "code": "ThirdParty", "orgCharge": 893.52, "discountCharge": 1206.25, "name": "第三者责任险" }], "start": "2022-02-23", "end": "2023-02-22", "discountCharge": 1206.25 }, "efcSuiteInfo": {}, "taxSuiteInfo": {} } },
  ]);
  const carRef = useRef();
  const [car, setCar] = useState({});

  const [currentQuote, setCurrentQuote] = useState({ riskJson: {} });
  useEffect(() => {
    document.title = '报价详情页';
    props.trackStart(localStorage.quoteRes);
    initData();
  }, []);
  const setShare = (quote) => {
    WxSdk.share({
      title: `${quote.icShortName}报价单`,
      desc: `尊敬的${carRef.current.carLicenseNo}车主，您的报价单如下，报价金额仅当天有效。`,
      imgUrl: quote.icLogo,
      link: `${window.origin}/#/PublicAutomobile/quote/share?id=${quote.id}`,
    });
  };
  const bottomRef = useRef();
  const initData = () => {
    const { location: { query: { id = '' } } } = props;
    generalRequest({ quoteId: localStorage.quoteRes }, requestMethodsAutomobile.details)
      .then(res => {
        let reqQuotes = res.data.quotes;
        setQuotes(reqQuotes);
        let cQuoteIndex = reqQuotes.findIndex(item => item.id === id);
        setCurrentQuote(reqQuotes[cQuoteIndex] ?? reqQuotes[0]);
        setCar(res.data.car);
        carRef.current = res.data.car;
        setShare(reqQuotes[cQuoteIndex] ?? reqQuotes[0]);
        initTop(cQuoteIndex, reqQuotes);
        setTimeout(() => {
          bottomRef.current.refresh();
        }, 0);
      })

    // setCurrentQuote(quotes[1]);
    // setShare(quotes[1])
    // initTop(1);
  };
  const initTop = (index = 0, quotes) => {
    const isOne = quotes.length <= 1;
    let topSwiper = new Swiper('#swiper-top', {
      initialSlide: index,
      slidesPerView: isOne ? 1 : 'auto',
      spaceBetween: isOne ? 0 : 10,
      observer: true, //修改swiper自己或子元素时，自动初始化swiper
      observeParents: true, //修改swiper的父元素时，自动初始化swiper
      on: {
        click: function () { },
        transitionEnd: function () {
          if (!topSwiper) return;
          const newQuote = { ...quotes[topSwiper.snapIndex] };
          setCurrentQuote(newQuote)
          setShare(newQuote);
        }
      },
      pagination: {
        el: '#swiper-top-pagination',
        clickable: true,
        bulletClass: 'swiper-ppb-default',
        bulletActiveClass: 'swiper-ppb-active',
        renderBullet: function (index, className) {
          return '<div class="' + className + '"></div>';
        },
      },
    });
  };
  const submit = () => {
    history.push(`/PublicAutomobile/insure?quoteResultId=${currentQuote.id}`);
  };
  const { riskJson: { bizSuiteInfo, efcSuiteInfo, taxSuiteInfo } } = currentQuote;
  const [navVisible, setNavVisible] = useState(false);


  return <div className={styles.con}>
    <Mask visible={navVisible} onMaskClick={() => {
      setNavVisible(false);
    }}>
      <div className={styles.navCon} onClick={() => setNavVisible(false)}>
        <div>立即分享给好友吧</div>
        <div>点击屏幕右上角「···」将本页面分享给好友</div>
        <img src={require('../images/sharenav.png')} />
      </div>

    </Mask>
    {quotes.length >= 2 && <Ball up="PK" upSize=".28rem" down="对比" onClick={() => {
      history.push('/PublicAutomobile/quote/pk');
    }} />}
    <div style={{ width: '100%', marginBottom: '.38rem',position:'relative' }}>
      <div className="swiper-container" id="swiper-top" >
        <div className="swiper-wrapper" style={{ width: '100%' }}>
          {quotes.map((quote, index) => (
            <div className={'swiper-slide'} style={{ width: quotes.length <= 1 ? '100%' : '70%' }} key={index}>
              {
                quotes.length <= 1 ? <div className={styles.bannerItem}>
                  <img src={quote.icLogo} />
                  <span>{quote.accountName}</span>
                  <span>￥{quote.fee}</span>
                </div> : <div className={styles.bannerItemMul}>
                  <img src={quote.icLogo} />
                  <span>{quote.accountName}</span>
                  <span>￥{quote.fee}</span>
                </div>
              }

            </div>
          ))}
        </div>

      </div>
      {quotes.length > 1 && (
          <div
            id='swiper-top-pagination'
            className="swiper-pagination"
          ></div>
        )}
    </div>

    <Space direction='vertical' style={{ '--gap': '.2rem', width: '100%' }}>
      {efcSuiteInfo && efcSuiteInfo.discountCharge && <Card
        leftExtra="交强险"
        rightExtra={
          <span>￥{((efcSuiteInfo?.discountCharge ?? 0) + (taxSuiteInfo?.charge ?? 0)).toFixed(2)}</span>
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
      <Card leftExtra="报价信息">
        <List.Item extra={<span>{car.carLicenseNo}</span>}>车牌号</List.Item>
        <List.Item extra={<span>{car.owner}</span>}>车主姓名</List.Item>
        {efcSuiteInfo && efcSuiteInfo.discountCharge &&
          <List.Item extra={<span>{currentQuote.jqStartDate}</span>}>交强险起保日期</List.Item>
        }

        {bizSuiteInfo && bizSuiteInfo.discountCharge &&
          <List.Item extra={<span>{currentQuote.syStartDate}</span>}>商业险起保日期</List.Item>
        }
        <List.Item extra={<span>{currentQuote.accountName}</span>}>报价账号</List.Item>
      </Card>
    </Space>

    <Bottom ref={bottomRef}>
      <div className={styles.bottom}>
        <div className={styles.share} onClick={() => setNavVisible(true)}>分享</div>
        <div className={styles.submit} onClick={submit}>确定价格，去投保</div>
      </div>
    </Bottom>

  </div>
}
const FormIndex = createForm()(Index);
const routerTrackIndex = routerTrack({ id: 'pageQuoteDetail', autoStart: false })(FormIndex);

export default connect(({ publicautomobile, publichome }) => ({ publicautomobile, publichome }))(
  routerTrackIndex,
);
