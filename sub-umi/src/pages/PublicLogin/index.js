/**
 * title: 手机号登录
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './index.scss';
// import CacheUtils from '@/utils/CacheUtil';
import { Toast, InputItem, Checkbox, Picker } from 'antd-mobile';
// import Util from '@/utils/utils';
import { history } from 'umi';
import { Link } from 'umi';
import { createForm } from 'rc-form';
import * as requestMethod from '@/services/publicLogin';
import utils from '@/utils/utils';
const AgreeItem = Checkbox.AgreeItem;
const CustomChildren = props => {
  return (
    <div onClick={props.onClick} className={styles.cusCon}>
      <div className={styles.cusContent}>
        <img src={require('./images/org.png')} />
        <div className={styles.cusText} style={props.extra==='请选择' ? { color: '#B3BAC5' } : {}}>
          {props.extra!=='请选择' ? props.extra : props.children}
        </div>
        <img src={require('./images/arrow.png')} />
      </div>
    </div>
  );
};
@connect()
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      codeText: '发送验证码',
      isWait: false,
      showContent: false,
      agree: false,
      tenantList:[]
    };
  }

  componentDidMount() {
    this.composeWXLink();
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  generateParams(sufUrl) {
    let params = {};
    if (!sufUrl) {
      return params;
    }
    let index1 = sufUrl.indexOf('?');
    if (sufUrl.length <= index1 + 1) {
      return params;
    }
    let subString1 = sufUrl.substring(index1 + 1);
    let arr = subString1.split('&');
    for (let i in arr) {
      let kv = arr[i];
      let kvArr = kv.split('=');
      if (kvArr && kvArr.length === 2) {
        params[kvArr[0]] = kvArr[1];
      }
    }
    return params;
  }

  composeWXLink = () => {
    const { setFieldsValue } = this.props.form;
    if(localStorage.loginMobile){
      this.queryTenant(localStorage.loginMobile)
      setFieldsValue({mobile:localStorage.loginMobile})
    }
    if(localStorage.loginTenantId){
      this.setState({tenantId:localStorage.loginTenantId})
      setFieldsValue({tenantId:[localStorage.loginTenantId]})
    }
    console.log(window.location);
    let searchStr = window.location.search;
    console.log('[searchStr]', searchStr);
    if (searchStr) {
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
      this.code = sessionStorage.code;
      if (sessionStorage.showContent) {
        this.openid = localStorage.openid;
        //601重新回到登录页面
        this.setState({
          showContent: true,
          agree: sessionStorage.agree && JSON.parse(sessionStorage.agree),
        });
        const { form } = this.props;
        if (form) {
          form.setFieldsValue({
            verificationCode: sessionStorage.verificationCode,
          });
        }
      } else {
        //静默登录
        let formData = new FormData();
        formData.append('loginType', 'wechat');
        formData.append('code', this.code);
        requestMethod.login(formData).then(res => {
          if (!res) return;
          this.composeLoginRes(res);
        });
      }
    }
  };

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
    const { tenantList = [] } = this.state
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
    if(tenantList.length==0){
      Toast.fail('手机号没有权限，请联系管理员');
      return;
    }
    if(!this.state.tenantId){
      Toast.fail('请选择商户机构', 2);
      return
    }
    requestMethod
      .sendVerification({
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

  onLogin = () => {
    const { agree = false, tenantList = [],tenantId } = this.state;
    if (agree) {
      if (!this.openid) {
        Toast.fail('未获取到 openid', 2);
        return;
      }
      if(tenantList.length==0){
        Toast.fail('手机号没有权限，请联系管理员');
        return;
      }
      this.props.form.validateFields((error, value) => {
        if (error) return;
        if (!agree) {
          Toast.fail('请阅读并同意用户服务协议、隐私协议', 2);
          return;
        }
        if (!this.checkMobile(value.mobile)) {
          return;
        }
        if (!value.verificationCode) {
          Toast.fail('验证码错误，请重新输入', 2);
          return;
        }
        if (!tenantId) {
          Toast.fail('请选择商户机构', 2);
          return;
        }
        let formData = new FormData();
        formData.append('loginType', 'mobile');
        formData.append('mobile', value.mobile);
        formData.append('openid', this.openid);
        formData.append('verificationCode', value.verificationCode);
        formData.append('tenantId', tenantId);
        requestMethod.login(formData).then(res => {
          if (!res) return;
          this.composeLoginRes(res, value.mobile);
        });
      });
    }
  };

  composeLoginRes = (res, mobile) => {
    localStorage.setItem('mobile', mobile);
    if (res) {
      if (res.code === 200) {
        //登录成功保存登录数据
        this.openid = res.data.openid;
        localStorage.setItem('openid', this.openid);
        localStorage.setItem('loginData', JSON.stringify(res.data));
        sessionStorage.clear();
        history.replace('/PublicHome');
      } else if (res.code === 600) {
        //首次登录，需要手机号登录
        this.openid = res.data.openid;
        localStorage.setItem('openid', this.openid);
        this.setState({
          showContent: true,
        });
        sessionStorage.showContent = true;
      } else if (res.code === 601) {
        //手机号绑定了多个商户需要选择商户
        //选择商户页面需要用到本地缓存数据，这里的数据是不全的，会在选择商户后覆盖掉。
        this.openid = res.data.openid;
        localStorage.setItem('openid', this.openid);
        sessionStorage.clear();
        localStorage.setItem('loginData', JSON.stringify(res.data));
        history.replace('/PublicHome');
      } else if (res.code === 400) {
        Toast.fail(res.msg);
      }
    }
  };

  Link = (path,e) =>{
    e.preventDefault()
    const { tenantId, tenantList=[] } = this.state
    if(tenantList.length==0){
      Toast.fail('手机号没有权限，请联系管理员');
      return;
    }
    if (!tenantId) {
      Toast.fail('请选择商户机构', 2);
      return;
    }
    this.props.form.validateFields((error, value) => {
      if (!this.checkMobile(value.mobile)) {
        return;
      }
      history.push({pathname:path,query:{id:tenantId}});
    });
  }

  queryTenant = (value) =>{
    const { setFieldsValue } = this.props.form;
    setFieldsValue({mobile:value})
    if(/^1[3456789]\d{9}$/.test(value)){
      localStorage.setItem('loginMobile',value)
      sessionStorage.setItem('mobile', value);
      requestMethod.queryTenant(value).then(res=>{
        if (res && res.code === 200) {
          let tenantList = res.data
          if(tenantList.length>=2){
            tenantList = tenantList.map((item,index)=>{
              return {...item, value:item.tenantId, label:item.tenantName}
            })
            this.setState({tenantList})
          }else{
            if(tenantList.length>0){
              this.setState({tenantList,tenantId:tenantList[0].tenantId})
              setFieldsValue({tenantId:[tenantList[0].tenantId]})
            }else{
              this.setState({tenantList:[],tenantId:''})
              Toast.fail('手机号没有权限，请联系管理员');
            }
          }
        }else{
          this.setState({tenantList:[],tenantId:''})
          Toast.fail(res?.msg || '手机号没有权限，请联系管理员');
        }
      })
    }
  }

  render() {
    const { isWait, codeText, showContent = false, agree = false, tenantList = [] } = this.state;
    const { getFieldProps, getFieldValue, setFieldsValue } = this.props.form;
    return (
      <div>
          <div className={styles.container} style={{display: showContent ? 'flex' : 'none'}}>
            <span>Hi,</span>
            <span>欢迎来到澎湃保</span>
            <span>请登录</span>
            <img src={require('./images/top-bg.png')} />
            <div className={styles.formCon}>
              <div className={styles.itemCon}>
                <InputItem
                  {...getFieldProps('mobile')}
                  onChange={val => {
                    setFieldsValue({tenantId:[]})
                    this.setState({tenantId:''})
                    this.queryTenant(val)
                  }}
                  labelNumber="2"
                  clear
                  type="number"
                  placeholder="请输入手机号"
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
              <br/>
              {<div className={`${styles.itemCon} ${styles.tenant}`} style={{display:tenantList?.length>1?'flex':'none'}}>
                <Picker
                  data={tenantList}
                  cols={1}
                  {...getFieldProps('tenantId')}
                  onOk={(value)=>{
                    localStorage.setItem('loginTenantId',value[0])
                    this.setState({tenantId:value[0]})
                  }}
                >
                  <CustomChildren>请选择商户机构</CustomChildren>
                </Picker>
              </div>}
              <div className={styles.itemCon} style={{ marginTop: '0.2rem' }}>
                <InputItem
                  {...getFieldProps('verificationCode')}
                  onBlur={val => sessionStorage.setItem('verificationCode', val)}
                  extra={
                    <span
                      onClick={this.getCodeClick}
                      style={{
                        color: isWait ? '#8993A4' : '#0065FF',
                        fontSize: '14px',
                      }}
                    >
                      {codeText}
                    </span>
                  }
                  labelNumber="2"
                  type="number"
                  clear
                  maxLength="8"
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
                    const mobile = getFieldValue('mobile')
                    if(/^1[3456789]\d{9}$/.test(mobile)){
                      sessionStorage.setItem('agree', e.target.checked);
                      this.setState({
                        agree: e.target.checked,
                      });
                    }else{
                      Toast.fail('请先输入正确手机号', 2);
                    }
                  }}
                >
                  <div className={styles.agree}>
                    <div>
                      <span>已阅读并同意</span>
                      <a onClick={(e)=>{this.Link("/My/agreement/detail",e)}} style={{ color: '#0065FF' }}>
                        《用户服务协议》
                      </a>
                      <a onClick={(e)=>{this.Link("/My/agreement/Privacy",e)}} style={{ color: '#0065FF' }}>
                        《隐私政策》
                      </a>
                    </div>
                  </div>
                </AgreeItem>
              </div>
            </div>
            <div onClick={this.onLogin} className={agree ? styles.submitAct : styles.submit }>
              手机号登录
            </div>
          </div>
      </div>
    );
  }
}

export default createForm()(Index);
