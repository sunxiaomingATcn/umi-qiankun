/**
 * title: 团队业绩
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Toast, ActivityIndicator, Button, DatePicker, List } from 'antd-mobile';
import styles from './detail.scss';
import moment from 'moment';
import { history } from 'umi';

@connect(({ my }) => ({
  my,
}))
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rankCurrent: 1,
      datatype: ['日', '周', '月', '年'],
      current: null,
      teamRankList: [],
      page: 1,
    };
  }

  componentDidMount() {
    this.setState({
      currentBeginDate: moment()
        .startOf('months')
        .format('YYYY-MM-DD'),
      currentEndDate: moment().format('YYYY-MM-DD'),
    });
    this.initCalendar();
    this.teamRankList({
      insureDateBegin: moment()
        .startOf('months')
        .format('YYYY-MM-DD'),
      insureDateEnd: moment().format('YYYY-MM-DD'),
    });
  }

  rankTabsCick(newCurrent) {
    this.setState(
      {
        rankCurrent: newCurrent,
        teamRankList: [],
      },
      () => {
        this.teamRankList({
          insureDateBegin: this.state.currentBeginDate,
          insureDateEnd: this.state.currentEndDate,
          desc: newCurrent == 1 ? 'premiumInCents' : 'policyCount',
        });
      },
    );
  }

  tagsClick(index) {
    let currentBeginDate, currentEndDate;
    switch (index) {
      case 0:
        currentBeginDate = moment().format('YYYY-MM-DD');
        currentEndDate = moment().format('YYYY-MM-DD');
        break;
      case 1:
        currentBeginDate = moment(moment().startOf('weeks'))
          .add(1, 'days')
          .format('YYYY-MM-DD');
        currentEndDate = moment().format('YYYY-MM-DD');
        break;
      case 2:
        currentBeginDate = moment()
          .startOf('months')
          .format('YYYY-MM-DD');
        currentEndDate = moment().format('YYYY-MM-DD');
        break;
      case 3:
        currentBeginDate = moment()
          .startOf('years')
          .format('YYYY-MM-DD');
        currentEndDate = moment().format('YYYY-MM-DD');
        break;
      default:
        break;
    }
    this.teamRankList({
      insureDateBegin: currentBeginDate,
      insureDateEnd: currentEndDate,
      desc: this.state.rankCurrent == 1 ? 'premiumInCents' : 'policyCount',
    });
    this.setState({
      current: index,
      currentBeginDate,
      currentEndDate,
    });
  }

  isShowChange() {
    this.setState({ isShow: !this.state.isShow });
  }

  teamRankList(params = {}, flag = false) {
    const { dispatch } = this.props;
    let list = JSON.parse(JSON.stringify(this.state.teamRankList));
    dispatch({
      type: 'my/teamRankList',
      payload: {
        desc: 'premiumInCents',
        ...params,
        size: 10,
      },
    }).then(res => {
      if (res && res.code == 200) {
        let newlist = list;
        if (flag) {
          newlist.concat(res.data.records);
        } else {
          newlist = res.data.records;
        }
        this.setState({
          page: res.data.current,
          totalPages: res.data.pages,
          teamRankList: newlist,
          teamTotalOrder: res.data.teamTotalOrder,
          teamTotalPremium: res.data.teamTotalPremium,
        });
      }
    });
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

  lookMore() {
    if (this.state.page >= this.state.totalPages) {
      Toast.info('没有更多数据了');
    } else {
      this.teamRankList(
        {
          current: ++this.state.page,
          insureDateBegin: this.state.currentBeginDate,
          insureDateEnd: this.state.currentEndDate,
          desc: this.state.rankCurrent == 1 ? 'premiumInCents' : 'policyCount',
        },
        true,
      );
    }
  }

  dataClick(item) {
    let currentBeginDate = this.state.currentBeginDate;
    let currentEndDate = this.state.currentEndDate;
    let flag = false;
    if (currentBeginDate && currentEndDate) {
      currentBeginDate = item.dateFormat;
      currentEndDate = null;
    } else {
      if (!currentBeginDate) {
        currentBeginDate = item.dateFormat;
      } else {
        currentEndDate = item.dateFormat;
        flag = true;
      }
    }
    let middle;
    if (moment(currentEndDate) < moment(currentBeginDate)) {
      middle = currentBeginDate;
      currentBeginDate = currentEndDate;
      currentEndDate = middle;
    }
    this.setState({
      currentBeginDate,
      currentEndDate,
      isShow: !flag,
      current: null,
    });
    if (currentBeginDate && currentEndDate)
      this.teamRankList({
        insureDateBegin: currentBeginDate,
        insureDateEnd: currentEndDate,
        desc: this.state.rankCurrent == 1 ? 'premiumInCents' : 'policyCount',
      });
  }

  render() {
    const {
      rankCurrent,
      datatype,
      current,
      isShow,
      day = {},
      daysList = [],
      currentDate,
      currentBeginDate,
      currentEndDate,
      teamTotalOrder = 0,
      teamTotalPremium = 0,
      teamRankList = [],
    } = this.state;
    return (
      <div className={styles.personneldetail}>
        <div
          className={styles.header}
          style={{ borderRadius: isShow ? '0' : '0rem 0rem 0.4rem 0.4rem' }}
        >
          <div className={styles.left}>
            筛选时间：{currentBeginDate} ~ {currentEndDate}
          </div>
          <div
            className={styles.right}
            onClick={() => {
              this.isShowChange();
            }}
          >
            <span style={{ color: `${isShow ? '#0065ff' : ''}` }}>筛选</span>
            {isShow ? (
              <img src={require('../assets/img/activeCalendar.png')} />
            ) : (
              <img src={require('../assets/img/calendar.png')} />
            )}
          </div>
        </div>
        <div
          className={styles.data}
          onClick={() => {
            if (localStorage.getItem('entrySequence') == 2)
              history.push({ pathname: '/My/performance' });
          }}
        >
          <div className={styles.premium}>
            <div className={styles.premiumTitle}>团队保费(元)</div>
            <div className={styles.premiumNumber}>{teamTotalPremium}</div>
          </div>
          <div className={styles.issue}>
            <div className={styles.issueTitle}>团队出单</div>
            <div className={styles.issueNumber}>{teamTotalOrder}</div>
          </div>
          {localStorage.getItem('entrySequence') == 2 && (
            <img className={styles.more} src={require('../assets/img/more.png')} />
          )}
        </div>
        <div className={styles.rank}>
          <div className={styles.title}>排行榜</div>
          <div className={styles.header} style={{ padding: '0' }}>
            <div className={styles.left}>
              筛选时间：{currentBeginDate} ~ {currentEndDate}
            </div>
            <div
              className={styles.right}
              onClick={() => {
                this.isShowChange();
              }}
            >
              筛选
              <img src={require('../assets/img/calendar.png')} />
            </div>
          </div>
          <div className={styles.tags}>
            {datatype.map((item, index) => {
              return (
                <div
                  onClick={() => {
                    this.tagsClick(index);
                  }}
                  className={index == current ? styles.current : ''}
                >
                  {item}
                </div>
              );
            })}
          </div>
          <div className={styles.rankTabs}>
            <div
              onClick={() => {
                this.rankTabsCick(1);
              }}
              className={rankCurrent == 1 ? styles.rankCurrent : styles.rankNormal}
            >
              保单业绩
            </div>
            <div
              onClick={() => {
                this.rankTabsCick(2);
              }}
              className={rankCurrent == 2 ? styles.rankCurrent : styles.rankNormal}
            >
              保单件数
            </div>
          </div>
          <div className={styles.table}>
            <ul className={styles.rankList}>
              <li className={styles.rankNumber} style={{ visibility: 'hidden' }}>
                <img src={require(`../assets/img/1.png`)} />
              </li>
              <li style={{ width: '20%', textAlign: 'center' }}>排名</li>
              <li style={{ width: '40%', textAlign: 'center' }}>姓名</li>
              <li style={{ width: '40%', textAlign: 'center' }}>
                {rankCurrent == 1 ? '业绩(元)' : '件数(个)'}
              </li>
            </ul>
            {teamRankList && teamRankList.length > 0 && (
              <ul className={`${styles.rankList} ${styles.myrank}`} style={{ color: '#FF5935' }}>
                <li className={styles.rankNumber} style={{ visibility: 'hidden' }}>
                  <img src={require(`../assets/img/1.png`)} />
                </li>
                <li style={{ width: '20%', textAlign: 'center' }}>
                  {teamRankList[0] && teamRankList[0].sort}
                </li>
                <li
                  className={styles.name}
                  style={{ WebkitBoxOrient: 'vertical', width: '40%', textAlign: 'center' }}
                >
                  {teamRankList[0] && teamRankList[0].salepersonName}
                </li>
                <li style={{ width: '40%', textAlign: 'center' }}>
                  {rankCurrent == 1 ? teamRankList[0].premiumInCents : teamRankList[0].policyCount}
                </li>
              </ul>
            )}
            {teamRankList &&
              teamRankList.length > 0 &&
              teamRankList.map((item, index) => {
                if (index > 0) {
                  return (
                    <ul className={styles.rankList}>
                      <li
                        className={styles.rankNumber}
                        style={{
                          visibility: index > 0 && index <= 3 ? '' : 'hidden',
                        }}
                      >
                        {index > 0 && index <= 3 && (
                          <img src={require(`../assets/img/${index}.png`)} />
                        )}
                      </li>
                      <li style={{ width: '20%', textAlign: 'center' }}>{item.sort}</li>
                      <li
                        className={styles.name}
                        style={{ WebkitBoxOrient: 'vertical', width: '40%', textAlign: 'center' }}
                      >
                        {item && item.salepersonName}
                      </li>
                      <li style={{ width: '40%', textAlign: 'center' }}>
                        {item && rankCurrent == 1
                          ? item && item.premiumInCents
                          : item && item.policyCount}
                      </li>
                    </ul>
                  );
                }
              })}
            <div
              className={styles.lookMore}
              onClick={() => {
                this.lookMore();
              }}
            >
              ··· 查看更多
              <img src={require('../assets/img/arrow-bottom.png')} />
            </div>
          </div>
        </div>
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
                  <img
                    onClick={() => {
                      this.initCalendar('months', 'sub');
                    }}
                    style={{
                      transform: 'rotate(180deg)',
                      marginLeft: '0.1rem',
                    }}
                    src={require('../assets/img/arrow-right.png')}
                  />
                </div>
                <div className={styles.middle}>
                  {currentDate && currentDate.getFullYear()}年
                  {currentDate && currentDate.getMonth() + 1}月
                </div>
                <div className={styles.right}>
                  <img
                    onClick={() => {
                      this.initCalendar('months', 'add');
                    }}
                    src={require('../assets/img/arrow-right.png')}
                  />
                  <img
                    onClick={() => {
                      this.initCalendar('years', 'add');
                    }}
                    style={{ marginLeft: '0.1rem' }}
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
                            styles.current} ${currentEndDate &&
                            currentBeginDate &&
                            (moment(currentEndDate) > moment(item.date) &&
                              moment(currentBeginDate) < moment(item.date) &&
                              styles.after)}`}
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
        {isShow && (
          <div
            onClick={() => {
              this.isShowChange();
            }}
            className={styles.mask}
          ></div>
        )}
      </div>
    );
  }
}

export default Index;
