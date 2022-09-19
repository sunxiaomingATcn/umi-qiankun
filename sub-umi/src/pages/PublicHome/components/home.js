import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal } from 'antd-mobile';
import { Toast, CascadePicker } from 'antd-mobile-v5';
import styles from './home.scss';
import { history } from 'umi';
import weatherUtils from '@/utils/weather-map';
import utils from '@/utils/utils';
import * as requestMethods from '@/services/public';
import * as requestMethodsAutomobile from '@/services/publicAutomobile';
import { getProductLink } from '@/utils/tool/agentInfo';
import BScroll from 'better-scroll';
import Swiper from 'swiper/dist/js/swiper.js';
import 'swiper/dist/css/swiper.min.css';
import AutomobileNum from './automobileNum';
import PPBLoading from '@/components/Loading/loading.js';
import moment from 'moment'
import Confirm from './ModalConfirm/confirm';
import WxSdk from '@/utils/wx-sdk';

const { generalRequest } = utils;


const CustomChildren = props => {
  // const textArr = props?.extra?.split?.(',');
  const textArr = props?.extra;
  return (
    <div onClick={props.onClick} className={styles.region}>
      <span>投保地区</span>
      <div>
        <span>{textArr?.join?.(' ')}</span>
        <img src={require('./images/more-fill.png')} />
      </div>
    </div>
  );
}

