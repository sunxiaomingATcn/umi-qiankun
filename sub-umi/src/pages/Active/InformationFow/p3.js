import React, { Component, Fragment } from 'react';
import { Modal } from 'antd-mobile';
import getRandomWechat from '@/assets/commonData/wechatNum';
import callService from '@/assets/commonData/callService';
import Utils from '@/utils/utils';
import styles from './index.less';
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            wechatNum: getRandomWechat(),
            popDisplay: false
        };
    }

    componentDidMount() {
        this.initCollectBd()
    }

    initCollectBd = () => {
        const { location: { query: { utm_source = "" } } } = this.props;
        const terminal = Utils.isMobile() ? 'mob' : 'pc';
        const category = `flow_${terminal}_3_${utm_source}`;
        this.setState({ category, utm_source })
        Utils.collectBaiduHm(category, "open")
    }

    openPop() {
        const { category } = this.state;
        // this.setState({ popDisplay: true })
        Utils.collectBaiduHm(category, "click")
        Utils.ocpcSubmitSuccess();
        callService()
    }

    copyText() {
        Utils.ocpcSubmitSuccess();
        const { wechatNum, category } = this.state;
        Utils.copyText(wechatNum)
        Utils.collectBaiduHm(category, "copy")
        this.setState({ modal1: true })
    }

    modalClose() {
        this.setState({ modal1: false })
        window.location.href = "weixin://"
    }

    render() {
        const { wechatNum, popDisplay } = this.state;
        return (
            <div className={styles.flowStyle2}>
                <div className={styles.details} onClick={(e) => { e.preventDefault() }}>
                    <h3>
                        <span>【抢】</span>孩子保险方案保额高，还不贵！避坑不求人，在线免费咨询专业顾问，保费省一半
                    </h3>
                    <img src={require('./images/p3/1.png')} onClick={() => this.openPop()} />
                    <div className={styles.btnContainer}>
                        <button className={styles.topReceive} onClick={() => this.openPop()}><img src={require('./images/p3/banner.gif')} /></button>
                        <img src={require('./images/p3/2.png')} />
                    </div>
                    <img src={require('./images/p3/3.png')} />
                    <img src={require('./images/p3/4.png')} />
                    <img src={require('./images/p3/5.png')} />
                    <img src={require('./images/p3/6.png')} />
                    <img src={require('./images/p3/7.png')} />
                    <img src={require('./images/p3/8.png')} />
                    <footer>
                        <p>本网站由车车保险销售服务有限公司版权所有<br />Copyright©2017-2020 abaobaoxian.com Corporation 版权所有</p>
                        <p><img src={require('@/assets/security.png')} />粤ICP备17163866号  粤公网安备 44010402001815号</p>
                    </footer>
                </div>
                <div style={{ display: popDisplay ? 'block' : 'none' }} className={styles.pop} onClick={(e) => { e.preventDefault() }}>
                    <p className={styles.wechatNum}>{wechatNum}</p>
                    <img className={styles.popContent} src={require('./images/pop.png')} />
                    <img className={styles.popBtn} onClick={() => this.copyText()} src={require('./images/pop_btn.png')} />
                    <img className={styles.popClose} onClick={() => this.setState({ popDisplay: false })} src={require('./images/pop_close.png')} />
                </div>
                <Modal
                    visible={this.state.modal1}
                    transparent
                    maskClosable={false}
                    title="提示"
                    footer={[{ text: '确定', onPress: () => { this.modalClose() } }]}
                >
                    <p>您已成功复制微信号，请前往微信添加</p>
                </Modal>
                <footer className={styles.footer} onClick={() => this.openPop()}>
                    <img src={require('./images/p3/footer.gif')} />
                </footer>
            </div>
        );
    }
}

export default index;