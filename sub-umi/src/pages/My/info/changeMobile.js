/**
 * title: 重新绑定
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Toast, InputItem } from 'antd-mobile';
import styles from './info.scss';
import WxSdk from '@/utils/wx-sdk';
import { createForm } from 'rc-form';
import * as requestMethod from '@/services/publicLogin';
import { history } from 'umi';

@connect(({ my }) => ({
    my,
}))
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            disabled: true,
            codeText: '发送验证码',
            isWait: false,
            showContent: false,
        };
    }

    componentDidMount() {}

    setTime = () => {
        this.setState({ isWait: true, disabled: false });
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
                    disabled: false,
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

    next = () => {
        const { disabled = true } = this.state;
        if (disabled) {
            return;
        }
        this.props.form.validateFields((error, value) => {
            if (error) return;
            if (!this.checkMobile(value.mobile)) {
                return;
            }
            if (!value.verificationCode) {
                Toast.fail('验证码错误，请重新输入', 2);
                return;
            }
            // let formData = new FormData();
            // formData.append('mobile', value.mobile);
            // formData.append('verificationCode', value.verificationCode);
            this.props
                .dispatch({
                    type: 'my/changeMobile',
                    payload: {
                        mobile: value.mobile,
                        verificationCode: value.verificationCode,
                    },
                })
                .then(res => {
                    if (res && res.code == 200) {
                        history.replace('/My/info');
                    }
                });
        });
    };
    render() {
        const { isWait, disabled, codeText, showContent = false } = this.state;
        const { getFieldProps } = this.props.form;
        return (
            <div className={styles.info}  style={{padding:'0 0.6rem'}}>
                <div className={styles.formCon}>
                    <div className={styles.itemCon}>
                        <InputItem
                            {...getFieldProps('mobile')}
                            labelNumber="2"
                            clear
                            type="number"
                            placeholder="请输入手机号"
                        >
                            <div
                                style={{
                                    backgroundImage: `url(${require('../assets/img/phone.png')})`,
                                    backgroundSize: 'cover',
                                    height: '18px',
                                    width: '18px',
                                }}
                            />
                        </InputItem>
                    </div>
                    <div className={styles.itemCon} style={{ marginTop: '0.4rem' }}>
                        <InputItem
                            {...getFieldProps('verificationCode')}
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
                                    backgroundImage: `url(${require('../assets/img/verify.png')})`,
                                    backgroundSize: 'cover',
                                    height: '18px',
                                    width: '18px',
                                }}
                            />
                        </InputItem>
                    </div>
                </div>
                <div onClick={this.next} className={disabled ? styles.submit : styles.submitAct}>
                    下一步
                </div>
            </div>
        );
    }
}

export default createForm()(Index);
