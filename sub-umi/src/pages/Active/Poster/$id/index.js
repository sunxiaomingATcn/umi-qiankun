import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Picker, InputItem, Toast } from 'antd-mobile';
import Utils from '@/utils/utils';
import WxSDK from "@/utils/wx-sdk";
import RegEx from '@/utils/RegEx.js';
import Page from '../page'
import styles from './index.less';
import IosKeyboardRetraction from '@/components/IosKeyboardRetraction/Index';

const InsuredData = [
    { value: '全家', label: '全家' },
    { value: '本人', label: '本人' },
    { value: '配偶', label: '配偶' },
    { value: '父母', label: '父母' },
    { value: '孩子', label: '孩子' }
];

const genders = [
    { value: '男士', label: '男士' },
    { value: '女士', label: '女士' },
]

@connect(({ poster }) => ({
    poster
}))
@IosKeyboardRetraction
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            gender: '',
            mobile: '',
            insuranceTarget: '',
            flag:true
        };
    }

    componentDidMount() {
        let node = document.createElement("noscript")
        let img = document.createElement("img")
        img.height=1
        img.width=1
        img.style='display:none;'
        img.src="https://a.gdt.qq.com/pixel?user_action_set_id=1110916290&action_type=PAGE_VIEW&noscript=1"
        node.appendChild(img)
        document.querySelector("head").appendChild(node)
        console.log(document.querySelector("head"))
        const { match: { params: { id: posterId } } } = this.props;
        console.log(this.props)
        const currentPoster = Page[posterId] || null;
        this.setState({ posterId, currentPoster })

        if (!currentPoster) return;
        WxSDK.share(currentPoster.wxShare)
        this.showScrollTop()
        this.initCollectBd(posterId)
    }

    initCollectBd = (posterId) => {
        const { location: { query: { utm_term = "", utm_source = "", channel = "" } } } = this.props;
        const terminal = Utils.isMobile() ? 'mob' : 'pc';
        const category = `${posterId.replace('a', 'adver')}_${terminal}_${channel}`;
        this.setState({ category, channel, utm_source, utm_term })

        Utils.domView(() => {
            Utils.collectBaiduHm(category, "view", utm_term)
        })
    }

    showScrollTop = () => {
        window.addEventListener('scroll', () => {
            const oDiv = document.getElementById("posterFormBtn") || new Object();
            const boundingClient = oDiv.getBoundingClientRect();
            const showScrollTopVis = !!(boundingClient.height + boundingClient.top <= 0)
            this.setState({ showScrollTopVis })
        })
    }

    goTop = () => {
        const { category, utm_term } = this.state;
        Utils.goTop();
        Utils.collectBaiduHm(category, "click", utm_term)
    }

    collectBaiduHmStep = (stepNum) => {
        const { category, utm_term } = this.state;
        Utils.collectBaiduHm(category, `step_${stepNum}`, utm_term)
    }

    checkFormItem = (type, value = this.state[type]) => {
        let params = {}, result = true;
        switch (type) {
            case 'name':
                result = !value.length;
                params = { nameErrMsg: result && '请输入姓名' };
                break;
            case 'gender':
                result = !value.length;
                params = { genderErrMsg: result && '请选择您的称呼' };
                break;
            case 'mobile':
                result = RegEx.handleVerification('mobile', value);
                params = { mobileErrMsg: result };
                break;
            case 'insuranceTarget':
                result = !value.length;
                params = { insuranceErrMsg: result && '请选择为谁考虑保险' };
                break;
        };
        this.setState(params)
        return result;
    }
    /**
     * 失去焦点去空格校验
     */
    onBlur = (val, formItemName) => {
        const value = Utils.trim(val)
        this.setState({ [formItemName]: value })
        this.checkFormItem(formItemName, value)
    }

    getQueryVariable(variable, url = "") {
        var query = url ? url.split("?")[1] : window.location.search.substring(1);
        if (query) {
            var vars = query.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (pair[0] == variable) {
                    return pair[1];
                }
            }
        }
        return ("");
    }

    checkSubmit = () => {
        return ['name', 'gender', 'mobile', 'insuranceTarget'].map(i => this.checkFormItem(i)).every(i => !i)
    }
    
    submit = () => {
        const { category, utm_term, utm_source, name, gender, mobile, insuranceTarget, channel, posterId , flag} = this.state;
        const { dispatch,match: { params}  } = this.props;
        const notErr = this.checkSubmit();
        if (!notErr) {
            Toast.info("请按红字提示正确填写信息")
            Utils.collectBaiduHm(category, "click0", utm_term)
            return;
        };
        const payload = { name, gender: gender[0], mobile, insuranceTarget: insuranceTarget[0], channel, adv: posterId.replace('a', ""),sourceUrl:window.location.href };
        // dispatch pamams
        if(flag){
            dispatch({
                type: 'poster/submit',
                payload
            }).then(res => {
                if (res && res.code == 0) {
                    Toast.success(res.message || "提交成功")
                    // ocpc
                    if (utm_source === 'baidu') Utils.ocpcSubmitSuccess();
                    Utils.collectBaiduHm(category, "click1", utm_term)
                    if(channel==528)
                    window.gdt&&window.gdt('track', 'RESERVATION', {'key1': 'value1', 'key2': 'value2'});
                } else {
                    Utils.collectBaiduHm(category, "click0", utm_term)
                    Toast.fail(res && res.message || "提交失败")
                }
            })
        }
        this.setState({
            flag:false
        })
        setTimeout(()=>{
            this.setState({
                flag:true
            }) 
        },3000)
        
    }

    render() {
        const { currentPoster, posterId, showScrollTopVis, nameErrMsg, genderErrMsg, mobileErrMsg, insuranceErrMsg } = this.state;
        const { match: { params } } = this.props;
        return (
            <Fragment>
                {currentPoster ? <div className={styles.posterContainer}>
                    <div className={['a1', styles[`${posterId}`], styles.posterForm].join(" ")}>
                        {currentPoster && currentPoster.formTitle ? <h3><span>{currentPoster.formTitle}</span></h3> : null}
                        <ul className={styles.FormList}>
                            <li className={styles.formItemChilds}>
                                <div className={styles.name} onClick={() => { this.collectBaiduHmStep(1) }}>
                                    <InputItem type='text'
                                        clear
                                        placeholder='请输入您的姓名'
                                        maxLength="30"
                                        value={this.state.name}
                                        onChange={(name) => { this.setState({ name }) }}
                                        onBlur={(name) => { this.onBlur(name, 'name') }}
                                    />
                                    {<p className={styles.errTips}>{nameErrMsg}</p>}
                                </div>
                                <div>
                                    <div className={styles.picker}>
                                        <Picker
                                            cols={1}
                                            data={genders}
                                            extra={"您的称呼（男士/女士）"}
                                            value={this.state.gender}
                                            title='您的称呼'
                                            onChange={gender => this.setState({ gender, genderErrMsg: null })}
                                        >
                                            <div onClick={() => { this.collectBaiduHmStep(2) }}>{this.state.gender || "您的称呼（男士/女士）"}</div>
                                        </Picker>
                                    </div>
                                    {<p className={styles.errTips}>{genderErrMsg}</p>}
                                </div>
                            </li>
                            <li className={styles.formItemSingle}>
                                <div onClick={() => { this.collectBaiduHmStep(3) }}>
                                    <InputItem
                                        clear
                                        type="digit"
                                        onBlur={(v) => { this.onBlur(v, 'mobile') }}
                                        value={this.state.mobile}
                                        onChange={mobile => this.setState({ mobile: mobile.substr(0, 11) })}
                                        placeholder="请输入您的手机号"
                                    />
                                </div>
                                {<p className={styles.errTips}>{mobileErrMsg}</p>}
                            </li>
                            <li className={styles.formItemSingle}>
                                <div className={styles.picker}>
                                    <Picker
                                        cols={1}
                                        data={InsuredData}
                                        extra={"请选择为谁买保险"}
                                        value={this.state.insuranceTarget || ['本人']}
                                        title='为谁考虑保险'
                                        onChange={insuranceTarget => this.setState({ insuranceTarget, insuranceErrMsg: false })}
                                    >
                                        <div onClick={() => { this.collectBaiduHmStep(4) }}>
                                            {this.state.insuranceTarget[0] || "请选择为谁买保险"}
                                            <span className={styles.triangle}></span>
                                        </div>
                                    </Picker>
                                </div>
                                <p className={styles.errTips}>{insuranceErrMsg}</p>
                            </li>

                        </ul>
                        <div className={styles.tips}>
                            *用户信息安全声明：您提供的个人信息用于我司保险咨询顾问
                                <span className={styles.point}>010-896312**</span>
                                致电提供保险相关服务，我们不会泄露给任何第三方或其他用途
                            </div>
                        <button id="posterFormBtn" className={styles.submit} onClick={this.submit}>{params.id=="a2"?"免费咨询定制":"免费测算保费"}</button>
                        {showScrollTopVis && <div onClick={this.goTop} className={styles.gotTop}>{params.id=="a2"?"免费咨询定制":"免费测算保费"}</div>}
                    </div>
                    <div className={styles.detail}>
                        {currentPoster.detailImages && currentPoster.detailImages.map((item, i) => (<img id={i == currentPoster.detailImages.length - 1 ? 'readWhole' : ''} key={item} src={require(`./assets/images/${item}`)} />))}
                    </div>
                    <footer>
                        <p>本网站由车车保险销售服务有限公司版权所有<br />Copyright©2017-2020 abaobaoxian.com Corporation 版权所有</p>
                        <p><img src={require('./assets/images/security.png')} />粤ICP备17163866号  粤公网安备 44010402001815号</p>
                    </footer>
                </div > : <p>错误参数</p>}
            </Fragment>
        );
    }
}

export default Index;
