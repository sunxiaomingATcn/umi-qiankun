/**
 * title: 团队管理
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Toast, ActivityIndicator } from 'antd-mobile';
import styles from './index.scss';

@connect(({ my }) => ({
  my,
}))
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      teamList: [],
      beforeArr: [],
    };
  }

  componentDidMount() {
    this.team_relation()
  }

  team_relation(params) {
    const { dispatch } = this.props;
    dispatch({
      type: 'my/team_relation',
      payload: {
        ...params,
      },
    }).then(res => {
      if (res && res.code == 200) {
        this.setState({ teamList: res.data });
      }
    });
  }

  itemClick(item) {
    let beforeArr = this.state.beforeArr;
    beforeArr.push(item);
    this.team_relation({ id: item.id });
    this.setState({ beforeArr });
  }

  headerClick(item, index) {
    let beforeArr = this.state.beforeArr;
    beforeArr = beforeArr.slice(0, index + 1);
    this.team_relation({ id: item.id });
    this.setState({ beforeArr });
  }

  render() {
    const { teamList = [], beforeArr = [] } = this.state;
    return (
      <div className={styles.personnels}>
        <div className={styles.title}>
          团队关系
          {beforeArr.map((item, index) => {
            return (
              <div
                onClick={() => {
                  this.headerClick(item, index);
                }}
              >
                <img src={require('../assets/img/team-arrow.png')} />
                <span>{item.realName}</span>
              </div>
            );
          })}
        </div>
        {teamList.map((item, index) => {
          return (
            <div
              className={styles.item}
              style={{ background: (index + 1) % 2 == 0 ? '#FFF' : '' }}
              onClick={() => {
                this.itemClick(item);
              }}
            >
              {item.realName}（{item.subordinateAmount}）
            </div>
          );
        })}
      </div>
    );
  }
}

export default Index;
