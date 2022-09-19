/**
 * title: 家庭保险方案定制服务
 */
/**
 * 家庭定制活动 子组件 =>
 * 微信 => 使用组件 WechatUser（微信授权,无验证码）
 * 非微信 => 使用组件 UnWechatUser（验证码）
*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import styles from './index.less';
import Utils from '@/utils/utils';
import WechatUser from './WechatUser';
import UnWechatUser from './UnWechatUser';

@connect(({ customizedV2 }) => ({
    customizedV2
}))
class Active extends Component {
    constructor(props) {
        super(props);
        this.state = {
            remainingNumber: '1439',
            countDown: '...',
            countDownTime: '',
            userStatus: 0,
            clauseFlag:false
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (JSON.stringify(nextProps.customizedV2) !== JSON.stringify(prevState.customizedV2)) {
            const { customizedV2, customizedV2: { discount: { remainingNumber, countDownTime } }, activeParams } = nextProps;
            return {
                customizedV2,
                remainingNumber,
                activeParams,
                countDownTime: countDownTime / 1000
            }
        }
        return null;
    }

    componentDidMount() {
        const { dispatch } = this.props;
        const { activeParams } = this.state;
        this.setState({
            ...activeParams
        }, () => {
            this.collectBaiduHmView();
            this.showScrollTop();
            this.getTimeCountDown();
            this.interval = setInterval(this.getTimeCountDown, 1000)
        })

        dispatch({
            type: 'customizedV2/queryDiscount'
        })
    }

    componentWillUnmount() {
        clearInterval(this.interval)
    }

    collectBaiduHmView = () => {
        const { amount, channel } = this.state;
        Utils.collectBaiduHm(`1v1_${amount}_${channel}_在线定制保险方案`, "open")
        const scrollCollectDomArr = ["view1", "view2", "view3", "view4", "view5", "view6", "view7", "view8"]
        scrollCollectDomArr.forEach(item => {
            Utils.domTAndBView(() => {
                Utils.collectBaiduHm(`1v1_${amount}_${channel}_在线定制保险方案`, item)
            }, item)
        })
    }

    showScrollTop = () => {
        window.addEventListener('scroll', () => {
            const oDiv = document.getElementById("formInputs");
            if (!oDiv) return;
            const boundingClient = oDiv.getBoundingClientRect();
            const showScrollTopVis = !!(boundingClient.height + boundingClient.top <= 0)
            this.setState({ showScrollTopVis })
        })
    }

    goTop = () => {
        const { amount, channel } = this.state;
        Utils.collectBaiduHm(`1v1_${amount}_${channel}_在线定制保险方案`, 'click')
        Utils.goTop();
    }

    getTimeCountDown = () => {
        const repairZero = (n) => (n <= 9 ? '0' + n : n)
        const countDown = this.state.countDownTime - 1;
        if (isNaN(countDown)) return;
        this.setState({ countDownTime: countDown })
        const h = parseInt(countDown / (60 * 60) % 24);
        const m = parseInt(countDown / 60 % 60);
        const s = parseInt(countDown % 60);
        this.setState({ countDown: `${repairZero(h)}:${repairZero(m)}:${repairZero(s)}` })
        if (countDown === 0) {
            this.setState({ countDownTime: 24 * 60 * 60 * 1000 })
        }
    }

    showClause(flag){
        this.setState({
            clauseFlag:flag
        })
    }

    render() {
        const { activeParams, showScrollTopVis, remainingNumber,clauseFlag } = this.state;

        return (
            <Fragment>
                {activeParams ? <div className={styles.container}>
                    <div className={styles.view1} id="view1"></div>
                    <div className={styles.view2} id="view2"></div>
                    <div className={styles.form} id="view3">
                        <div className={styles.inputs}>
                            <div className={styles.title}>
                                限时<span className={styles.presentPrice}>{activeParams.amount}</span>元<span className={styles.originalPrice}>原价199元</span>
                            </div>
                            <div id="formInputs">
                                {Utils.isWeiXin() ? <WechatUser {...this.props} /> : <UnWechatUser {...this.props} />}
                            </div>
                            <div className={styles.clause}>
                                <p>点击定制表示您同意车车后续联系您和讲解家庭保险</p>
                                <p>方案，详情参见<span onClick={()=>{this.showClause(true)}}>客户信息授权条款</span></p>
                            </div>
                        </div>
                        <div className={styles.message}>
                            <div className={styles.maded}>
                                <span className={styles.count}>28.8</span>万人已定制
                            </div>
                            <div className={styles.countdown}>
                                <p>剩余<span className={styles.count}>{remainingNumber}</span>份</p>
                                <p className={styles.count}>优惠倒计时 {this.state.countDown}</p>
                            </div>
                        </div>
                    </div>
                    {/* {['header.png', '1.png', '2.png', '3.png', '4.png', '5.png'].map((src, i) => (<img key={src} id={`image${i + 1}`} src={require(`../../images/${src}`)} />))} */}
                    <img id={"imageHeader"} src={require(`../../images/header.png`)} />
                    <img id={"view4"} src={require(`../../images/1.jpg`)} />
                    <div id={"view5"}>
                        <img src={require(`../../images/2.jpg`)} />
                        <img src={require(`../../images/3.jpg`)} />
                    </div>
                    <img id={"view6"} src={require(`../../images/4.jpg`)} />
                    <img id={"view7"} src={require(`../../images/5.jpg`)} />
                    <img id={"view8"} src={require(`../../images/6.jpg`)} />

                    <div className={styles.footer} style={{ display: showScrollTopVis ? "flex" : "none" }} onClick={this.goTop}>
                        <div className={styles.footerPrice}>
                            <b>¥</b>
                            <span>{activeParams.amount}</span>
                            <i>¥199</i>
                        </div>
                        <div className={styles.footerBtn}>
                            <p>抢购特惠名额</p>
                            <p>仅剩{remainingNumber}份</p>
                        </div>
                    </div>
                    {
                        clauseFlag?<div className={styles.clauseMask}>
                                <div className={styles.mask} onClick={()=>{this.showClause(false)}}>
                                </div>
                            <div className={styles.maskContainer}>
                                <div className={styles.clauseContainer}>
                                    <img src={require(`../../images/close.png`)} onClick={()=>{this.showClause(false)}}></img>
                                    <p className={styles.clauseTitle}>客户信息授权条款</p>
                                    <p>1.您同意授权车车集团，除法律另有规定之外，将您提供给车车集团的信息、享受车车集团服务产生的信息（包括本单证签署之前提供和产生的信息）以及车车集团根据本条约定查询、收集的信息，用于车车集团及其因服务必要委托的合作伙伴为您提供服务、推荐产品、信息数据分析。</p>
                                    <p>2.您同意授权车车集团，除法律另有规定之外，基于为您提供更优质服务和产品的目的，向车车集团因服务必要开展合作的伙伴提供、查询、收集您的信息。</p>
                                    <p>3.您同意授权车车集团及其合作伙伴向征信机构查询您被征信机构合法采集、整理或加工产生的其他信息提供者提供的个人信息用于核保审查相关事宜；如您不同意本授权条款，可致电取消授权。</p>
                                    <p>4.为确保您信息的安全，车车集团及其合作伙伴对上述信息负有保密义务，并采取各种措施保证信息安全。</p>
                                    <p>5.本条款自本单证签署时生效，具有独立法律效力，不受合同成立与否及效力状态变化的影响。</p>
                                    <p>6.本条所称“车车集团”是指车车保险销售服务有限公司及其直接或间接控股的公司。 </p>
                                    <p>7.如您不同意上述授权条款的部分或全部，可致电客服热线取消或变更授权。</p>
                                </div>
                            </div>
                        </div>:""
                    }
                </div> : null}
            </Fragment>
        );
    }
}

export default Active;
