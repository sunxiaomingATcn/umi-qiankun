/**
 * title: 天气
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './index.scss';
import { Toast, InputItem, Checkbox } from 'antd-mobile';
import { history } from 'umi';
import * as requestMethods from '@/services/public';
import weatherUtils from '@/utils/weather-map';
import utils from '@/utils/utils';
import moment from 'moment';

@connect(({ publichome, loading }) => ({
  publichome,
  loading: loading.models.publichome,
}))
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        casts: [],
        live: {},
      },
    };
  }

  componentDidMount() {
    document.title = '天气';
    const {
      publichome: { gdLocation = {} },
    } = this.props;
    requestMethods
      .queryWeatherDetail({
        cityCode: gdLocation.code,
      })
      .then(res => {
        console.log('[queryWeatherDetail]', res);
        this.setState({
          data: res.data,
        });
      });
  }

  componentWillUnmount() {}

  render() {
    const {
      data: { casts = [], live = {} },
    } = this.state;
    const {
      publichome: { gdLocation = {} },
    } = this.props;
    let wR = weatherUtils.getBG(live.weather);

    let currentColor = '#ff7835';
    let currentBg = '';
    if (wR) {
      currentColor = wR.color;
      currentBg = require(`./images/bg/${wR.img}`);
    } else {
      return <div></div>;
    }
    //当前背景色

    const bgStyle = { backgroundImage: `url(${currentBg})` };
    //当前摄氏度
    const duStyle = {
      border: `0.08rem solid ${currentColor}`,
    };

    const tomSrc = require('./images/icon/晴@3x.png');
    return (
      <div className={styles.container}>
        <div className={styles.infoCon} style={bgStyle}>
          <div className={styles.infoContent}>
            <span className={styles.address}>{gdLocation.name}</span>
            <div className={styles.time}>
              {/* <span>07/02</span> */}
              <span>星期{utils.toChinesNum(moment().day())}</span>
            </div>
            <div className={styles.weather}>
              <div style={{ color: currentColor }}>
                {live.temperature} <div className={styles.du} style={duStyle}></div>
              </div>
              <span>{live.weather}</span>
              {/* <span>15℃ ～ 29℃</span> */}
            </div>
            <div className={styles.wind}>
              <img src={require('./images/icon/大风@3x.png')} />
              <span>
                {live.winddirection}风 / {live.windpower}级
              </span>
              <img src={require('./images/icon/湿度@3x.png')} />
              <span>{live.humidity}%</span>
            </div>
          </div>
        </div>
        <div className={styles.line}></div>
        <div className={styles.castsTitle}>
          <span>星期几</span>
          <span>白天温度</span>
          <span>白天风速</span>
          <span>晚上温度</span>
          <span>晚上风速</span>
        </div>
        {casts &&
          casts.length > 0 &&
          casts.map((item, index) => (
            <div key={index} className={styles.tom}>
              <span>{item.week}</span>
              <span>{item.daytemp}℃</span>
              <div>
                <span>{item.daywind}风</span>
                <span>{item.daypower}级</span>
              </div>

              <span>{item.nighttemp}℃</span>
              <div>
                <span>{item.nightwind}风</span>
                <span>{item.nightpower}级</span>
              </div>
            </div>
          ))}
      </div>
    );
  }
}

export default Index;
