/**
 * title: 团队管理
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Toast, ActivityIndicator } from 'antd-mobile';
import moment from 'moment';
import styles from './team.scss';
import { history } from 'umi';
import TeamPerformance from './teamPerformance';

@connect(({ my }) => ({
  my,
}))
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: 2,
      rankCurrent: 1,
      teamList: [],
      entryList: [],
      teamRankList: [],
    };
  }

  componentDidMount() {
    this.entry_statistic();
    this.team_relation();
  }

  tabClick(newCurrent) {
    this.setState({
      current: newCurrent,
    });
  }

  entry_statistic() {
    const { dispatch } = this.props;
    dispatch({
      type: 'my/entry_statistic',
      payload: {
        size: 6,
      },
    }).then(res => {
      if (res && res.code == 200) {
        this.setState({ entryList: JSON.stringify(res.data) == "{}" ? [] : res.data });
      }
    });
  }
  team_relation() {
    const { dispatch } = this.props;
    dispatch({
      type: 'my/team_relation',
    }).then(res => {
      if (res && res.code == 200) {
        this.setState({ teamList: res.data });
      }
    });
  }

  render() {
    const {
      current,
      rankCurrent,
      teamList = [],
      entryList = [],
      teamRankList = [],
      teamTotalOrder = 0,
      teamTotalPremium = 0,
    } = this.state;
    return (
      <div className={styles.teamManagement}>
        <div className={styles.tab}>
          <div
            className={styles.tabcenter}
            onClick={() => {
              this.tabClick(2);
            }}
          >
            <div className={current == 2 && styles.active}>团队关系</div>
          </div>
          <div
            className={styles.tabcenter}
            onClick={() => {
              this.tabClick(1);
            }}
          >
            <div className={current == 1 && styles.active}>团队业绩</div>
          </div>
        </div>
        <div className={styles.teamContent}>
          {current == 2 && (
            <>
              <div className={styles.teamRank} style={{ minHeight: '1.7rem', marginTop: '0.38rem' }}>
                <ul className={styles.theader}>
                  <li>职级</li>
                  <li>人数</li>
                </ul>
                <div className={styles.item}>
                  {entryList.map((item, index) => {
                    return (
                      <ul
                        className={styles.theader}
                        style={{ background: (index + 1) % 2 == 0 ? '#FFF' : '' }}
                      >
                        <li>{item && item.entryName}</li>
                        <li>{item && item.personCount}</li>
                      </ul>
                    );
                  })}
                </div>
              </div>
              <div className={styles.teamRelation}>
                <div className={styles.title}>团队关系</div>
                {teamList.map((item, index) => {
                  if (index < 5) {
                    return (
                      <div
                        className={styles.item}
                        style={{ background: (index + 1) % 2 == 0 ? '#FFF' : '' }}
                      >
                        <div className={styles.left}>
                          {item && item.realName && item.realName.length > 4
                            ? item.realName.slice(0, 4) + '...'
                            : item.realName && item.realName}
                          （{item && item.subordinateAmount}）
                        </div>
                        <img
                          src={require('../assets/img/arrow-right.png')}
                          className={styles.right}
                        ></img>
                      </div>
                    );
                  }
                })}
                <div
                  onClick={() => {
                    history.push({ pathname: '/My/personnel' });
                  }}
                  className={styles.lookMore}
                  style={{ marginTop: '0.16rem' }}
                >
                  ··· 查看更多
                  <img src={require('@/assets/arrow-right.png')} />
                </div>
              </div>
            </>
          )}
          {<div style={{ display: current == 1 ? 'block' : 'none', height: '100%' }}><TeamPerformance {...this.props} /></div>}
        </div>
      </div>
    );
  }
}

export default Index;
