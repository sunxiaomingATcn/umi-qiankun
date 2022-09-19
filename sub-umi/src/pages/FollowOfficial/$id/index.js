/**
 * title: 投保成功
 */
/**
 * 公众号关注引导页
 * 
 * 1.use as 页面
 *  $id router 二维码放在./images下 同名id.png (./images/{id}.png)
 *  eg：path: /followofficial/ayb => qrcode: ./images/ayb.png
 * 
 * 2.use as 组件
 *  import FollowOfficial from '@/pages/FollowOfficial/$id';
 *  <FollowOfficial followkey={'ayb'} />
 *  @params followkey 同1 id
 *  @params comDidMount
 *  @params OpenWechat
*/
import React, { Component } from 'react';
import styles from './index.scss';
import { Steps } from 'antd-mobile';
import Utils from '@/utils/utils';

const Step = Steps.Step;

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    componentDidMount() {
        const { match: { params: { id } = {} } = {}, followkey, comDidMount } = this.props;
        this.setState({
            followkey: id ? id : followkey
        })
        comDidMount && comDidMount();
    }

    OpenWechat() {
        const { OpenWechat } = this.props;
        Utils.copyText("abaobx")
        OpenWechat && OpenWechat()
    }

    render() {
        const { followkey } = this.state;

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
                    <img className={styles.qrcode} src={followkey && require(`./images/${followkey}.png`)} />
                    <div className={styles.step}>
                        <Steps size="small" current={0}>
                            <Step title={<div style={{ fontWeight: "normal", color: "#000", fontSize: "0.25rem" }}><span style={{ color: "rgb(106, 205, 60)" }}>长按</span>上方二维码三秒</div>} icon={<div className={styles.position}><div className={styles.icon}></div><p>第一步</p></div>} />
                            <Step title={<div style={{ fontWeight: "normal", color: "#000", fontSize: "0.25rem" }}>点击<span style={{ color: "rgb(106, 205, 60)" }}>保存</span>到相册</div>} icon={<div className={styles.position}><div className={styles.icon}></div><p>第二步</p></div>} />
                            <Step title={<div style={{ fontWeight: "normal", color: "#000", fontSize: "0.25rem" }}>打开微信「<span style={{ color: "rgb(106, 205, 60)" }}>扫一扫</span>」并选择右下角相册中的此二维码 </div>} icon={<div className={styles.position}><div className={styles.icon}></div><p>第三步</p></div>} />
                            <Step title={<div style={{ fontWeight: "normal", color: "#000", fontSize: "0.25rem" }}>点击<span style={{ color: "rgb(106, 205, 60)" }}>关注</span>公众号</div>} icon={<div className={styles.position}><div className={styles.icon}></div><p>第四步</p></div>} />
                        </Steps>
                    </div>
                    <div className={styles.message}>
                        提示：如不会操作可将图片发送给好友，直接扫描好友手机上的二维码即可
                    </div>
                </div>
                <a target="_black" onClick={() => { this.OpenWechat() }} href="weixin://" >一键打开微信</a>
            </div>
        );
    }
}

export default Index;
