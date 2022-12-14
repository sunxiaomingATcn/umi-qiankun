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
        const category = `flow_${terminal}_1_${utm_source}`;
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
        // window.open("weixin://")
        window.location.href = "weixin://"
    }

    render() {
        const { wechatNum, popDisplay } = this.state;
        return (
            <Fragment>
                <div className={styles.details} onClick={(e) => { e.preventDefault() }}>
                    <button className={styles.topReceive} onClick={() => this.openPop()}><img src={require('./images/header_btn.png')} /></button>
                    <img src={require('./images/0.png')} onClick={() => this.openPop()} />
                    <img src={require('./images/1.png')} />
                    <img src={require('./images/2.png')} />
                    <img src={require('./images/3.png')} />
                    <img src={require('./images/4.png')} />
                    <img src={require('./images/5.png')} />
                    <footer>
                        <p>????????????????????????????????????????????????????????????<br />Copyright??2017-2020 abaobaoxian.com Corporation ????????????</p>
                        <p><img src={require('@/assets/security.png')} />???ICP???17163866???  ??????????????? 44010402001815???</p>
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
                    title="??????"
                    footer={[{ text: '??????', onPress: () => { this.modalClose() } }]}
                >
                    <p>???????????????????????????????????????????????????</p>
                </Modal>

                <footer className={styles.footer} onClick={() => this.openPop()}>
                    <img src={require('./images/footer_btn.gif')} />
                </footer>
            </Fragment>
        );
    }
}

export default index;