/**
 * title: 选择城市
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import styles from './index.scss';
import { Toast, InputItem } from 'antd-mobile';
// import Util from '@/utils/utils';
import { history } from 'umi';
import * as requestMethod from '@/services/public';
const indexList = [
  '定',
  '热',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'J',
  'K',
  'L',
  'M',
  'N',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'W',
  'X',
  'Y',
  'Z',
];

@connect(({ publichome, loading }) => ({
  publichome,
  loading: loading.models.publichome,
}))
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showCancel: false,
      listData: {},
      searchListData: [],
      isShowModal: false,
    };
  }

  componentDidMount() {
    requestMethod.queryArea().then(res => {
      if (res && res.code === 200) {
        this.setState({
          listData: res.data,
        });
      }
    });
  }

  componentWillUnmount() {}

  toDetail = () => {};

  onSearchFocus = () => {
    this.setState({
      showCancel: true,
      isShowModal: true,
    });
    //解决滑动穿透
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  };
  onSearchBlur = () => {
    this.setState({
      showCancel: false,
      isShowModal: false,
    });
    document.body.style.overflow = 'auto';
    document.body.style.position = 'static';
  };

  renderCityList = () => {
    const {
      listData: { group = {} },
    } = this.state;
    let keys = Object.keys(group);
    return (
      <div>
        {keys.map(key => {
          return (
            <div key={key}>
              <div id={key} className={styles.indexItem}>
                {key}
              </div>
              {group[key] &&
                group[key].length > 0 &&
                group[key].map(item => (
                  <div
                    onClick={() => {
                      this.onCityClick(item);
                    }}
                    className={styles.cityItem}
                    key={item.code}
                  >
                    {item.name}
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    );
  };

  onRightItemClick = item => {
    let el = document.getElementById(item);
    if (el) {
      el.scrollIntoView();
    }
  };
  onHotClick = item => {
    this.onCitySelected(item);
  };
  onTopClick = () => {
    window.scrollTo(0, 0);
  };
  onCityClick = item => {
    this.onCitySelected(item);
  };

  onCitySelected = item => {
    const { dispatch } = this.props;
    dispatch({
      type: 'publichome/saveLocation',
      payload: item,
    });
    history.go(-1);
  };

  onSearchChange = e =>{
    requestMethod.queryArea({
      areaName: e
    }).then(res => {
      if (res && res.code === 200) {
        let arr = Object.values(res.data.group).flat();
        this.setState({
          searchListData: arr,
        });
      }
    });
  }

  render() {
    const {
      showCancel,
      searchListData = [],
      isShowModal = false,
      listData: { group = [], hot = [] },
    } = this.state;

    const {
      publichome: { gdLocation = {} },
    } = this.props;
    // const { gdLocation = {} } = this.props;
    return (
      <div className={styles.container}>
        <div className={styles.searchCon}>
          <div>
            <InputItem
              onFocus={this.onSearchFocus}
              onChange={this.onSearchChange}
              // onBlur={this.onSearchBlur}
              clear
              labelNumber="2"
              maxLength="50"
              placeholder="请输入城市/行政区查询"
            >
              <div
                style={{
                  backgroundImage: `url(${require('./images/search.png')})`,
                  backgroundSize: 'cover',
                  height: '0.24rem',
                  width: '0.24rem',
                }}
              />
            </InputItem>
          </div>
          {showCancel && <span onClick={this.onSearchBlur}>取消</span>}
        </div>
        {isShowModal && (
          <div className={styles.modalWrap}>
            <div className={styles.modalCon}>
              {searchListData &&
                searchListData.length > 0 &&
                searchListData.map(item => (
                  <div
                    onClick={() => {
                      this.onCityClick(item);
                    }}
                    className={styles.searchItem}
                    key={item.code}
                  >
                    {item.name}
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className={styles.locationCon} id="定">
          {gdLocation.name ? (
            <div className={styles.cityItem}>
              <img src={require('./images/location.png')} />
              <span>{gdLocation.name}</span>
            </div>
          ) : (
            <div className={styles.errorCon}>
              <div className={styles.errorItem}>
                <img src={require('./images/location-error.png')} />
                <span>定位失败</span>
              </div>
              <span>*请开启授权定位后重新获取</span>
            </div>
          )}
        </div>
        <div className={styles.hotCon} id="热">
          <span>热门城市</span>
          <div className={styles.hotContent}>
            {hot &&
              hot.length > 0 &&
              hot.map(item => (
                <div
                  onClick={() => {
                    this.onHotClick(item);
                  }}
                  key={item.code}
                >
                  {item.name}
                </div>
              ))}
          </div>
        </div>
        {this.renderCityList()}
        <div className={styles.rightCon}>
          <img onClick={this.onTopClick} src={require('./images/top.png')} />
          {indexList.map(item => (
            <div
              onClick={() => {
                this.onRightItemClick(item);
              }}
              className={styles.rightItem}
              key={item}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default Index;
