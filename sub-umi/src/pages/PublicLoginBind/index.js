/**
 * title: 绑定工号
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './index.scss';
// import CacheUtils from '@/utils/CacheUtil';
import { Toast, InputItem, Checkbox } from 'antd-mobile';
// import Util from '@/utils/utils';
import { history } from 'umi';
import { Link } from 'umi';
import { createForm } from 'rc-form';
const AgreeItem = Checkbox.AgreeItem;

@connect(({ login, loading }) => ({
  login,
  loading: loading.models.login,
}))
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disabled: true,
      codeText: '发送验证码',
      isWait: false,
    };
  }

  componentDidMount() {}

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  /**
   * 倒计时
   */
  setTime = () => {
    this.setState({ isWait: true, disabled: false });
    let countdown = 60;
    this.setState({ codeText: countdown + 's后重新发送' });
    this.timer = setInterval(() => {
      if (countdown === 0) {
        this.setState({
          codeText: '重新获取',
          isWait: false,
          disabled: true,
        });
        clearInterval(this.timer);
      } else {
        countdown--;
        this.setState({
          codeText: countdown + 's后重新发送',
          disabled: false,
        });
      }
    }, 1000);
  };

  getCodeClick = e => {
    e.preventDefault();
    const { phone } = this.state;
    const { dispatch } = this.props;
    if (this.state.isWait) {
      return false;
    }
    if (!this.checkData()) return false;
    dispatch({
      type: 'login/sendValidation',
      payload: {
        mobile: phone,
      },
    }).then(data => {
      if (data.code === 0) {
        Toast.success('验证码发送成功', 2);
        // 接口成功发送验证码并倒计时
        this.setTime();
      }
    });
  };

  onLogin = () => {
    history.push('/PublicHome');
    return
    this.props.form.validateFields((error, value) => {
      if (error) return;
      const { dispatch } = this.props;
      dispatch({
        type: 'login/validationCode',
        payload: {
          mobile: value.mobile,
          verifyCode: value.verifyCode,
        },
      }).then(data => {
        if (data.code === 0) {
          history.push('/policy?searchBy=phone');
        }
      });
    });
  };

  render() {
    const { isWait, disabled, codeText } = this.state;
    const { getFieldProps, getFieldError } = this.props.form;

    return (
      <div className={styles.container}>
        <span>Hi,</span>
        <span>欢迎来到澎湃保</span>
        <span>请绑定工号</span>
        <img src={require('./images/top-bg.png')} />
        <div className={styles.formCon}>
          <div className={styles.itemCon}>
            <InputItem
              {...getFieldProps('mobile')}
              labelNumber="2"
              maxLength="11"
              placeholder="请输入绑定的工号"
            >
              <div
                style={{
                  backgroundImage: `url(${require('./images/number.png')})`,
                  backgroundSize: 'cover',
                  height: '18px',
                  width: '18px',
                }}
              />
            </InputItem>
          </div>
          <div className={styles.itemCon} style={{ marginTop: '0.2rem' }}>
            <InputItem
              {...getFieldProps('verifyCode')}
              labelNumber="2"
              maxLength="8"
              placeholder="请输入绑定的姓名"
            >
              <div
                style={{
                  backgroundImage: `url(${require('./images/name.png')})`,
                  backgroundSize: 'cover',
                  height: '18px',
                  width: '18px',
                }}
              />
            </InputItem>
          </div>
          <div className={styles.tipsCon}>
            *注意：绑定工号后，默认工号代理人身份
          </div>
        </div>
        <div onClick={this.onLogin} className={styles.submitAct}>
          绑定
        </div>
      </div>
    );
  }
}

export default createForm()(Index);