@connect(({ publichome }) => ({
  publichome,
}))
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      areaPickerVisible: false,
      areaArr: [],
      alias: [],
      areaList: [],
      products: [],
      data: [require('./images/banner.png')],
      midData: [require('./images/mid-banner.png')],
      userInfo: {},
    };
  }

  automobileNumRef = React.createRef();

  Link = (path,detail,unmount) =>{
    let id = detail.tenantId
    let value = detail.tenantName
    unmount()
    history.push({pathname:path,query:{id, value}});
  }

  componentDidMount() {

    this.getAlias();
    this.getContentScroll();
    this.initBanner();
    this.initArea();
    this.getProduct();
    const {
      dispatch,
      parentHome = null,
      publichome: { userInfo = {} },
    } = this.props;

    //清空车辆本地缓存
    localStorage.setItem('baseCarInfo', '');
    localStorage.setItem('carInfo', '');
    localStorage.setItem('renewalCarInfo', '');
    dispatch({
      type: 'publicautomobile/clearAllCache'
    });
    console.log('[parentHome]', parentHome);
    if (parentHome) {
      parentHome.childHome = this;
    }
    if (userInfo.realName) {
      this.setState({
        userInfo: userInfo,
      });
      this.userAgreement(userInfo)
    } else {
      if (localStorage.loginData) {
        let loginData = JSON.parse(localStorage.loginData);
        requestMethods.queryUserDetail(loginData.userId).then(res => {
          if (res && res.code === 200) {
            dispatch({
              type: 'publichome/saveUserInfo',
              payload: res.data,
            });
            this.setState({
              userInfo: res.data,
            });
            localStorage.setItem('userInfo', JSON.stringify(res.data))
            this.userAgreement(res.data)
          }
        });
      }
    }
  }

  userAgreement = (userInfo) =>{
    let loginData = JSON.parse(localStorage.loginData);
    const { dispatch } = this.props
    if(moment(userInfo.agreeTime)<moment('2022/04/07')){
      const unmount= Confirm.show({
         title: '温馨提示',
         content: <div>
         <div>亲爱的用户：</div>
         为更充分保障您的权利，根据《个人信息保护法》相关规定，结合产品实际情况，我们于2022年4月7日更新了<span onClick={()=>{this.Link('/My/agreement/Privacy',userInfo,unmount);}} style={{color:'#1890FF',}}>《隐私政策》</span>，请您仔细阅读新版隐私政策后继续使用本产品。
         </div>,
         showCancel: true,
         onConfirm: () => {
           requestMethods.agree({wechatId:loginData.wechatId,id:userInfo.id})
           dispatch({
            type: 'publichome/saveUserInfo',
            payload: {},
           });
         },
         onCancel: () => {
           WxSdk.getInstance((config, that) => {
            const str = encodeURIComponent(window.location.href);
            const link = `${window.origin}/#/publiclogin?appid=${config.appId}&redirect_uri=${str}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`
            requestMethods.unbindWechat(userInfo.wechatId).then(res=>{
              if(res && res.code == 200){
                localStorage.removeItem('loginData')
                sessionStorage.setItem('showContent',true)
                dispatch({
                 type: 'publichome/saveUserInfo',
                 payload: {},
                });
                window.location.replace(link)
              }
            })
          });
         },
       })
     }
  }


  getProduct = () => {
    generalRequest({}, requestMethods.queryProductListNew)
      .then(res => {
        this.setState({
          // products: res.data.slice(0, 3),
          products: res.data,
        }, () => {
          new Swiper('#swiper-product', {
            slidesPerView: 'auto',
            spaceBetween: 10,
            observer: true, //修改swiper自己或子元素时，自动初始化swiper
            on: {
              click: function () { },
            },
          });
        });
      })
  }
  getAlias = () => {
    generalRequest({}, requestMethodsAutomobile.alias)
      .then(res => {
        this.setState({
          alias: res.data,
        });
      })
  }

  initArea = () => {

    generalRequest({}, requestMethodsAutomobile.region)
      .then(res => {
        let areaData = res.data;
        const formatItem = (item) => {
          console.log(item);
          if (!item.children || item.children.length === 0) {
            delete item.children
            return item;
          }
          item.children.forEach(element => {
            formatItem(element);
          });
          return item;
        }

        this.setState({
          areaList: areaData.map(area => formatItem(area))
        }, () => {
          if (res.data[0]) {
            const defaultArea = res.data[0];
            //默认选中地区
            this.setState({
              areaArr: [defaultArea.value, defaultArea.children?.[0]?.value]
            });
            //默认选中车牌号首位
            this.automobileNumRef.current.changeProv(defaultArea.value);
          }
        });
      })
  }

  initBanner = () => {
    new Swiper('#swiper-top', {
      slidesPerView: 1,
      observer: true, //修改swiper自己或子元素时，自动初始化swiper
      observeParents: true, //修改swiper的父元素时，自动初始化swiper
      on: {
        click: function () { },
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

    new Swiper('#swiper-ad', {
      slidesPerView: 1,
      spaceBetween: 15,
      observer: true, //修改swiper自己或子元素时，自动初始化swiper
      observeParents: true, //修改swiper的父元素时，自动初始化swiper
      on: {
        click: function () { },
      },
      pagination: {
        el: '#swiper-ad-pagination',
        clickable: true,
        bulletClass: 'swiper-ppb-default',
        bulletActiveClass: 'swiper-ppb-active',
        renderBullet: function (index, className) {
          return '<div class="' + className + '"></div>';
        },
      },
    });

  };

  refresh = () => {
    if (this.bScroll) {
      console.log('[bScroll.refresh]');
      this.bScroll.refresh();
    }
  };

  getContentScroll = () => {
    const wrapper = document.getElementById('scroll_wrapper');
    this.bScroll = new BScroll(wrapper, {
      preventDefault: true,
      scrollY: true,
      // 实时派发scroll事件
      probeType: 0,
      mouseWheel: true,
      scrollbars: false,
      click: true,
      bounce: false,
    });
  };

  toWeather = () => {
    history.push('/PublicWeather');
  };

  toNotice = () => {
    history.push('/PublicNotice');
  };
  toAddress = () => {
    history.push('/PublicAddress');
  };

  toProduct = () => {
    history.push('/Home');
  };
  toProductDetail = product => {
    this.jumpLink(product.productId);
  };

  toEncy = () => {
    history.push('/InsuranceEncyclopedia');
  };

  toEncyDetail = item => {
    history.push({
      pathname: '/InsuranceEncyclopedia/detail',
      query: { key: item.category, id: item.id },
    });
  };

  jumpLink = (productId, channelType = '') => {
    PPBLoading.show();
    const { dispatch } = this.props;
    getProductLink(dispatch, productId, channelType)
      .then(res => PPBLoading.hide())
      .catch(res => {
        PPBLoading.hide();
        if (res == 'presale') {
          Modal.confirm({
            content: '产品预售中，详情请联系客服。',
            okText: '联系客服 ',
            cancelText: '我知道了',
            onOk: () =>
            (window.location.href =
              'https://www.sobot.com/chat/h5/index.html?sysNum=4debc641aefd4d859181fcca74633b67'),
            onCancel: () => console.log('cancel'),
          });
        }
      });
  };
  checkArea = () =>{
    const { areaArr } = this.state;
    if (!areaArr || areaArr.length === 0) {
      Toast.show('请选择投保地区', 2000);
      this.setState({ areaPickerVisible: true });
      return false
    }
    return true;
  }
  toSupp = () => {
    const { areaArr } = this.state;
    if (!this.checkArea()) {
      return;
    }
    localStorage.setItem('regionCode', areaArr[0]);
    localStorage.setItem('cityCode', areaArr[1]);
    history.push('/PublicAutomobile/supplementCarInfo?type=new&from=home');
  }
  toOffer = (e) => {
    this.automobileNumRef.current.checkNum(e)
      .then((data) => {
        const { areaArr } = this.state;

        if (!this.checkArea()) {
          return;
        }
        PPBLoading.show();
        generalRequest({ carLicenseNo: data }, requestMethodsAutomobile.car)
          .then(res => {
            localStorage.setItem('carInfo', JSON.stringify(res.data));
            localStorage.setItem('regionCode', areaArr[0]);
            localStorage.setItem('cityCode', areaArr[1]);
            localStorage.setItem('localCarNo', data);
            if (res.data.full == true) {
              localStorage.setItem('baseCarInfo', JSON.stringify(res.data));
              history.push('/PublicAutomobile/quoteInfo');
            } else {
              history.push('/PublicAutomobile/supplementCarInfo?from=home');
            }
          }).finally(() => {
            PPBLoading.hide();
          })

      }).catch(e => Toast.show(e));
  }



  render() {
    const {
      gdLocation = {},
      weatherObj = {},
      notice = {},
      encies = [],
    } = this.props;

    let { userInfo, areaList, areaArr = [], products = [

    ] } = this.state;
    // products = [
    //   { "productId": 20, "saleName": "人保境内出行保", "description": "1、含紧急救援 2、医疗0免赔", "logo": "https://pengpaibao-src.oss-cn-beijing.aliyuncs.com/dev1/1627991529694wEKHt.jpg", "homePageImage": "https://pengpaibao-src.oss-cn-beijing.aliyuncs.com/dev1/1647401096500Ezswa.png", "startingPrice": "0.8" },
    //   { "productId": 27, "saleName": "泰元保111", "description": "dsgsd", "logo": "https://pengpaibao-src.oss-cn-beijing.aliyuncs.com/dev1/1629888887178dmfRP.jpg", "homePageImage": "https://pengpaibao-src.oss-cn-beijing.aliyuncs.com/dev1/1647323884102MYyYh.png", "startingPrice": "1000" },
    //   { "productId": 65, "saleName": "重建回调测试", "description": "1212122", "logo": "https://pengpaibao-src.oss-cn-beijing.aliyuncs.com/dev1/1634872043356QjZFh.jpg", "homePageImage": "https://pengpaibao-src.oss-cn-beijing.aliyuncs.com/dev1/1647400470628CGDSe.png", "startingPrice": "1" }
    // ]
    let weatherUrl = '';
    if (weatherObj.weather) {
      let wR = weatherUtils.getImg(weatherObj.weather);
      weatherUrl = wR || '';
    }

    let slideWidth, slideHeight, showLeftTag, showRightTag, titleWidth, subWidth;
    switch (products.length) {
      case 1:
        slideWidth = '100%';
        slideHeight = '2.4rem';
        showLeftTag = true;
        showRightTag = false;
        titleWidth = '80%';
        subWidth = '80%';
        break;
      case 2:
        slideWidth = 'calc((100% - .2rem) /2)';
        slideHeight = '3.36rem';
        showLeftTag = false;
        showRightTag = true;
        titleWidth = '80%';
        subWidth = '70%';
        break;
      default:
        slideWidth = '2.8rem';
        slideHeight = '3.36rem';
        showLeftTag = false;
        showRightTag = true;
        titleWidth = '90%';
        subWidth = '70%';
    }
    return (
      <div className={styles.wrapper} id="scroll_wrapper">
        <div className={styles.con} id='homeCon'>
          <div className="swiper-container" id="swiper-top" style={{ width: '100%' }}>
            <div className="swiper-wrapper" style={{ width: '100%' }}>
              {this.state.data.map((val, index) => (
                <div className={'swiper-slide'} key={index} style={{ width: '100%' }}>
                  <img src={val} alt="" style={{ width: '100%', verticalAlign: 'top' }} />
                </div>
              ))}
            </div>
            {this.state.data.length > 1 && (
              <div
                id='swiper-top-pagination'
                className="swiper-pagination"
                style={{ left: '0.44rem', bottom: '0.7rem', textAlign: 'left', height: '0.2rem' }}
              ></div>
            )}
          </div>
          <div className={styles.bg}>
            <div className={styles.infoCon}>
              <div className={styles.leftCon}>
                <img src={userInfo.wechatImg || require('./images/default-header.png')} />
                <div onClick={this.toAddress} className={styles.addressCon}>
                  <span className={styles.tips}>
                    Hi，{userInfo.realName || ''}
                    {utils.getTimeState()}好
                  </span>
                  <span className={styles.location}>{gdLocation.name || '未知'}</span>
                </div>
              </div>
              <div className={styles.rightCon} onClick={this.toWeather}>
                <div className={styles.wCon}>
                  {weatherUrl && (
                    <img src={require(`../../PublicWeather/images/icon/${weatherUrl}`)} />
                  )}

                  <span className={styles.wText}>{weatherObj.weather}</span>
                  <span className={styles.wValue}>{weatherObj.temperature}℃</span>
                </div>
              </div>
            </div>
            <div className={styles.productCon}>
              <div onClick={this.toNotice} className={styles.notice}>
                <img src={require('./images/notice.png')} />
                <span>{notice.title}</span>
                {/* <img src={require('./images/more.png')} /> */}
                <img src={require('./images/more.png')} />
              </div>
              <div className={styles.funCon}>
                <div className={styles.insurePro} onClick={this.toProduct}>
                  <div className={styles.proLeft}>
                    <span>保险产品</span>
                    <span>
                      精选保障{' '}
                      <img
                        style={{ width: '0.10rem', height: '0.16rem', marginLeft: '0.10rem' }}
                        src={require('./images/more-grey.png')}
                      />
                    </span>
                  </div>
                  <img src={require('./images/product.png')} />
                </div>
                <div className={styles.insureEncy} onClick={this.toEncy}>
                  <div className={styles.proLeft}>
                    <span>保险百科</span>
                    <span>
                      政策解读{' '}
                      <img
                        style={{ width: '0.10rem', height: '0.16rem', marginLeft: '0.10rem' }}
                        src={require('./images/more-grey.png')}
                      />
                    </span>
                  </div>
                  <img src={require('./images/ency.png')} />
                </div>
              </div>
            </div>
            <div className={styles.autoMobileCon}>
              <div className={styles.numBg}>
                <div className={styles.amTitle}>
                  <span>车险投保</span>
                  <div onClick={() => {
                    this.toSupp();
                  }}>
                    <span>新车未上牌</span>
                    <img src={require('./images/more.png')} />
                  </div>
                </div>
              </div>
              <div className={styles.amContent}>
                <AutomobileNum
                  alias={this.state.alias}
                  ref={this.automobileNumRef}
                  conId={'homeCon'}
                  bs={this.bScroll}
                  onChange={(automobileNumArr) => {
                    this.automobileNumArr = automobileNumArr;
                  }} />

                {/* <Picker
                  data={areaList}
                  title=""
                  okText={'确定'}
                  cols={2}
                  value={areaArr}
                  onChange={v => this.setState({ areaArr: v })}
                  onOk={v => {
                    this.setState({ areaArr: v });
                    this.automobileNumRef.current.changeProv(v[0]);
                  }}
                >
                  <CustomChildren />
                </Picker> */}
                <CascadePicker
                  options={areaList}
                  title=""
                  confirmText={'确定'}
                  value={areaArr}
                  visible={this.state.areaPickerVisible}
                  // onChange={v => this.setState({ areaArr: v })}
                  onConfirm={v => {
                    if(v && v.length>0){
                      this.setState({ areaArr: v });
                      this.automobileNumRef.current.changeProv(v[0]);
                    }
                  }}
                  onClose={() => {
                    this.setState({ areaPickerVisible: false });
                  }}
                >
                  {value => {
                    return <CustomChildren extra={value?.map?.(item => item?.label)} onClick={() => {
                      this.setState({ areaPickerVisible: true });
                    }} />
                  }}
                </CascadePicker>
                <div className={styles.toOffer} onClick={this.toOffer}><div className={styles.blur}></div><span>去报价</span></div>
              </div>
            </div>

            <div className="swiper-container" id="swiper-ad" style={{ width: '100%', marginTop: '.3rem', borderRadius: '.16rem' }}>
              <div className="swiper-wrapper" style={{ width: '100%' }}>
                {this.state.midData.map((val, index) => (
                  <div className={'swiper-slide'} key={index}>
                    <img src={val} alt="" style={{ width: '100%', verticalAlign: 'top' }} />
                  </div>
                ))}
              </div>
              {this.state.midData.length > 1 && (
                <div
                  id="swiper-ad-pagination"
                  className="swiper-pagination"
                  style={{ left: '0.44rem', bottom: '0.2rem', textAlign: 'left', height: '0.2rem' }}
                ></div>
              )}
            </div>
          </div>
          {products && products.length > 0 && <div className={styles.featurePro}>
            <div className={styles.fpTitle}>
              <span>精选产品</span>
              <div onClick={this.toProduct}>
                <span>更多</span>
                <img src={require('./images/more.png')} />
              </div>
            </div>
            <div className="swiper-container" id="swiper-product" style={{ width: '100%', marginTop: '.3rem' }}>
              <div className="swiper-wrapper" style={{ width: '100%' }}>
                {products.map((val, index) => (
                  <div className={'swiper-slide'} key={index} style={{ width: slideWidth }}>
                    <div className='spProdItem' style={{ height: slideHeight }} onClick={() => this.toProductDetail(val)}>
                      <div className={showRightTag ? 'tagRight' : 'tagLeft'}><div>热销保险</div></div>
                      {
                        val.homePageImage && <img className='leftImg' src={val.homePageImage} />
                      }

                      {/* <div style={prodStyles2} className='leftImg' /> */}
                      <div className='rightD'>
                        <span style={{ width: titleWidth, WebkitBoxOrient: 'vertical' }}>{val.saleName}</span>
                        <span style={{ width: subWidth, WebkitBoxOrient: 'vertical' }}>{val.description}</span>
                        <span>
                          <span>￥</span>
                          <span>{val.startingPrice}</span>
                          <span>起</span>
                        </span>
                        {
                          // <span>推广费 30%</span>
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>}

          <div className={styles.featureEncy}>
            <div className={styles.feTitle}>
              <span>精选百科</span>
              <div onClick={this.toEncy}>
                <span>更多</span>
                <img src={require('./images/more.png')} />
              </div>
            </div>
            {encies &&
              encies.length > 0 &&
              encies.map(item => (
                <div
                  key={item.id}
                  className={styles.encyItem}
                  onClick={() => this.toEncyDetail(item)}
                >
                  <img
                    src={'https://pengpaibao-src.oss-cn-beijing.aliyuncs.com/' + item.covorPhoto}
                  />
                  <div>
                    <span style={{ WebkitBoxOrient: 'vertical' }}>{item.title}</span>
                    <div>
                      <span>{item.categoryName}</span>
                      <span>{item.releaseTime}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
