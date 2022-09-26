/**
 * title: 投保成功
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import styles from './index.scss';
import { Icon , Steps , Toast } from 'antd-mobile';
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
        Utils.collectBaiduHm(`'投保成功页_曝光_进入投保成功页_${localStorage.getItem("product_id")}_${channel?channel:''}`, "open",'微信环境')
    }

    OpenWechat(){
        Utils.copyText("abaobx")
        const { location } = this.props;
        const channel=location&&location.query&&location.query.channel
        Utils.collectBaiduHm(`'投保成功页_按钮_一键复制并打开微信_${localStorage.getItem("product_id")}_${channel?channel:''}`, "copy",'微信环境')
        Toast.success("复制成功")
    }

    render() {
        return (
            <div className={styles.containerwx}>
               <div className={styles.header}>
                    <p className={styles.title1}>阿保保险</p>
                    <p className={styles.title2}><span><Icon type={'check'} /></span>恭喜您，投保成功！</p>
                    <div className={styles.left}></div>
                    <div className={styles.right}></div>
               </div>
               <div className={styles.content}>
                    <div className={styles.top}>
                        <p>您可以按照下面步骤<span>&nbsp;领取保单</span></p>
                    </div>
                    <div className={styles.step}>
                        <Steps size="small"  current={3}>
                            <Step title={<div style={{fontWeight:"normal",color:"rgb(102,102,102)"}}>1.点击下方按钮打开微信</div>} icon={<div className={styles.icon}><p></p></div>}  />
                            <Step title={<div style={{fontWeight:"normal",color:"rgb(102,102,102)"}}>2.搜索并关注“<span style={{fontWeight:"normal",color:"rgb(66, 125, 252)"}}>阿保保险</span>”公众号</div>} icon={<div className={styles.icon}><p></p></div>} description={<img src={require("../images/abaobx.gif")}></img>} />
                            <Step title={<div style={{fontWeight:"normal",color:"rgb(102,102,102)"}}>3.查看“我的保单”</div>} icon={<div className={styles.icon}><p></p></div>}  />
                        </Steps>
                    </div>
               </div>
               <a target="_black" onClick={()=>{this.OpenWechat()}} href="weixin://" >一键复制并打开微信</a>
            </div>
        );
    }
}

export default Index;
