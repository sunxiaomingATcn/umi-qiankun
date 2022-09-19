/**
 * title: 选择商户机构
 */
import React, { Component } from 'react';
import { connect } from 'dva';
// import CacheUtils from '@/utils/CacheUtil';
import { Toast, Picker, Checkbox } from 'antd-mobile';
// import Select, { Option } from 'rc-select';
// import Util from '@/utils/utils';
import { history } from 'umi';
import { Link } from 'umi';
import { createForm } from 'rc-form';

// import 'rc-select/assets/index.less';
import styles from './index.scss';
import * as requestMethod from '@/services/publicLogin';
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

@connect(({ login, loading }) => ({
  login,
  loading: loading.models.login,
}))
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginData: {
        tenantList: []
      },
      agree: sessionStorage.agree,
    };
  }

  componentDidMount() {
    const { setFieldsValue } = this.props.form;
    const loginDataStr = localStorage.getItem('loginData');
    if(!loginDataStr){
      Toast.fail('数据异常',2);
      return
    }
    let loginData = JSON.parse(loginDataStr);
    if(loginData.tenantList){
      loginData.tenantList = loginData.tenantList.map((item)=>{
        return {...item,value:item.tenantId,label:item.tenantName}
      })
      this.props.form.setFieldsValue({tenantId:[loginData.tenantId]})
      this.setState({tenantId:loginData.tenantId})
    }
    if(localStorage.loginTenantId){
      setFieldsValue({tenantId:[localStorage.loginTenantId]})
    }
    this.setState({
      loginData,
    });
  }

  componentWillUnmount() {
  }

  onLogin = () => {
    const { agree } = this.state
    if(agree){
      this.props.form.validateFields((error, value) => {
        if (error) return;
        if (!value.tenantId) {
          Toast.fail('请选择商户机构', 2);
          return;
        }
        if(!agree){
          Toast.fail('请阅读并同意用户服务协议、隐私协议', 2);
          return;
        }
        const {loginData:{key,openid}} = this.state;
        let formData = new FormData();
        formData.append('loginType', 'mobile');
        formData.append('key', key);
        formData.append('mobile', localStorage.mobile);
        formData.append('openid', openid);
        formData.append('tenantId', value.tenantId);
        requestMethod
          .login(formData)
          .then(res => {
            this.composeLoginRes(res);
          });
      });
    }

  };

  composeLoginRes = (res) =>{
    if (res) {
      if (res.code === 200) {
        this.props.dispatch({
          type: 'publichome/saveUserInfo',
          payload: res.data,
        });
        //登录成功保存登录数据
        localStorage.setItem('loginData', JSON.stringify(res.data));
        history.replace('/PublicHome');
      } else if (res.code === 400) {
        Toast.fail(res.msg);
      }
    }
  }

  Link = (path,e) =>{
    e.preventDefault()
    this.props.form.validateFields((error, value) => {
      if (!value.tenantId) {
        Toast.fail('请选择商户机构', 2);
        return;
      }
      history.push({pathname:path,query:{id:value.tenantId}});
    });
  }

  render() {
    const { loginData:{tenantList=[]},agree } = this.state;
    const { getFieldProps } = this.props.form;

    return (
      <div className={styles.container}>
        <span>Hi,</span>
        <span>欢迎来到澎湃保</span>
        <span>请选择商户机构</span>
        <img src={require('./images/top-bg.png')} />
        <div className={styles.formCon}>
          <div className={styles.itemCon}>
            <Picker
              data={tenantList}
              cols={1}
              {...getFieldProps('tenantId')}
              onOk={(value)=>{
                localStorage.setItem('loginTenantId',value[0])
                let loginData = JSON.parse(localStorage.loginData)
                let result = value[0] == loginData.tenantId
                this.setState({tenantId:value[0],agree:result})
                sessionStorage.setItem('agree', result ? true : '');
              }}
            >
              <CustomChildren>请选择商户机构</CustomChildren>
            </Picker>
          </div>
          <div className={styles.tipsCon}>*注意：检测手机号绑定多个租户工号，请选择商户机构 </div>
          <div className={styles.agreeCon}>
            <AgreeItem
              checked={agree}
              onChange={e => {
                sessionStorage.setItem('agree', e.target.checked?true:'');
                this.setState({
                  agree: e.target.checked,
                });
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
          登录
        </div>
      </div>
    );
  }
}

export default createForm()(Index);
