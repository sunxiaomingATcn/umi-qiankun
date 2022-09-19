/**
 * title: 投保成功
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import styles from './index.scss';
import { Icon , Steps } from 'antd-mobile';
import Utils from '@/utils/utils';

const Step = Steps.Step;
@connect(({ pay, loading, productNew }) => ({
    pay,
    productNew,
    loading: loading.models.pay,
}))
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
        }
    }

    componentDidMount() {
        const { location } = this.props;
        const channel=location&&location.query&&location.query.channel
        Utils.collectBaiduHm(`'投保成功页_曝光_进入投保成功页_${localStorage.getItem("product_id")}_${channel?channel:''}`, "open",'非微信环境')
    }

    OpenWechat(){
        const { location } = this.props;
        const channel=location&&location.query&&location.query.channel
        Utils.copyText("abaobx")
        Utils.collectBaiduHm(`'投保成功页_按钮_一键复制并打开微信_${localStorage.getItem("product_id")}_${channel?channel:''}`, "copy",'非微信环境')
    }

    render() {
        return (
            <div className={styles.containerunwx}>
               <div className={styles.header}>
                    <p className={styles.title1}>关注“阿保保险”公众号</p>
                    <p className={styles.title2}>查收您的保单</p>
                    <div className={styles.left}></div>
                    <div className={styles.right}></div>
               </div>
               <div className={styles.content}>
                    <div className={styles.top}>
                        <p>
                            <span>及时查看保单</span>
                            <span>|</span>
                            <span>查看缴费详情</span>
                            <span>|</span>
                            <span>在线客服沟通</span>
                        </p>
                    </div>
                    <img className={styles.qrcode} src={require("../images/code.png")}/>
                    <div className={styles.step}>
                        <Steps size="small"  current={0}>
                            <Step title={<div style={{fontWeight:"normal",color:"#000",fontSize: "0.25rem"}}><span style={{color:"rgb(106, 205, 60)"}}>长按</span>上方二维码三秒</div>} icon={<div className={styles.position}><div className={styles.icon}></div><p>第一步</p></div>}  />
                            <Step title={<div style={{fontWeight:"normal",color:"#000",fontSize: "0.25rem"}}>点击<span style={{color:"rgb(106, 205, 60)"}}>保存</span>到相册</div>} icon={<div className={styles.position}><div className={styles.icon}></div><p>第二步</p></div>}  />
                            <Step title={<div style={{fontWeight:"normal",color:"#000",fontSize: "0.25rem"}}>打开微信「<span style={{color:"rgb(106, 205, 60)"}}>扫一扫</span>」并选择右下角相册中的此二维码 </div>} icon={<div className={styles.position}><div className={styles.icon}></div><p>第三步</p></div>}  />
                            <Step title={<div style={{fontWeight:"normal",color:"#000",fontSize: "0.25rem"}}>点击<span style={{color:"rgb(106, 205, 60)"}}>关注</span>公众号</div>} icon={<div className={styles.position}><div className={styles.icon}></div><p>第四步</p></div>}  />
                        </Steps>
                    </div>
                    <div className={styles.message}>
                        提示：如不会操作可将图片发送给好友，直接扫描好友手机上的二维码即可
                    </div>
               </div>
               <a target="_black" onClick={()=>{this.OpenWechat()}} href="weixin://" >一键打开微信</a>
            </div>
        );
    }
}

export default Index;
