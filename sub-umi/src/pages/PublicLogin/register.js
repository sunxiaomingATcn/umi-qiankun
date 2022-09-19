/**
 * title: 注册
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './register.scss';
// import CacheUtils from '@/utils/CacheUtil';
import { Toast, InputItem, Checkbox, Modal, Button, Picker } from 'antd-mobile';
// import Util from '@/utils/utils';
import { history } from 'umi';
import { Link } from 'umi';
import { createForm } from 'rc-form';
import * as requestMethod from '@/services/publicLogin';
import * as requestMethodPublic from '@/services/public';
import utils from '@/utils/utils';
import WxSdk from '@/utils/wx-sdk';
const AgreeItem = Checkbox.AgreeItem;
@connect()
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      codeText: '发送验证码',
      isWait: false,
      isShowSUCCModal: false,
      recomCode: '',
      agree: false,
    };
  }

  componentDidMount() {
    const { setFieldsValue } = this.props.form;
    this.composeWXLink();
    const str = encodeURIComponent(window.location.href);
    if(!this.realName){
      this.realName = '';
    }
    if(localStorage.loginMobile){
      setFieldsValue({mobile:localStorage.loginMobile})
    }
    // if (this.realName) {
      WxSdk.getInstance((config, that) => {
        that.wxShare({
          title: `${this.realName}代理人邀请您注册澎湃保，赶快点击注册吧！`,
          desc: '注册成为保险合伙人，邀请好友还有好礼相送~',
          imgUrl: window.location.origin + '/wx/images/invite.png',
          link: `${window.origin}/#/publiclogin/redirect?appid=${config.appId}&redirect_uri=${str}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`,
        });
      });
    // }
  }

  composeWXLink = () => {
    let searchStr = window.location.search;
    console.log('[searchStr]', searchStr);
    if (searchStr) {
      //带微信跳转参数的处理
      let searchParams = utils.generateParams(searchStr);
      if (searchParams.code) {
        sessionStorage.code = searchParams.code;
      }
      if (searchParams.state) {
        sessionStorage.state = searchParams.state;
      }
      //去掉路径上井号前面的部分
      window.location.replace(window.location.href.replace(searchStr, ''));
    } else {
      const {
        location: { query = {} },
      } = this.props;
      this.code = sessionStorage.code;
      // if (!query.recomCode || !query.id || !query.realName) {
      if (!query.recomCode || !query.id) {
        Toast.fail('没有推荐人信息', 2);
        return;
      }
      this.setState({
        recomCode: query.recomCode,
        tenantId: query.tenantId,
        agree: sessionStorage.agree && JSON.parse(sessionStorage.agree),
      });

      this.id = query.id;
      this.realName = query.realName;

      this.openid = sessionStorage.openid;
      if (!this.openid) {
        requestMethod.getOpenid(this.code).then(res => {
          if (res && res.code === 200) {
            this.openid = res.data;
            sessionStorage.openid = this.openid;
          } else {
            Toast.fail(res.msg);
          }
        });
      }

      const { form } = this.props;
      if (form) {
        form.setFieldsValue({
          mobile: sessionStorage.mobile,
          verificationCode: sessionStorage.verificationCode,
        });
      }
    }
  };

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  /**
   * 倒计时
   */
  setTime = () => {
    this.setState({ isWait: true });
    let countdown = 60;
    this.setState({ codeText: countdown + 's' });
    this.timer = setInterval(() => {
      if (countdown === 0) {
        this.setState({
          codeText: '重新获取',
          isWait: false,
        });
        clearInterval(this.timer);
      } else {
        countdown--;
        this.setState({
          codeText: countdown + 's',
        });
      }
    }, 1000);
  };

  getCodeClick = e => {
    e.preventDefault();
    if (this.state.isWait) {
      return false;
    }
    const { form } = this.props;
    if (!form) {
      return false;
    }
    let mobile = form.getFieldValue('mobile');
    if (!this.checkMobile(mobile)) {
      return;
    }
    requestMethod
      .sendRegVerification({
        mobile: mobile,
      })
      .then(data => {
        if (!data) return;
        if (data.code === 200) {
          Toast.success('短信验证码发送成功', 2);
          // 接口成功发送验证码并倒计时
          this.setTime();
        } else {
          Toast.fail(data.msg, 2);
        }
      });
  };

  checkMobile = mobile => {
    if (!mobile || !/^1[3456789]\d{9}$/.test(mobile)) {
      Toast.fail('请先输入正确手机号', 2);
      return false;
    }
    return true;
  };

  onRegist = () => {
    const { agree = false } = this.state;
    if (!this.openid) {
      Toast.fail('未获取到 openid', 2);
      return;
    }
    this.props.form.validateFields((error, value) => {
      if (error) return;
      console.log('[value]', value);
      if (!agree) {
        Toast.fail('请阅读并同意用户服务协议、隐私协议', 2);
        return;
      }
      if (!this.checkMobile(value.mobile)) {
        return;
      }
      if (!value.verificationCode) {
        console.log('[value.verificationCode]', value.verificationCode);
        Toast.fail('验证码错误，请重新输入', 2);
        return;
      }

      let formData = {
        openid: this.openid,
        phone: value.mobile,
        recomCode: this.id,
        verificationCode: value.verificationCode,
      };

      requestMethod.regist(formData).then(res => {
        if (!res) return;
        this.composeLoginRes(res, value.mobile);
      });
    });
  };

  composeLoginRes = (res, mobile) => {
    if (res) {
      if (res.code === 200) {
        this.setState({
          isShowSUCCModal: true,
        });
      } else if (res.code === 400) {
        Toast.fail(res.msg);
      }
    }
  };
  toPublic = () => {
    sessionStorage.clear();
    window.location.href =
      'https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzkxODE5Njc2OQ==&scene=124#wechat_redirect';
  };

  Link = (path) =>{
    const { tenantId } = this.state
    history.push({pathname:path,query:{id:tenantId}});
  }

  render() {
    const { isWait, codeText, recomCode, agree, tenantList = [] } = this.state;
    const { getFieldProps, setFieldsValue } = this.props.form;

    return (
      <div className={styles.container}>
        <span>Hi,</span>
        <span>欢迎来到澎湃保</span>
        <span>新用户注册</span>
        <span>邀请人工号：{recomCode}</span>
        <img src={require('./images/top-bg.png')} />
        <div className={styles.formCon}>
          <div className={styles.itemCon}>
            <InputItem
              {...getFieldProps('mobile')}
              onBlur={val => {
                sessionStorage.setItem('mobile', val)
                localStorage.setItem('loginMobile',val)
              }}
              labelNumber="2"
              maxLength="11"
              placeholder="请输入手机号"
              type="number"
            >
              <div
                style={{
                  backgroundImage: `url(${require('./images/phone.png')})`,
                  backgroundSize: 'cover',
                  height: '18px',
                  width: '18px',
                }}
              />
            </InputItem>
          </div>
          <div className={styles.itemCon} style={{ marginTop: '0.2rem' }}>
            <InputItem
              {...getFieldProps('verificationCode')}
              extra={
                <span
                  onClick={this.getCodeClick}
                  style={{ color: isWait ? '#8993A4' : '#0065FF', fontSize: '14px' }}
                >
                  {codeText}
                </span>
              }
              onBlur={val => sessionStorage.setItem('verificationCode', val)}
              labelNumber="2"
              maxLength="8"
              type="number"
              placeholder="请输入短信验证码"
            >
              <div
                style={{
                  backgroundImage: `url(${require('./images/verify.png')})`,
                  backgroundSize: 'cover',
                  height: '18px',
                  width: '18px',
                }}
              />
            </InputItem>
          </div>
          <div className={styles.agreeCon}>
            <AgreeItem
              checked={agree}
              onChange={e => {
                sessionStorage.setItem('agree', e.target.checked);
                this.setState({
                  agree: e.target.checked,
                });
              }}
            >
              <div className={styles.agree}>
                <div>
                  <span>已阅读并同意</span>
                  <a onClick={()=>{this.Link("/My/agreement/detail")}} style={{ color: '#0065FF' }}>
                        《用户服务协议》
                  </a>
                  <a onClick={()=>{this.Link("/My/agreement/Privacy")}} style={{ color: '#0065FF' }}>
                    《隐私政策》
                  </a>
                </div>
              </div>
            </AgreeItem>
          </div>
        </div>
        <div onClick={this.onRegist} className={agree ? styles.submitAct : styles.submit}>
          注册
        </div>
        <Modal
          className={styles.ppb}
          transparent
          maskClosable={true}
          wrapProps={{ onTouchStart: this.onWrapTouchStart }}
          visible={this.state.isShowSUCCModal}
          onClose={() => this.setState({ isShowSUCCModal: false })}
        >
          <img onClick={() => this.setState({ isShowSUCCModal: false })} className={styles.ppbClose} style={{ width: '0.24rem', height: '0.24rem' }} src={require('./images/close.png')} />
          <div className={styles.ppbContent}>
            <img
              style={{ width: '3.12rem', height: '3.12rem', marginTop: '0.50rem' }}
              src={require('./images/qrcode.jpeg')}
            />
            <span
              style={{
                fontSize: '0.32rem',
                fontWeight: '600',
                color: '#172B4D',
                marginTop: '0.28rem',
              }}
            >
              恭喜您注册成功!
            </span>
            <span
              style={{
                fontSize: '0.30rem',
                fontWeight: '400',
                color: '#172B4D',
                marginTop: '0.28rem',
              }}
            >
              长按识别二维码并关注澎湃保公众号
            </span>
            {/* <Button
              onClick={this.toPublic}
              type="primary"
              style={{
                width: '2rem',
                height: '0.8rem',
                lineHeight: '0.8rem',
                fontSize: '0.28rem',
                fontWeight: '500',
                marginTop: '0.28rem',
              }}
            >
              跳转
            </Button> */}
          </div>
        </Modal>
      </div>
    );
  }
}

export default createForm()(Index);
