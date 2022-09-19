/**
 * title: 澎湃保
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './index.scss';
// import CacheUtils from '@/utils/CacheUtil';
import { Toast, TabBar } from 'antd-mobile';
import Util from '@/utils/utils';
import needCopeIos from '@/utils/tool/iosnohistory';
import { history } from 'umi';
import { Link } from 'umi';
import Home from './components/home';
import Order from '@/pages/Order';
import Customer from '@/pages/Customer';
import My from '@/pages/My';
import WxSdk from '@/utils/wx-sdk';
import * as requestMethods from '@/services/public';

const tabToTitle = {
  'home': '澎湃保',
  'order': '订单管理',
  'customer': '客户',
  'my': '我的'
}

@connect(({ publichome, loading }) => ({
  publichome,
  loading: loading.models.publichome,
}))
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab: 'home',
      notice: [],
      // products: [],
      encies: [],
    };
  }

  componentDidMount() {
    this.initHomeData();
  }

  initHomeData = () => {
    const {
      publichome: { gdLocation = {} },
      location: {
        query: { tab = 'home' },
      },
    } = this.props;
    if (!gdLocation.name) {
      this.getLocation();
    } else {
      this.getWeather(gdLocation.code);
    }

    this.getNotice();
    // this.getProduct();
    this.getEncy();

    document.title = tabToTitle[tab];
  };

  componentWillUnmount() {}

  getLocation = () => {
    const { dispatch } = this.props;
    const that = this;
    //获取微信定位坐标
    WxSdk.getLocation(location => {
      var gps = [location.longitude, location.latitude];
      //调用高德地图获取地理编码
      window.AMap.plugin('AMap.Geocoder', function() {
        var geocoder = new window.AMap.Geocoder();
        geocoder.getAddress(gps, function(status, result) {
          console.log('[getAddress]', result);
          if (status === 'complete' && result.info === 'OK') {
            //调用后台接口获取位置信息
            requestMethods
              .queryCity({
                code: result.regeocode.addressComponent.adcode,
              })
              .then(res => {
                if (!res) return;
                if (res && res.code === 200) {
                  console.log('[queryCity]', res);
                  dispatch({
                    type: 'publichome/saveLocation',
                    payload: res.data,
                  });
                  that.getWeather(res.data.code);
                }
              });
          }
        });
      });
    });
  };

  getWeather = code => {
    const { dispatch } = this.props;
    //调用后台接口获取天气信息
    requestMethods
      .queryWeatherLive({
        cityCode: code,
      })
      .then(res => {
        if (!res) return;
        console.log('[queryWeatherLive]', res);
        dispatch({
          type: 'publichome/saveWeather',
          payload: res.data,
        });
      });
  };

  getNotice = () => {
    requestMethods
      .queryNoticeList({
        status: 1,
        current: 1,
        size: 1,
      })
      .then(res => {
        if (!res) return;
        console.log('[queryNoticeList]', res);
        if (res && res.code === 200) {
          this.setState({
            notice: res.data.records[0],
          });
        }
      });
  };

  // getProduct = () => {
  //   requestMethods.queryProductListNew().then(res => {
  //     if (!res) return;
  //     console.log('[queryProductList]', res.payload);
  //     if (res.code === 200) {
  //       this.setState({
  //         products: res.data.slice(0,3),
  //       });
  //     }
  //   });
  // };
  getEncy = () => {
    requestMethods.queryEncyList().then(res => {
      if (!res) return;
      console.log('[queryEncyList]', res);
      if (res.code === 200) {
        this.setState({
          encies: res.data.records,
        },()=>{
          if(this.childHome){
            this.childHome.refresh();
          }
        });
      }
    });
  };


  tabClick = async () => {
    const {
      location: { pathname },
    } = await this.props;
    const { selectedTab } = this.state;
    document.title = tabToTitle[selectedTab];
    history.replace({
      pathname,
      query: {
        tab: selectedTab,
      },
    });
  };

  render() {
    const {
      location: {
        query: { tab = 'home' },
      },
      publichome: { gdLocation, weatherObj },
    } = this.props;
    const { notice = {}, encies = [] } = this.state;
    return (
      <div
        className={styles.con}
        style={{ position: 'fixed', height: '100%', width: '100%', top: 0,paddingBottom:needCopeIos()?'0.60rem':'0'}}
      >
        <TabBar
          unselectedTintColor="#172B4D"
          tintColor="#0065FF"
          barTintColor="white"
          hidden={this.state.hidden}
          prerenderingSiblingsNumber={Infinity}
        >
          <TabBar.Item
            title="首页"
            key="home"
            icon={
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  background: `url(${require('./images/icon1-1.png')}) center center /  21px 21px no-repeat`,
                }}
              />
            }
            selectedIcon={
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  background: `url(${require('./images/icon1-2.png')}) center center /  21px 21px no-repeat`,
                }}
              />
            }
            selected={tab === 'home'}
            onPress={() => {
              this.setState({
                selectedTab: 'home',
              });
              this.tabClick();
            }}
          >
            {tab === 'home' &&
              <Home
                parentHome={this}
                gdLocation={gdLocation}
                weatherObj={weatherObj}
                notice={notice}
                encies={encies}
                // products={products}
              />
            }
          </TabBar.Item>
          <TabBar.Item
            icon={
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  background: `url(${require('./images/icon2-1.png')}) center center /  21px 21px no-repeat`,
                }}
              />
            }
            selectedIcon={
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  background: `url(${require('./images/icon2-2.png')}) center center /  21px 21px no-repeat`,
                }}
              />
            }
            title="订单"
            key="order"
            selected={tab === 'order'}
            onPress={() => {
              this.setState({
                selectedTab: 'order',
              });
              this.tabClick();
            }}
          >
            {/* {this.renderContent('order')} */}
            {tab === 'order' && <Order {...this.props}/>}
          </TabBar.Item>
          <TabBar.Item
            icon={
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  background: `url(${require('./images/icon3-1.png')}) center center /  21px 21px no-repeat`,
                }}
              />
            }
            selectedIcon={
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  background: `url(${require('./images/icon3-2.png')}) center center /  21px 21px no-repeat`,
                }}
              />
            }
            title="客户"
            key="customer"
            selected={tab === 'customer'}
            onPress={() => {
              this.setState({
                selectedTab: 'customer',
              });
              this.tabClick();
            }}
          >
            {tab === 'customer' && <Customer />}
          </TabBar.Item>
          <TabBar.Item
            icon={
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  background: `url(${require('./images/icon4-1.png')}) center center /  21px 21px no-repeat`,
                }}
              />
            }
            selectedIcon={
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  background: `url(${require('./images/icon4-2.png')}) center center /  21px 21px no-repeat`,
                }}
              />
            }
            title="我的"
            key="my"
            selected={tab === 'my'}
            onPress={() => {
              this.setState({
                selectedTab: 'my',
              });
              this.tabClick();
            }}
          >
            {tab === 'my' && <My />}
          </TabBar.Item>
        </TabBar>
      </div>
    );
  }
}

export default Index;
