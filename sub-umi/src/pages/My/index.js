/**
 * title: 我的
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Toast } from 'antd-mobile';
import styles from './index.scss';
import * as requestMethods from '@/services/public';
import { history } from 'umi';
import moment from 'moment';
import WxSdk from '@/utils/wx-sdk';

@connect(({ my }) => ({
  my,
}))
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      total: 0,
      totalPremium: 0,
      isShow: false,
      carTotalPremium: '0.00'
    };
  }

  componentDidMount() {
    this.userInfo();
    this.queryList();
    // Utils.copyText(localStorage.getItem('loginData'))
  }

  userInfo() {
    if (localStorage.loginData) {
      let loginData = JSON.parse(localStorage.loginData);
      requestMethods.queryUserDetail(loginData.userId).then(res => {
        if (res && res.code === 200) {
          console.log(res.data);
          this.tenants(res.data.id);
          localStorage.setItem('entrySequence', res.data.entrySequence)
          this.setState({
            userInfo: res.data,
          });
        }
      });
    }
  }

  tenants(id) {
    const { dispatch } = this.props;
    dispatch({
      type: 'my/tenants',
      payload: {
        id,
      },
    }).then(res => {
      if (res && res.code == 200) {
        this.setState({ isShow: res.data.length > 1 ? true : false });
        let loginData = JSON.parse(localStorage.loginData);
        loginData = {
          ...loginData,
          tenantList: res.data,
        };
        localStorage.setItem('loginData', JSON.stringify(loginData));
      }
    });
  }

  queryList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'my/orderList',
      payload: {
        team: false,
        performance: true,
        // policyStatus: 2,
        acceptDateMin: moment()
          .startOf('month')
          .format('YYYY-MM-DD'),
        acceptDateMax: moment().format('YYYY-MM-DD'),
      },
    }).then(res => {
      if (res && res.code == 200) {
        this.setState({
          total: res.data.total,
          totalPremium: res.data.totalPremium,
        });
      }
    });
    // 车险业绩
    dispatch({
      type: 'my/carPersonal',
      payload: {
        startDate: moment().startOf('month').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        endDate: moment().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      },
    }).then(res => {
      if (res && res.code == 200) {
        this.setState({
          carTotal: res.data.total,
          carTotalPremium: res.data.totalPremium,
        });
      }
    });
  }

  // 退出登录
  logout = () => {
    WxSdk.getInstance((config, that) => {
      const { dispatch } = this.props;
      const str = encodeURIComponent(window.location.href);
      const userInfo = localStorage.getItem("userInfo");
      const { wechatId } = userInfo ? JSON.parse(userInfo) : {};
      const link = `${window.origin}/#/publiclogin?appid=${config.appId}&redirect_uri=${str}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`
      requestMethods.unbindWechat(wechatId).then(res => {
        if (res && res.code == 200) {
          localStorage.removeItem('loginData')
          sessionStorage.setItem('showContent', true)
          dispatch({
            type: 'publichome/saveUserInfo',
            payload: {},
          });
          window.location.replace(link)
        }
      })
    });
  }

  render() {
    const { userInfo, carTotalPremium, totalPremium, isShow } = this.state;
    return (
      <div className={styles.my}>
        <div
          className={styles.myHeader}
          onClick={() => {
            history.push('/My/info');
          }}
        >
          <img
            src={(userInfo && userInfo.wechatImg) || require('./assets/img/headimg@2x.png')}
            className={styles.img}
          ></img>
          <div className={styles.info}>
            <div className={styles.name}>
              Hi,{userInfo && userInfo.realName && userInfo.realName.length > 4
                ? userInfo.realName.slice(0, 4) + '...'
                : userInfo && userInfo.realName}
              {userInfo && userInfo.account && `(${userInfo.account})`}
            </div>
            <div className={styles.phone}>{userInfo && userInfo.phone}</div>
          </div>
          {
            //       //<img
            //     src={require('./assets/img/authentication.png')}
            //     className={styles.authentication}
            //   ></img>
          }
        </div>

        <div
          className={styles.data}
          onClick={() => {
            history.push('/My/personnel/performance');
          }}
        >
          <p><div className={styles.premiumTitle}>当月保费(元)</div></p>
          <div className={styles.premium}>
            <div className={styles.premiumNumber}>
              <p>车险保费</p>
              <p>{carTotalPremium}</p>
            </div>
            <div className={styles.premiumNumber}>
              <p>人身险保费</p>
              <p>{totalPremium}</p>
            </div>
          </div>
          <img className={styles.more} src={require('./assets/img/more.png')} />
        </div>
        <div className={styles.container}>
          <div
            className={styles.item}
            onClick={() => {
              history.push('/My/teamManagement');
            }}
          >
            <div className={styles.left}>
              <img src={require('./assets/img/team.png')} />
              <div>团队管理</div>
            </div>
            <div className={styles.right}>
              <img src={require('@/assets/arrow-right.png')} />
            </div>
          </div>
          <div className={styles.line}></div>
          <div
            className={styles.item}
            onClick={() => {
              history.push('/My/invite');
            }}
          >
            <div className={styles.left}>
              <img src={require('./assets/img/invite.png')} />
              <div>邀请好友</div>
            </div>
            <div className={styles.right}>
              <img src={require('@/assets/arrow-right.png')} />
            </div>
          </div>
          <div className={styles.line}></div>
          <div
            className={styles.item}
            onClick={() => {
              Toast.info('敬请期待');
            }}
          >
            <div className={styles.left}>
              <img src={require('./assets/img/practice.png')} />
              <div>执业认证</div>
            </div>
            <div className={styles.right}>
              <img src={require('@/assets/arrow-right.png')} />
            </div>
          </div>
          <div className={styles.line}></div>
          <div
            className={styles.item}
            onClick={() => {
              history.push('/My/agreement/suggestion');
            }}
          >
            <div className={styles.left}>
              <img src={require('./assets/img/feedback.png')} />
              <div>意见反馈</div>
            </div>
            <div className={styles.right}>
              <img src={require('@/assets/arrow-right.png')} />
            </div>
          </div>
          <div className={styles.line}></div>
          <div
            className={styles.item}
            onClick={() => {
              history.push('/My/agreement');
            }}
          >
            <div className={styles.left}>
              <img src={require('./assets/img/register.png')} />
              <div>注册政策</div>
            </div>
            <div className={styles.right}>
              <img src={require('@/assets/arrow-right.png')} />
            </div>
          </div>

          {isShow && (
            <>
              <div className={styles.line}></div>
              <div
                className={styles.item}
                onClick={() => {
                  localStorage.setItem('mobile', userInfo && userInfo.originalPhone);
                  sessionStorage.setItem('agree', true);
                  localStorage.removeItem('loginTenantId')
                  history.push('/PublicLoginBind/multi');
                }}
              >
                <div className={styles.left}>
                  <img src={require('./assets/img/switch.png')} />
                  <div>切换登录商户</div>
                </div>
                <div className={styles.right}>
                  <img src={require('@/assets/arrow-right.png')} />
                </div>
              </div>
            </>
          )}
        </div>
        <div className={styles.logout} onClick={this.logout}>退 出</div>
      </div>
    );
  }
}

export default Index;
