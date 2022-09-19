/**
 * title: 个人业绩
 */

import React, { Component } from 'react';
import { PullToRefresh, InfiniteScroll } from 'antd-mobile-v5';
import { connect } from 'dva';
import { history } from 'umi';
import { Link } from 'umi';
import Loading from '@/components/Loading/spotLoading';
import moment from 'moment';
import styles from './performance.scss';

@connect(({ my }) => ({
  my,
}))
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShow: false,
      currentBeginDate: null,
      currentEndDate: null,
      list: null,
      page: 1,
      height: document.documentElement.clientHeight,
      total: 0,
      navType: 1,
      carList: null,
      carTotalPremium: '0.00',
      carTotal: 0
    };
  }

  async componentDidMount() {
    await this.setState({
      currentBeginDate: moment().startOf('month').format('YYYY-MM-DD'),
      currentEndDate: moment().format('YYYY-MM-DD'),
    });

    this.initCalendar();

    const { location: { query: { nav: navType = 1 } } } = this.props;
    this.setState({ navType: Number(navType) })
    if (navType == 1) {
      this.initCarList();
    } else if (navType == 2) {
      this.initLifeList();
    }

    document.addEventListener("keydown", this.onkeydownListener);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onkeydownListener);
  }

  // 回车查询
  onkeydownListener = () => {
    const keyCode = window.event.keyCode;
    const { navType, searchCarStr, searchLifeStr } = this.state;
    if (keyCode === 13) {
      if (navType == 1) {
        this.initCarList({ searchStr: searchCarStr });
      } else if (navType == 2) {
        this.initLifeList({ applicantName: searchLifeStr });
      }
    }
    // alert(window.event.keyCode)
  }

  isShowChange() {
    this.setState({ isShow: !this.state.isShow });
  }
  initCalendar(datetype, type) {
    let currentDate;
    if (datetype && type) {
      if (type == 'add') {
        currentDate = moment(this.state.currentDate).add(1, datetype)._d;
      } else {
        currentDate = moment(this.state.currentDate).subtract(1, datetype)._d;
      }
    } else {
      currentDate = new Date();
    }
    this.setState({ currentDate });
    // 当前年
    let currentYear = currentDate.getFullYear();
    // 当前月
    let currentMonth = currentDate.getMonth() + 1;
    // 当天
    let currentDay = currentDate.getDate();

    let daysNumList = [31, 28 + this.leapYear(currentYear), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    let daysList = [];

    for (let i = 0; i < daysNumList[currentMonth - 1]; i++) {
      let date = new Date(currentYear, currentMonth - 1, i + 1);
      let weekNum = date.getDay();

      let day = {
        date: date,
        dateFormat: moment(date).format('YYYY-MM-DD'),
        disabled: false, //未来的日期变灰显示
        day: i + 1,
        weekNum: weekNum, //星期几
      };
      if (i === 0) {
        this.setState({ day });
      }
      daysList.push(day);
    }
    this.setState({ daysList });
  }

  leapYear(year) {
    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
      return true;
    } else {
      return false;
    }
  }

  supplementArr(num, type) {
    if ((num && num < 6) || num == 0) {
      let arr = [];
      if (type == 'sub') {
        arr = Array.from(new Array(num + 1).keys()).reverse();
        arr.pop();
      } else {
        let newNum = num != 1 ? 6 - num : 4;
        arr = Array.from(new Array(newNum + 1).keys());
        arr.shift();
      }
      return arr;
    }
    return [];
  }

  dataClick(item) {
    let currentBeginDate = this.state.currentBeginDate;
    let currentEndDate = this.state.currentEndDate;
    const { navType } = this.state;
    if (currentBeginDate && currentEndDate) {
      currentBeginDate = item.dateFormat;
      currentEndDate = null;
    } else {
      if (!currentBeginDate) {
        currentBeginDate = item.dateFormat;
      } else {
        currentEndDate = item.dateFormat;
      }
    }
    let middle;
    if (moment(currentEndDate) < moment(currentBeginDate)) {
      middle = currentBeginDate;
      currentBeginDate = currentEndDate;
      currentEndDate = middle;
    }
    if (currentBeginDate && currentEndDate) {
      this.isShowChange();
      this.setState({ currentBeginDate, currentEndDate }, () => {
        if (navType == 1) {
          this.initCarList()
        } else if (navType == 2) {
          this.initLifeList();
        }
      })
    }
    this.setState({
      currentBeginDate,
      currentEndDate,
    });
  }

  // 人身险加载更多
  loadMore = async () => {
    let { page, total } = await this.state;
    if (page >= total) {
      this.setState({ hasMore: false })
      return;
    }
    return await this.queryList({
      current: ++page
    });
  }

  // 人身险出单
  queryList(params, isInit) {
    const { dispatch } = this.props;
    let newList = this.state.list;
    console.log(200, params)
    return dispatch({
      type: 'my/orderList',
      payload: {
        applicantName: this.state.searchLifeStr,
        acceptDateMax: this.state.currentEndDate
          ? moment(this.state.currentEndDate).format('YYYY-MM-DD')
          : '',
        acceptDateMin: this.state.currentBeginDate
          ? moment(this.state.currentBeginDate).format('YYYY-MM-DD')
          : '',
        ...params,
        size: 10,
        team: false,
        performance: true,
        // policyStatus: 2,
      },
    }).then(res => {
      if (res && res.code == 200) {
        this.setState({
          list: isInit ? [...res.data.records] : newList.concat(res.data.records),
          page: res.data.current,
          total: res.data.pages,
          teamTotalOrder: res.data.total,
          teamTotalPremium: res.data.totalPremium,
          isLoading: false,
          hasMore: res.data.pages > res.data.current
        });
      }
    });
  }

  // 车险出单（没有分页）
  queryCarList(params) {
    const { dispatch } = this.props;
    const { currentBeginDate, currentEndDate, searchCarStr } = this.state;
    return dispatch({
      type: 'my/carPersonal',
      payload: {
        searchStr: searchCarStr,
        endDate: currentEndDate ? moment(currentEndDate).endOf('day').format('YYYY-MM-DD HH:mm:ss') : '',
        startDate: currentBeginDate ? moment(currentBeginDate).startOf('day').format('YYYY-MM-DD HH:mm:ss') : '',
        ...params,
      },
    }).then(res => {
      if (res && res.code == 200) {
        this.setState({
          carList: res.data.policies,
          carPage: res.data.current,
          carTotal: res.data.policyCount,
          carTotalPremium: res.data.totalPremium,
          isCarLoading: false,
        });
      } else {
        this.setState({
          carList: [],
          carTotal: 0,
          carTotalPremium: '0.00'
        })
      }
    });
  }

  navOnClick = (navType) => {
    if (navType == this.state.navType) return;
    const { location: { pathname } } = this.props;
    this.setState({ navType })
    switch (navType) {
      case 1:
        this.initCarList();
        break;
      case 2:
        this.initLifeList();
        break;
    }
    history.replace(`${pathname}?nav=${navType}`)
  }

  // 人身险出单list query
  initLifeList = async (params, refresh) => {
    const initData = {
      page: 0,
      total: 0,
      isLoading: false,
    }
    if (!refresh) initData.list = null; // 下拉刷新不清空
    await this.setState(initData)
    this.queryList({
      ...params,
      current: 1
    }, true);
  }

  // 车险
  initCarList = async (params, refresh) => {
    const initData = {
      carPage: 1,
      isLoading: false
    }
    if (!refresh) initData.carList = null; // 下拉刷新不清空
    await this.setState(initData)
    this.queryCarList({
      ...params
    });
  }

  // 车险出单list render
  renderCarList = () => {
    const { carList } = this.state;
    return carList == null ? <div className={styles.loading}><Loading /></div> :
      <PullToRefresh
        onRefresh={async () => {
          await this.initCarList({}, true);
        }}
        refreshingText={<Loading />}
        pullingText={<Loading />}
        canReleaseText={<Loading />}
        completeText={<Loading />}
      >    <div
        className={styles.list}
        style={{
          height: 'calc(100vh - 5.07rem)',
          overflowY: 'auto',
          marginTop: '.2rem'
        }}
      >
          <div ref={el => (this.ptr = el)}>
            {carList?.map((item, index) => {
              return (
                <Link to={`/order/car/policy?policyId=${item.policyId}`} className={styles.item}>
                  <div className={styles.top}>
                    <div className={styles.right}>
                      <img src={item.icLogo} className={styles.image}></img>
                      <div className={styles.name}>{item.icShortName}</div>
                    </div>
                    <div className={styles.status}>{item.status}</div>
                  </div>
                  <div className={styles.line}></div>
                  <div className={styles.bottom}>
                    <div className={styles.one}>
                      <div className={styles.content}>车牌号：{item.carLicenseNo}</div>
                      <div className={styles.content}>
                        车主：{item.carOwner}
                      </div>
                    </div>
                    <div className={styles.two}>
                      <div className={styles.content}>被保人：{item.insuredName}</div>
                      <div className={styles.content}>
                        承保时间：{item.insuredDate}
                      </div>
                    </div>
                    <div className={styles.three}>
                      <div className={styles.content}>保&nbsp;&nbsp;费：<span className={styles.price}>¥ <b>{item.premiumYuan}</b></span></div>
                    </div>
                  </div>
                </Link>
              );
            })}
            {carList && carList.length > 0 && (
              <div className={styles.finish}>没有更多</div>
            )}
            {carList && carList.length == 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginTop: '1.8rem',
                }}
              >
                <img
                  style={{ width: '2.8rem', height: 'auto' }}
                  src={require('@/assets/empty.png')}
                />
                <span className={styles.emptyValue}>暂无内容</span>
              </div>
            )}
          </div>
        </div>
      </PullToRefresh>
  }

  // 人身险出单list render
  renderLifeList = () => {
    const { list, total } = this.state;
    return list == null ? <div className={styles.loading}><Loading /></div> :
      <div
        style={{
          height: 'calc(100vh - 5.07rem)',
          overflowY: 'auto',
          marginTop: '.2rem'
        }}>
        <PullToRefresh
          onRefresh={async () => {
            await this.initLifeList({}, true);
          }}
          refreshingText={<Loading />}
          pullingText={<Loading />}
          canReleaseText={<Loading />}
          completeText={<Loading />}
        >
          <div>
            <div ref={el => (this.ptr = el)}>
              {list?.map((item, index) => {
                return (
                  <Link to={`/order/life/detail?policyId=${item.policyId}`} className={styles.item}>
                    <div className={styles.top}>
                      <div className={styles.right}>
                        <img src={item.logoPath} className={styles.image}></img>
                        <div className={styles.name}>{item.productName}</div>
                      </div>
                      <div className={styles.status}>{item.policyStatusName}</div>
                    </div>
                    <div className={styles.line}></div>
                    <div className={styles.bottom}>
                      <div className={styles.one}>
                        <div className={styles.content}>投保人：{item.applicantName}</div>
                        <div className={styles.content}>
                          被保人：{item.insuredName}
                        </div>
                      </div>
                      <div className={styles.two}>
                        <div className={styles.content}>投保时间：{item.insureDate}</div>
                        <div className={styles.content}>
                          承保时间：{item.acceptDate}
                        </div>
                      </div>
                      <div className={styles.three}>
                        <div className={styles.content}>保&nbsp;&nbsp;&nbsp;&nbsp;费：<span className={styles.price}>¥ <b>{item.premium}</b></span></div>
                      </div>
                    </div>
                  </Link>
                );
              })}
              {list && list.length == 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '1.8rem',
                  }}
                >
                  <img
                    style={{ width: '2.8rem', height: 'auto' }}
                    src={require('@/assets/empty.png')}
                  />
                  <span className={styles.emptyValue}>暂无内容</span>
                </div>
              )}
            </div>
            <InfiniteScroll loadMore={this.loadMore} hasMore={this.state.hasMore}>
              {this.state.hasMore ? <Loading /> : <p>{!!(total > 0) && '没有更多'}</p>}

            </InfiniteScroll>
          </div>
        </PullToRefresh></div>

  }

  render() {
    const {
      isShow,
      day = {},
      daysList = [],
      currentDate,
      currentBeginDate,
      currentEndDate,
      teamTotalOrder = 0,
      teamTotalPremium = 0,
      navType,
      carTotalPremium,
      carTotal,
      carList
    } = this.state;
    return (
      <div className={styles.personnelPerformance}>
        <div className={styles.header}>
          <div className={styles.left}>
            承保时间：{currentBeginDate?.replace(/-/g, '.')}-{currentEndDate?.replace(/-/g, '.')}
          </div>
          <div
            className={styles.right}
            onClick={() => {
              this.isShowChange();
            }}
          >
            <span style={{ color: `${isShow ? '#0065ff' : ''}` }}>筛选</span>
            {isShow ? <img src={require('../assets/img/activeCalendar.png')} /> : <img src={require('../assets/img/calendar.png')} />}
          </div>
        </div>
        <div className={styles.navTabs}>
          <p className={navType === 1 && styles.active} onClick={() => this.navOnClick(1)}>车险出单明细</p>
          <p className={navType === 2 && styles.active} onClick={() => this.navOnClick(2)}>人身出单明细</p>
        </div>
        {navType === 1 && <>
          <div className={styles.data}>
            <div className={styles.premium}>
              <div className={styles.premiumTitle}>保费(元)</div>
              <div className={styles.premiumNumber}>{carTotalPremium}</div>
            </div>
            <div className={styles.issue}>
              <div className={styles.issueTitle}>出单</div>
              <div className={styles.issueNumber}>{carTotal}</div>
            </div>
          </div>
          <div className={styles.searchInput}>
            <img src={require('../assets/image/search.png')} />
            <input value={this.state.searchCarStr} onChange={({ target: { value } }) => this.setState({ searchCarStr: value })} placeholder='请输入车牌、车主或被保人关键字' />
          </div>
          {this.renderCarList()}
        </>}
        {navType === 2 && <>
          <div className={styles.data}>
            <div className={styles.premium}>
              <div className={styles.premiumTitle}>保费(元)</div>
              <div className={styles.premiumNumber}>{teamTotalPremium}</div>
            </div>
            <div className={styles.issue}>
              <div className={styles.issueTitle}>出单</div>
              <div className={styles.issueNumber}>{teamTotalOrder}</div>
            </div>
          </div>
          <div className={styles.searchInput}>
            <img src={require('../assets/image/search.png')} />
            <input value={this.state.searchLifeStr} onChange={({ target: { value } }) => this.setState({ searchLifeStr: value })} placeholder='请输入投保人或被保人关键字' />
          </div>
          {this.renderLifeList()}
        </>}

        {isShow && (
          <div className={styles.search}>
            <div className={styles.container}>
              <div className={styles.searchheader}>
                <div className={styles.left}>
                  <img
                    onClick={() => {
                      this.initCalendar('years', 'sub');
                    }}
                    style={{ transform: 'rotate(180deg)' }}
                    src={require('../assets/img/arrow-right.png')}
                  />
                  <span>{currentDate && currentDate.getFullYear()}年</span>
                  <img
                    onClick={() => {
                      this.initCalendar('years', 'add');
                    }}
                    src={require('../assets/img/arrow-right.png')}
                  />
                </div>
                <div className={styles.middle}>
                </div>
                <div className={styles.right}>
                  <img
                    onClick={() => {
                      this.initCalendar('months', 'sub');
                    }}
                    style={{
                      transform: 'rotate(180deg)',
                    }}
                    src={require('../assets/img/arrow-right.png')}
                  />
                  <span>{currentDate && currentDate.getMonth() + 1}月</span>
                  <img
                    onClick={() => {
                      this.initCalendar('months', 'add');
                    }}
                    src={require('../assets/img/arrow-right.png')}
                  />
                </div>
              </div>
              <div className={styles.week}>
                <div>周日</div>
                <div>周一</div>
                <div>周二</div>
                <div>周三</div>
                <div>周四</div>
                <div>周五</div>
                <div>周六</div>
                {this.supplementArr(day && day.weekNum, 'sub').map((item, index) => {
                  return (
                    <div style={{ color: '#C1C6CE' }}>
                      {moment(day && day.date)
                        .subtract(item, 'days')
                        .date()}
                    </div>
                  );
                })}
                {daysList &&
                  daysList.map((item, index) => {
                    return (
                      <div
                        className={styles.bigBox}
                      // style={{
                      //     background: `${moment(currentEndDate) >
                      //         moment(item.date) &&
                      //         moment(currentBeginDate) <
                      //             moment(item.date) &&
                      //         'rgba(0, 101, 255, 0.1)'}`,
                      // }}
                      >
                        <div
                          onClick={() => {
                            this.dataClick(item);
                          }}
                          style={{
                            color: `${item.disabled ? '#C1C6CE' : ''}`,
                          }}
                          className={`${currentBeginDate == item.dateFormat &&
                            styles.current} ${currentEndDate == item.dateFormat &&
                            styles.current} ${moment(currentEndDate) > moment(item.date) &&
                            moment(currentBeginDate) < moment(item.date) &&
                            styles.after}`}
                        >
                          {item.day}
                        </div>
                      </div>
                    );
                  })}
                {this.supplementArr(
                  daysList.length > 0 && daysList[daysList.length - 1].weekNum,
                  'add',
                ).map((item, index) => {
                  return (
                    <div style={{ color: '#C1C6CE' }}>
                      {daysList[daysList.length - 1] &&
                        moment(daysList[daysList.length - 1].date)
                          .add(item, 'days')
                          .date()}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {isShow && <div onClick={() => { this.isShowChange() }} className={styles.mask}></div>}
      </div>
    );
  }
}

export default Index;
