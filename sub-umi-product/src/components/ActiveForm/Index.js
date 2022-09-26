/**
 * Class activeForm：活动登录表单
 * @prop isSimple{Boolean} false： 无手机号、验证码输入框，true：有...； default value： false
 * @prop submitText{String} submit button text
 * @prop submitOnClick{fn} click submit callback =>(formValue) not required
 * @prop initFormValue{Object} initFormValue={} 表单初始值 {name,birthday,mobile,validationCode} not required
 * @prop getFormValue{fn} getFormValue={(fn) => { this.getActiveForm = fn }} 传递获取表单所有值得方法给父组件 not required
 * @prop onChange{fn} 表单值改变监听
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import IosKeyboardRetraction from '@/components/IosKeyboardRetraction/Index';
import styles from './index.scss';
import { Toast, DatePicker, Modal } from 'antd-mobile';
import VerifyCode from '@/components/VerifyCode/Code';
import Captcha from '@/components/Captcha/index';
import RegEx from '@/utils/RegEx.js';

function formatDate(date) {
    const pad = n => n < 10 ? `0${n}` : n;
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

@IosKeyboardRetraction
@connect(({ login }) => ({
    login
}))
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            birthday: null,
            mobile: '',
            validationCode: '',
            isSimple: false,
            showCaptcha: false
        }
    }

    componentDidMount() {

        const { initFormValue, getFormValue } = this.props;
        // 传递获取表单所有值得方法给父组件
        getFormValue && getFormValue(this.formValue)
        // 赋值初始值
        this.setState({
            ...initFormValue
        })
    }

    static getDerivedStateFromProps(nextProps, prevState) {
    }

    handleChange = (key, val, max) => {
        this.setState({
            [key]: max ? val.target.value.slice(0, max) : val.target.value
        })

        Promise.resolve().then(() => {
            const { onChange } = this.props;
            onChange && onChange(this.formValue())
        })
    }

    //获取表单值得方法，提供给父组件使用
    formValue = () => {
        const { isSimple } = this.props;
        const { name, birthday, mobile, validationCode } = this.state;
        return isSimple ? { name, birthday } : { name, birthday, mobile, validationCode: validationCode };
    }

    activate = () => {
        const { submitOnClick, isSimple } = this.props;
        const { mobile, name, birthday, validationCode } = this.state;
        if (!this.checkData()) return;
        const result = isSimple ? { name, birthday: formatDate(birthday) } : {
            mobile,
            validationCode,
            name,
            birthday: formatDate(birthday)
        }
        submitOnClick && submitOnClick(result)
    }

    /**
     * 校验表单
     */
    checkData = () => {
        const { isSimple } = this.props;
        const { name, birthday, mobile, validationCode } = this.state;
        const formRegEx = isSimple ? { name, birthday } : { name, birthday, mobile, validationCode6: validationCode };
        const err = RegEx.handleVerifications(formRegEx)
        if (err) {
            Toast.fail(err, 2)
            return false;
        }
        return true;
    };

    render() {
        const { isSimple, submitText } = this.props;
        const { showCaptcha } = this.state;

        return (
            <div className={styles.container_wrapper}>
                <ul>
                    <li className={[styles.flex, styles.justify_between, styles.align_center].join(' ')}>
                        <input type='text'
                            placeholder='请输入您的姓名'
                            className={styles.name}
                            maxLength={30}
                            onChange={v => this.handleChange('name', v)}
                            value={this.state.name}
                        />
                        <DatePicker
                            mode="date"
                            title="选择日期"
                            minDate={new Date(new Date().getFullYear() - 100, 0, 1)}
                            maxDate={new Date()}
                            onChange={v => this.setState({ birthday: v })}
                            value={this.state.birthday}
                        >
                            <p className={styles.birth}>
                                <span className={this.state.birthday ? styles.selected : ""}>
                                    {this.state.birthday && formatDate(this.state.birthday) || '请选择您的出生日期'}
                                </span>
                            </p>
                        </DatePicker>
                    </li>
                    {!isSimple && <Fragment>
                        <li className={[styles.flex, styles.justify_between, styles.align_center].join(' ')}>
                            <input type="number"
                                pattern="[0-9]*"
                                placeholder='请输入您的手机号'
                                className={styles.flex_basis}
                                onChange={v => this.handleChange('mobile', v, 11)}
                                value={this.state.mobile}
                                maxLength={11}
                            />
                        </li>
                        <li className={[styles.flex, styles.justify_between, styles.align_center].join(' ')}>
                            <input type="number"
                                pattern="[0-9]*"
                                placeholder='请输入您的验证码'
                                maxLength={6}
                                onChange={v => this.handleChange('validationCode', v, 6)}
                                value={this.state.validationCode}
                                className={styles.code} />
                            <VerifyCode
                                phone={this.state.mobile}
                                captcha={this.state.captcha}
                                // type={"active"}
                                color="#CA8506"
                                codeText={"获取验证码"}
                                onRef={(ref) => this.refVerifyCode = ref}
                                getCodeClick={() => this.setState({ showCaptcha: true })}
                                sendValidationSuccess={() => this.setState({ showCaptcha: false, captcha: undefined })}
                                sendValidationFail={() => this.refCaptcha && this.refCaptcha.getCaptcha()}
                            />
                        </li>
                        <Modal
                            visible={showCaptcha}
                            transparent
                            maskClosable={false}
                            closable
                            className="cus_modal"
                            onClose={() => this.setState({ showCaptcha: false })}
                            title="请输入验证码"
                        >
                            <div className="captchaContainer">
                                <div className="captcha">
                                    <input
                                        clear
                                        type='text'
                                        placeholder=''
                                        onChange={v => this.handleChange('captcha', v)}
                                    />
                                </div>
                                <div className="codetips">请输入下图中的字符，不区分大小写</div>
                                <div className="captchaimg"><Captcha onRef={(ref) => this.refCaptcha = ref} /></div>
                                <div className="getCode" onClick={() => this.refVerifyCode && this.refVerifyCode.sendCode()}>确 定</div>
                            </div>
                        </Modal>
                    </Fragment>}
                </ul>
                {this.props.children}
                <div
                    onClick={(e) => this.activate(e)}
                    className={[styles.flex, styles.center, styles.submit].join(' ')}
                >{submitText}
                </div>
            </div>
        );
    }
}

export default Index;
