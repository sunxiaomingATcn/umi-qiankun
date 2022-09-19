/**
 * title: 康爱保中老年专属保险
 */
import React, { Component, Fragment } from 'react';
import { InputItem, Picker, Toast } from 'antd-mobile';
import Utils from '@/utils/utils';
import styles from './index.less';
import Reg from '@/utils/RegEx';
import { connect } from 'dva';

var ageArr = []
for (var i = 0; i <= 60; i++) {
    ageArr.push({ value: `${i}岁`, label: `${i}岁` })
}
var timeArr = [
    { value: "终身", label: "终身" },
    { value: "至80岁", label: "至80岁" }
];
var  BaiduHm=true
@connect(({ login,active }) => ({
    login,
    active
}))
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showScrollTopVis: false,
            timevalue: ["终身"],
            agevalue: ["40岁"],
            content: "获取验证码",
            disabled: true,
            countdownSuffix: "秒后重发",
            countdown: 60,
        };
    }

    componentDidMount() {
        const { history: { location: { query: { channel } } } } = this.props
        this.showScrollTop()
        Utils.collectBaiduHm(`dsp_${channel?channel:''}`, 'open')
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    showScrollTop = () => {
        window.addEventListener('scroll', () => {
            const { history: { location: { query: { channel } } } } = this.props
            const oDiv = document.getElementById("formInputs");
            if (!oDiv) return;
            const boundingClient = oDiv.getBoundingClientRect();
            const showScrollTopVis = !!(boundingClient.height + boundingClient.top <= 0)
            this.setState({ showScrollTopVis }, () => {
                if(this.state.showScrollTopVis&&BaiduHm){
                Utils.collectBaiduHm(`dsp_${channel?channel:''}`, 'view')
                BaiduHm=false
                }
            })
        })
    }
    goTop = () => {
        const formScroll = document.getElementById("img1").height;
        const timer = setInterval(() => {
            let osTop = document.documentElement.scrollTop || document.body.scrollTop;
            let s = Math.floor(-osTop / 5);
            document.documentElement.scrollTop = document.body.scrollTop = osTop + s;
            if (osTop <= String(formScroll)) {
                clearInterval(timer);
            }
        }, 30)
    }

    /**
     * 倒计时
     */
    setTime = () => {
        let countdown = this.state.countdown;
        console.log(countdown)
        const { countdownSuffix } = this.state;
        this.setState({ disabled: false, content: countdown + countdownSuffix });
        this.timer = setInterval(() => {
            console.log(countdown)
            if (countdown < 1) {
                this.setState({
                    content: '重发验证码',
                    disabled: true
                });
                clearInterval(this.timer);
            } else {
                this.setState({
                    content: countdown + countdownSuffix,
                    disabled: false
                });
                countdown--;
            }
        }, 1000);
    };

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

    submit() {
        const { mobile, chinese, validationCode } = this.state;
        const checkMobile = this.handleBlur('mobile', mobile, Reg.mobile);
        const checkChinese = this.handleBlur('chinese', chinese, Reg.chinese);
        const checkValidationCode = this.handleBlur('validationCode', validationCode, Reg.validationCode6);
        const { history: { location: { query: { channel } } } } = this.props
        const checkSubmit = !checkMobile && !checkChinese && !checkValidationCode;
        if (!checkSubmit) {
            Toast.info("请按红字提示正确填写信息")
            return;
        }
        this.validationCode().then(res => {
            if (!res) return;
            this.props.dispatch({
                type:"active/short_video_submit",
                payload:{
                    name:this.state.chinese,
                    mobile:this.state.mobile,
                    age:this.state.agevalue[0],
                    safeguardPeriod:this.state.timevalue[0],
                    sourceUrl:window.location.href,
                    channel:channel?channel:''
                }
            }).then(res=>{
                if(res.code==0){
                    Utils.collectBaiduHm(`dsp_${channel?channel:''}`, 'submit')
                    Toast.success(`恭喜您提交成功，稍后保险顾问会告知您保费测算结果，请留意开头为010896的来电，昆仑健康联合阿保保险，为您提供专业的保险服务，让您省时、省心、更省钱！`, 5)
                }else{
                    Toast.fail(res.message)
                }
            })
        })
    }

    getCode() {
        let mobileValErr = this.handleBlur('mobile', this.state.mobile, Reg.mobile)
        if (mobileValErr)
            return
        if (!this.state.disabled)
            return
        this.props.dispatch({
            type: "login/sendValidation",
            payload: {
                mobile: this.state.mobile
            }
        }).then((data) => {
            if (data.code === 0) {
                Toast.info(data.message || '验证码发送成功', 2);
                this.setTime()
                // 成功发送验证码并倒计时
            } else {
                Toast.info(data && data.message || '验证码发送失败', 2);
            }
        })
    }

    handleBlur = (key, val, reg) => {
        const result = !reg.test(val);
        this.setState({
            [`${key}ValErr`]: result ? `请输入${val ? '正确' : ''}${key == 'mobile' ? '手机号码' : key == 'validationCode' ? '短信验证码' : '姓名'}` : undefined
        })
        return result;
    }

    render() {
        const { showScrollTopVis, mobileValErr, validationCodeValErr, chineseValErr } = this.state;
        return (
            <Fragment>
                <div className={styles.shortVideo}>
                    <img src={require("./images/1.png")} id={"img1"} />
                    <div className={styles.form} id={"formInputs"}>
                        <p className={styles.p1}>当有一天，如果疾病来临</p>
                        <p className={styles.p2}>只期望不会因为没钱放弃自己或亲人的生命</p>
                        <div className={styles.age}>
                            <p>被保人年龄</p>
                            <Picker
                                data={ageArr}
                                cols={1}
                                value={this.state.agevalue}
                                onOk={agevalue => this.setState({
                                    agevalue
                                })}
                            >
                                <div className={styles.ageipt}>
                                    {this.state.agevalue}
                                    <img src={require("./images/arrow.png")}></img>
                                </div>
                            </Picker>
                        </div>
                        <div className={styles.time}>
                            <p>保障期限</p>
                            <Picker
                                data={timeArr}
                                cols={1}
                                value={this.state.timevalue}
                                onOk={timevalue => this.setState({
                                    timevalue
                                })}
                            >
                                <div className={styles.timeipt}>
                                    {this.state.timevalue}
                                    <img src={require("./images/arrow.png")}></img>
                                </div>
                            </Picker>
                        </div>
                        <div className={styles.name}>
                            <InputItem
                                placeholder="您的信息将被严格保密"
                                onBlur={v => this.handleBlur('chinese', v, Reg.chinese)}
                                value={this.state.chinese}
                                onChange={mobile => this.setState({ chinese: mobile.substr(0, 15) })}
                            >
                                <p>您的姓名</p>
                            </InputItem>
                            {chineseValErr && <p className={styles.error}>{chineseValErr}</p>}
                        </div>
                        <div className={styles.mobile}>
                            <InputItem
                                type="digit"
                                placeholder="仅用于保费测算"
                                onBlur={v => this.handleBlur('mobile', v, Reg.mobile)}
                                value={this.state.mobile}
                                onChange={mobile => this.setState({ mobile: mobile.substr(0, 11) })}
                            >
                                <p>手机号</p>
                            </InputItem>
                            {mobileValErr && <p className={styles.error}>{mobileValErr}</p>}
                        </div>
                        <div className={styles.code}>
                            <InputItem
                                style={{ width: "2.35rem" }}
                                type="digit"
                                placeholder="请输入验证码"
                                onChange={validationCode => this.setState({ validationCode: validationCode.substr(0, 6) })}
                                value={this.state.validationCode}
                                onBlur={v => this.handleBlur('validationCode', v, Reg.validationCode6)}
                            >
                                <p>验证码</p>
                            </InputItem>
                            {validationCodeValErr && <p className={styles.error} >{validationCodeValErr}</p>}
                            <div className={styles.getCode} style={{ color: this.state.disabled ? "#fff" : "rgba(0, 0, 0, 0.25)", background: this.state.disabled ? "linear-gradient(90deg, #FFBE88, #FF6E1F)" : "#f5f5f5" }} onClick={() => { this.getCode() }}>{this.state.content}</div>
                        </div>
                        <div className={styles.toopic}>部分手机短信收取<span style={{ color: "#FF561A" }}>验证码</span>会有<span style={{ color: "#FF561A" }}>5s</span>左右延迟</div>
                        <div className={styles.button} onClick={() => { this.submit() }}><img src={require("./images/button.png")}></img> <p>立即免费测算保费</p></div>
                    </div>
                    <img src={require("./images/2.png")} />
                    <img src={require("./images/3.png")} />
                    <img src={require("./images/4.png")} />
                    <img src={require("./images/5.png")} />
                    <img src={require("./images/6.png")} />
                    <div className={styles.footer} style={{ display: showScrollTopVis ? "flex" : "none" }} onClick={this.goTop} >
                        立即免费测算保费
                    </div>
                </div>
            </Fragment>
        );
    }
}

export default index;