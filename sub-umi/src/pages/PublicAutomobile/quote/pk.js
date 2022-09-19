/**选择保司*/
import { connect } from 'dva';
import React, { useState, useEffect, useRef } from 'react';
import { Switch } from 'antd-mobile-v5';
import styles from './pk.scss';
import utils from '@/utils/utils';
import get from 'lodash/get';
import routerTrack from '@/components/routerTrack';


import * as requestMethodsAutomobile from '@/services/publicAutomobile';
const { generalRequest } = utils;

function Index(props) {
  const [quotes, setQuotes] = useState([
    // { "id": "1501737201381736449", "quoteTime": "2022-03-10 09:50:24", "icShortName": "阳光财险", "accountName": "阳光EDI新0308阳光EDI新0308阳光EDI新0308阳光EDI新0308阳光EDI新0308", "icLogo": "https://pengpaibao-src.oss-cn-beijing.aliyuncs.com/dev1/1646188186269QKxBb.png", "jqStartDate": "2022-03-13 00:00:00", "jqEndDate": "2023-03-12 23:59:59", "syStartDate": "2022-03-13 00:00:00", "syEndDate": "2023-03-12 00:00:00", "fee": 1699.69, "riskJson": { "bizSuiteInfo": { "discountRate": 1, "suites": [{ "amount": 500000, "showAmount": "50万", "code": "ThirdParty", "orgCharge": 329.69, "discountCharge": 329.69, "showCharge": "329.69元", "name": "三者险" }], "start": "2022-03-13", "end": "2023-03-12", "discountCharge": 329.69 }, "efcSuiteInfo": { "discountRate": 1, "amount": 1, "discountCharge": 950, "orgCharge": 950, "start": "2022-03-13 00:00:00", "end": "2023-03-12 23:59:59" }, "taxSuiteInfo": { "charge": 420 } } },
    // { "id": "1501737201381736447", "quoteTime": "2022-03-10 09:50:24", "icShortName": "阳光财险", "accountName": "阳光EDI新0308阳光EDI新0308阳光EDI新0308阳光EDI新0308阳光EDI新0308", "icLogo": "https://pengpaibao-src.oss-cn-beijing.aliyuncs.com/dev1/1646188186269QKxBb.png", "jqStartDate": "2022-03-13 00:00:00", "jqEndDate": "2023-03-12 23:59:59", "syStartDate": "2022-03-13 00:00:00", "syEndDate": "2023-03-12 00:00:00", "fee": 1699.69, "riskJson": { "bizSuiteInfo": { "discountRate": 1, "suites": [{ "amount": 500000, "showAmount": "50万", "code": "ThirdParty", "orgCharge": 329.69, "discountCharge": 329.69, "showCharge": "329.69元", "name": "三者险" }], "start": "2022-03-13", "end": "2023-03-12", "discountCharge": 329.69 }, "efcSuiteInfo": { "discountRate": 1, "amount": 1, "discountCharge": 950, "orgCharge": 950, "start": "2022-03-13 00:00:00", "end": "2023-03-12 23:59:59" }, "taxSuiteInfo": { "charge": 420 } } },
    // { "id": "1501737201411096578", "quoteTime": "2022-03-10 09:50:24", "icShortName": "平安财险", "accountName": "edi0308PA", "icLogo": "https://pengpaibao-src.oss-cn-beijing.aliyuncs.com/dev1/1646188265668NRRDs.png", "jqStartDate": "2022-03-13 00:00:00", "jqEndDate": "2023-03-12 23:59:59", "syStartDate": "2022-03-13 00:00:00", "syEndDate": "2023-03-12 00:00:00", "fee": 1988.52, "riskJson": { "bizSuiteInfo": { "discountRate": 1.097781, "suites": [{ "amount": 500000, "showAmount": "50万", "code": "ThirdParty", "orgCharge": 618.08, "discountCharge": 678.52, "showCharge": "678.52元", "name": "三者险" }], "start": "2022-03-13", "end": "2023-03-12", "discountCharge": 678.52 }, "efcSuiteInfo": { "discountRate": 1, "amount": 1, "discountCharge": 950, "orgCharge": 950, "start": "2022-03-13 00:00:00", "end": "2023-03-12 23:59:59" }, "taxSuiteInfo": { "charge": 360 } } },
    // { "id": "1501737201411096531", "quoteTime": "2022-03-10 09:50:24", "icShortName": "平安财险", "accountName": "edi0308PA", "icLogo": "https://pengpaibao-src.oss-cn-beijing.aliyuncs.com/dev1/1646188265668NRRDs.png", "jqStartDate": "2022-03-13 00:00:00", "jqEndDate": "2023-03-12 23:59:59", "syStartDate": "2022-03-13 00:00:00", "syEndDate": "2023-03-12 00:00:00", "fee": 1988.52, "riskJson": { "bizSuiteInfo": { "discountRate": 1.097781, "suites": [{ "amount": 500000, "showAmount": "50万", "code": "ThirdParty", "orgCharge": 618.08, "discountCharge": 678.52, "showCharge": "678.52元", "name": "三者险" }], "start": "2022-03-13", "end": "2023-03-12", "discountCharge": 678.52 }, "efcSuiteInfo": { "discountRate": 1, "amount": 1, "discountCharge": 950, "orgCharge": 950, "start": "2022-03-13 00:00:00", "end": "2023-03-12 23:59:59" }, "taxSuiteInfo": { "charge": 360 } } },
    // { "id": "1501737201411096532", "quoteTime": "2022-03-10 09:50:24", "icShortName": "平安财险", "accountName": "edi0308PA", "icLogo": "https://pengpaibao-src.oss-cn-beijing.aliyuncs.com/dev1/1646188265668NRRDs.png", "jqStartDate": "2022-03-13 00:00:00", "jqEndDate": "2023-03-12 23:59:59", "syStartDate": "2022-03-13 00:00:00", "syEndDate": "2023-03-12 00:00:00", "fee": 1988.52, "riskJson": { "bizSuiteInfo": { "discountRate": 1.097781, "suites": [{ "amount": 500000, "showAmount": "50万", "code": "ThirdParty", "orgCharge": 618.08, "discountCharge": 678.52, "showCharge": "678.52元", "name": "三者险" }], "start": "2022-03-13", "end": "2023-03-12", "discountCharge": 678.52 }, "efcSuiteInfo": { "discountRate": 1, "amount": 1, "discountCharge": 950, "orgCharge": 950, "start": "2022-03-13 00:00:00", "end": "2023-03-12 23:59:59" }, "taxSuiteInfo": { "charge": 360 } } },
  ]);
  const [car, setCar] = useState({ "carLicenseNo": "鲁A1245D", "owner": "李康华", "modelStr": "长安SC7200C轿车/5/豪华型/2008/93800", "standardFullName": "长安SC7200C轿车" });
  const [isFixed, setIsFixed] = useState(false);
  const [ding, setDing] = useState();
  const tableHeaderRef = useRef();
  const tableBodyRef = useRef();
  const scrollRef = useRef();
  useEffect(() => {
    document.title = 'PK对比';
    props.trackStart(localStorage.quoteRes);

    initData();
    window.onscroll = function (e) {
      var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;;
      if (scrollTop > 0) {
        if (!isFixed) setIsFixed(true)
      } else {
        setIsFixed(false);
      }
    };
    tableBodyRef.current.addEventListener('touchstart', () => {
      scrollRef.current = 'body';
    });
    tableHeaderRef.current.addEventListener('touchstart', () => {
      scrollRef.current = 'header';
    });
    tableBodyRef.current.addEventListener('scroll', () => {
      if (scrollRef.current === 'body') {
        tableHeaderRef.current.scrollLeft = tableBodyRef.current.scrollLeft;
      }
    });
    tableHeaderRef.current.addEventListener('scroll', () => {
      if (scrollRef.current === 'header') {
        tableBodyRef.current.scrollLeft = tableHeaderRef.current.scrollLeft;
      }
    });
  }, []);

  const [suiteNameArr, setSuiteNameArr] = useState([]);
  const initData = () => {
    generalRequest({ quoteId: localStorage.quoteRes }, requestMethodsAutomobile.details)
      .then(res => {
        setQuotes(res.data.quotes);
        setCar(res.data.car);
        initSuites(res.data.quotes);
      })
    // initSuites(quotes);
  };
  /**险别明细name*/
  const initSuites = (initQuotes) => {
    let suiteNameArr = [];
    initQuotes.forEach((quote, index) => {
      let nameArr = quote.riskJson?.bizSuiteInfo?.suites?.map?.(suite => suite.name);
      suiteNameArr = suiteNameArr.concat(nameArr);
    })
    suiteNameArr = Array.from(new Set(suiteNameArr));
    setSuiteNameArr(suiteNameArr);
  };

  const rendercolgroup = () => {
    return <colgroup>
      <col width={90} />
      {quotes.map((quote, index) => {
        return <col key={index} width={130} />
      })}
    </colgroup>
  }

  /**是否展示某个险别明细*/
  const isShowSuite = (path, name) => {
    //找到第一个报价的此险别的费用做对比
    const preSuites = get(quotes[0], path);
    const preObj = preSuites?.find(item => item.name === name);

    const hasDiff = quotes.some(quote => {
      const currentSuite = get(quote, path)?.find(suite => suite.name === name);
      return currentSuite?.discountCharge !== preObj?.discountCharge;
    });
    return hasDiff || (!hasDiff && !hideSame);
  };

  /**是否展示某个模块*/
  const isShowModel = (path) => {
    //是否存在摸个模块
    const existModel = quotes.find(item => !!get(item, path, undefined));
    //每个模块是否相同
    if (existModel) {
      const preVal = get(existModel, path);
      const hasDiff = quotes.some(item => get(item, path, undefined) !== preVal);
      return hasDiff || (!hasDiff && !hideSame);
    }
    return false;
  };

  const [hideSame, setHideSame] = useState(false);
  const switchProps = {
    style: {
      marginTop: '.16rem',
      '--width': '.8rem',
      '--height': '.5rem',
      '--border-width': '.02rem',
      '--checked-color': 'linear-gradient(270deg, #0AB88D 0%, #5B8EFF 100%)'
    }
  };

  const getTdProps = (quote) => {

    return {
      className: quote.id === ding ? styles.dingTd : ''
    }
  }

  const tableWidth = 90 + quotes.length * 130;
  return <>
    <div className={styles.con} style={{ display: quotes.length > 0 ? 'block' : 'none' }}>
      <div ref={tableHeaderRef} className={styles.tableHeaderCon} style={{ position: isFixed ? 'fixed' : 'relative' }}>
        <table style={{ width: `${tableWidth}px` }}>
          {rendercolgroup()}
          <tbody>
            <tr>
              <td style={{ zIndex: '2' }}>
                <div>隐藏相同</div>
                <Switch {...switchProps} onChange={(val) => {
                  setHideSame(val)
                }} />
              </td>
              {quotes.map((quote, index) => {
                return <td key={index} className={quote.id === ding ? `${styles.headerTd} ${styles.dingTd}` : styles.headerTd}>
                  <div className={styles.logoCon}>
                    <img className={styles.logo} src={quote.icLogo} />
                    <div className={styles.mid}>
                      <span>{quote.accountName}</span>
                      <span>￥{quote.fee}</span>
                    </div>
                  </div>

                  <div className={quote.id === ding ? styles.dingConActive : styles.dingCon} onClick={() => {
                    if (quote.id === ding) {
                      setDing(null)
                    } else {
                      setQuotes(quotes.sort((a, b) => {
                        if (a.id === quote.id) {
                          return -1;
                        }
                        if (b.id === quote.id) {
                          return 1;
                        }
                        return 0;
                      }))
                      setDing(quote.id);
                    }
                  }}>
                    <img src={quote.id === ding ? require('../images/ding-active.png') : require('../images/ding.png')} />
                    <span>钉住</span>
                  </div>
                </td>
              })}
            </tr>
          </tbody>
        </table>
      </div>
      {isFixed && <div style={{ width: '100%', height: '1.7rem' }}></div>
      }
      <div className={styles.tableBodyCon} ref={tableBodyRef} >
        <table style={{ width: `${tableWidth}px` }} >
          {rendercolgroup()}
          <tbody>
            <tr><td className={styles.infoTd}>报价信息</td></tr>
            {!hideSame &&
              <tr><td>报价车型</td>
                {quotes.map((quote, index) => {
                  return <td {...getTdProps(quote)} key={index}>{car.modelStr}</td>
                })}
              </tr>
            }

            {isShowModel('jqStartDate') &&
              <tr><td>交强险保期</td>
                {quotes.map((quote, index) => {
                  return <td {...getTdProps(quote)} key={index}>{quote.jqStartDate} 至 {quote.jqEndDate}</td>
                })}
              </tr>}

            {isShowModel('syStartDate') &&
              <tr><td>商业险保期</td>
                {quotes.map((quote, index) => {
                  return <td {...getTdProps(quote)} key={index}>{quote.syStartDate} 至 {quote.syEndDate}</td>
                })}
              </tr>
            }

            <tr><td className={styles.infoTd}>保费总览</td></tr>
            {isShowModel('riskJson.efcSuiteInfo.discountCharge') &&
              <tr><td>交强险保费</td>
                {quotes.map((quote, index) => {
                  return <td {...getTdProps(quote)} key={index}>{quote.riskJson?.efcSuiteInfo?.discountCharge ?? ''}</td>
                })}
              </tr>
            }
            {isShowModel('riskJson.taxSuiteInfo.charge') &&
              <tr><td>车船税</td>
                {quotes.map((quote, index) => {
                  return <td {...getTdProps(quote)} key={index}>{quote.riskJson?.taxSuiteInfo?.charge ?? ''}</td>
                })}
              </tr>
            }
            {isShowModel('riskJson.bizSuiteInfo.discountCharge') &&
              <tr><td>商业险保费</td>
                {quotes.map((quote, index) => {
                  return <td {...getTdProps(quote)} key={index}>{quote.riskJson?.bizSuiteInfo?.discountCharge ?? ''}</td>
                })}
              </tr>
            }

            {suiteNameArr.length > 0 &&
              <>
                <tr><td className={styles.infoTd}>险别明细</td></tr>
                {
                  suiteNameArr.filter(item => isShowSuite('riskJson.bizSuiteInfo.suites', item)).map((name, index) => {
                    return <tr key={index}><td>{name}</td>
                      {quotes.map((quote, index) => {
                        let suiteItem = quote.riskJson?.bizSuiteInfo?.suites?.find(suite => suite.name === name);
                        return <td {...getTdProps(quote)} key={index}>{suiteItem ? suiteItem.discountCharge : ''}</td>
                      })}
                    </tr>
                  }
                  )
                }

              </>
            }

          </tbody>
        </table>
      </div>

    </div>
  </>
}
const routerTrackIndex = routerTrack({ id: 'pagePK', autoStart: false })(Index);

export default connect(({ publicautomobile, publichome }) => ({ publicautomobile, publichome }))(
  routerTrackIndex,
);
