import React, { Component, Fragment } from 'react';
import moment from 'moment';
import Page from './articles/page';
import { Toast, DatePicker, Picker, Modal, InputItem, Icon } from 'antd-mobile';
import { connect } from 'dva';
import RegEx from '@/utils/RegEx.js';
import ArtVerifyCode from '@/components/VerifyCode/Code';
import Captcha from '@/components/Captcha/index';
import Article from './article'
import WxSDK from "@/utils/wx-sdk";
import Utils from '@/utils/utils';
import District from "@/assets/commonData/district";
import styles from './index.less';
import IosKeyboardRetraction from '@/components/IosKeyboardRetraction/Index';

const InsuredData = [
    { value: '全家', label: '全家' },
    { value: '本人', label: '本人' },
    { value: '配偶', label: '配偶' },
    { value: '父母', label: '父母' },
    { value: '孩子', label: '孩子' }
];
const today = new Date();
const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate() - 1)
const defaultBirth = new Date(today.getFullYear() - 30, today.getMonth(), today.getDate() - 1)

@IosKeyboardRetraction
@connect(({ login }) => ({
    login
}))
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            birthday: '',
            areaName: '',
            insuranceTarget: ["本人"],
            mobile: '',
            validationCode: '',
            hasNameError: false,
            hasBirthError: false,
            hasAreaNameError: false,
            hasMobileError: false
        };
    }

    componentDidMount() {
        console.log(123)
        const { match: { params: { id: articleId } } } = this.props;
        const currentArticle = Page[articleId] || null;
        this.setState({ articleId, errArticle: !currentArticle })
        if (!currentArticle) return;

        WxSDK.share(currentArticle.wxShare)

        this.initCollectBd()

    }

    initCollectBd = () => {
        const { location: { query: { utm_term = "", utm_source = "", channel = "" } } } = this.props;
        const terminal = Utils.isMobile() ? 'mob' : 'pc';
        this.setState({ channel, terminal, utm_source, utm_term })

        Utils.domView(() => {
            Utils.collectBaiduHm(`msem_${terminal}_${channel}`, "view", utm_term)
        })
    }

    checkFormItem = (type, value = this.state[type]) => {
        let params = {}, result = true;
        switch (type) {
            case 'name':
                result = !value.length;
                params = { hasNameError: result };
                break;
            case 'birthday':
                result = !value;
                params = { hasBirthError: result };
                break;
            case 'mobile':
                result = RegEx.handleVerification('mobile', value);
                params = { hasMobileError: !!result, hasMobileErrorMsg: result };
                break;
            case 'areaName':
                result = !value.length;
                params = { hasAreaNameError: result };
                break;
            case 'validationCode':
                result = RegEx.handleVerification('validationCode6', value)
                params = { hasVerifyCodeError: !!result, hasVerifyCodeErrorMsg: result };
        };
        this.setState(params)
        return result;
    }

    checkSubmit = () => {
        return ['name', 'birthday', 'mobile', 'areaName', 'validationCode'].map(i => this.checkFormItem(i)).every(i => !i)
    }

    validationCode = () => {
        const { dispatch } = this.props;
        const { mobile, validationCode } = this.state;
        Toast.loading('Loading...', 0)
        return dispatch({
            type: 'login/validationCode',
            payload: {
                mobile,
                validationCode
            }
        })
    }
    /**
     * 失去焦点去除首尾空格
     */
    onBlur = (val, formItemName) => {
        const value = Utils.trim(val)
        switch (formItemName) {
            case 'name':
                this.checkFormItem('name', value)
                break;
            case 'mobile':
                break;
        }
        this.setState({ [formItemName]: value })
    }

    fomartValue = () => {
        const { name, birthday, areaName, insuranceTarget, mobile, channel } = this.state;
        return {
            name,
            mobile,
            channel,
            birthday: moment(birthday).format("YYYY-MM-DD"),
            areaName: Utils.districtCodeToStr(areaName).join(""),
            insuranceTarget: insuranceTarget[0],
        }
    }

    submit = () => {
        const { terminal, channel, utm_source, utm_term } = this.state;

        const notErr = this.checkSubmit();
        if (!notErr) {
            Toast.info("请按红字提示正确填写信息")
            Utils.collectBaiduHm(`msem_${terminal}_${channel}`, "click0", utm_term)
            return;
        };

        this.validationCode().then((res) => {
            if (!res) return;
            // 校验验证码成功
            const { token } = res.payload;
            //submit
            Toast.loading('Loading...', 0)
            const { dispatch } = this.props;
            dispatch({
                type: 'articles/submit',
                payload: {
                    token,
                    sourceUrl: window.location.href,
                    ...this.fomartValue()
                }
            }).then((res) => {
                if (res && res.code == 0) {
                    Utils.collectBaiduHm(`msem_${terminal}_${channel}`, "click1", utm_term);
                    // ocpc
                    (utm_source === 'baidu') && Utils.ocpcSubmitSuccess();

                    Toast.success(res.message || '提交成功', 2)
                } else {
                    Utils.collectBaiduHm(`msem_${terminal}_${channel}`, "click0", utm_term);
                    Toast.info(res && res.message || '提交失败', 2)
                }
            })
        })
    }

    collectBaiduHm = (stepInt) => {
        const { terminal, channel, utm_term } = this.state;
        Utils.collectBaiduHm(`msem_${terminal}_${channel}`, `step_${stepInt}`, utm_term)
    }

    render() {
        const { match: { params: { id: articleId } } } = this.props;
        const { errArticle, showCaptcha } = this.state;

        return (
            <Fragment>
                {errArticle ? <p>文章id错误</p> : <div className={styles.artContainer}>
                    <Article articleId={articleId} />
                    <div className={styles.artFormContainer} id="readWhole">
                        <img className={styles.artFormTitle} src={require('./images/formTitle.png')} />
                        <div className={styles.artForm}>
                            <ul className={styles.formItem}>
                                <li
                                    onClick={() => this.collectBaiduHm(1)}
                                >
                                    <InputItem
                                        clear
                                        maxLength={30}
                                        onChange={(name) => { this.setState({ name }) }}
                                        value={this.state.name}
                                        onBlur={(val) => this.onBlur(val, 'name')}
                                        placeholder="请输入真实姓名"
                                    >姓名</InputItem>
                                    {this.state.hasNameError && <p className={styles.errorMsg}>请输入姓名</p>}
                                </li>
                                <li>
                                    <DatePicker
                                        mode="date"
                                        title="选择日期"
                                        minDate={minDate}
                                        maxDate={today}
                                        value={this.state.birthday || defaultBirth}
                                        onChange={birthday => this.setState({ birthday, hasBirthError: false })}
                                    >
                                        <div onClick={() => this.collectBaiduHm(2)} className={styles.flexContent}>
                                            <span>出生日期</span>
                                            <div className={styles.pickerSel}>
                                                {this.state.birthday ? <span>{moment(this.state.birthday).format('YYYY-MM-DD')}</span> : <span style={{ color: '#BDBFBF' }}>请选择日期</span>}
                                                <span className={styles.arrow}><Icon size={'sm'} color="#999A9F" type={'right'} /></span>
                                            </div>
                                        </div>
                                    </DatePicker>
                                    {this.state.hasBirthError && <p className={styles.errorMsg}>请选择出生日期</p>}
                                </li>
                                <li>
                                    <Picker
                                        cols={2}
                                        data={District}
                                        value={this.state.areaName}
                                        title='请选择城市'
                                        onChange={areaName => this.setState({ areaName, hasAreaNameError: false })}
                                    >
                                        <div onClick={() => this.collectBaiduHm(3)} className={styles.flexContent}>
                                            <span>所在地区</span>
                                            <div className={styles.pickerSel}>
                                                {this.state.areaName ? <span>{Utils.districtCodeToStr(this.state.areaName).join("")}</span> : <span style={{ color: '#BDBFBF' }}>请选择城市</span>}
                                                <span className={styles.arrow}><Icon size={'sm'} color="#999A9F" type={'right'} /></span>
                                            </div>
                                        </div>
                                    </Picker>
                                    {this.state.hasAreaNameError && <p className={styles.errorMsg}>请选择所在地区</p>}
                                </li>
                                <li>
                                    <Picker
                                        cols={1}
                                        data={InsuredData}
                                        extra={<span style={{ color: '#BDBFBF' }}>为谁考虑保险<Icon type={'right'} /></span>}
                                        value={this.state.insuranceTarget}
                                        title='为谁考虑保险'
                                        onChange={insuranceTarget => this.setState({ insuranceTarget })}
                                    >
                                        <div onClick={() => this.collectBaiduHm(4)} className={styles.flexContent}>
                                            <span>为谁考虑保险</span>
                                            <div className={styles.pickerSel}>
                                                {this.state.insuranceTarget[0]}
                                                <span className={styles.arrow}><Icon size={'sm'} color="#999A9F" type={'right'} /></span>
                                            </div>
                                        </div>
                                    </Picker>
                                </li>
                                <li>
                                    <InputItem
                                        clear
                                        type="digit"
                                        onBlur={() => this.checkFormItem('mobile')}
                                        value={this.state.mobile}
                                        onChange={mobile => this.setState({ mobile: mobile.substr(0, 11) })}
                                        placeholder="请输入手机号码"
                                    >手机号码</InputItem>
                                    {this.state.hasMobileError && <p className={styles.errorMsg}>{this.state.hasMobileErrorMsg}</p>}
                                </li>
                                <li>
                                    <div className={styles.VerifyCodeItem}>
                                        <div className={styles.VerifyCodeItemLabel}>短信验证码</div>
                                        <div className={styles.verifyCodeInput}>
                                            <InputItem
                                                placeholder="请输入验证码"
                                                type="digit"
                                                onChange={validationCode => this.setState({ validationCode: validationCode.substr(0, 6) })}
                                                value={this.state.validationCode}
                                                onBlur={() => this.checkFormItem('validationCode')}
                                            />
                                        </div>
                                        <div className={styles.artVerifyCode} onClick={() => this.collectBaiduHm(5)}>
                                            <ArtVerifyCode
                                                phone={this.state.mobile}
                                                captcha={this.state.captcha}
                                                color="#FFAE00"
                                                dispatch={this.props.dispatch}
                                                dispatchType={"articles/sendCode"}
                                                onRef={(ref) => this.refVerifyCode = ref}
                                                getCodeClick={() => this.setState({ showCaptcha: true })}
                                                sendValidationSuccess={() => this.setState({ showCaptcha: false, captcha: undefined })}
                                                sendValidationFail={() => this.refCaptcha && this.refCaptcha.getCaptcha()}
                                            />
                                        </div>
                                    </div>
                                    {this.state.hasVerifyCodeError && <p className={styles.errorMsg}>{this.state.hasVerifyCodeErrorMsg}</p>}
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
                                            <InputItem
                                                clear
                                                type='text'
                                                placeholder=''
                                                onChange={captcha => this.setState({ captcha })}
                                            />
                                        </div>
                                        <div className="codetips">请输入下图中的字符，不区分大小写</div>
                                        <div className="captchaimg"><Captcha onRef={(ref) => this.refCaptcha = ref} /></div>
                                        <div className="getCode" onClick={() => this.refVerifyCode && this.refVerifyCode.sendCode()}>确 定</div>
                                    </div>
                                </Modal>
                            </ul>
                            <button className={styles.submit} onClick={this.submit}>一键获取专业保险顾问1V1免费服务</button>
                        </div>
                    </div>
                </div>}
            </Fragment>
        );
    }
}

export default Index;
