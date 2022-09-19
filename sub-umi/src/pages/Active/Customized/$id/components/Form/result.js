/**
 * title: 家庭保障规划
 */

import React, { Component } from 'react';
import { connect } from 'dva'
import styles from './formItems/index.scss'
import md5Map from '../md5Price'
import WxSDK from "@/utils/wx-sdk";
import Utils from '@/utils/utils';

@connect(({ customized }) => ({
    customized,
}))
class Index extends Component {
    state = {}

    componentDidMount() {
        const { match: { params: { id: activeId } } } = this.props;
        const { amount, channel, wxShareData } = md5Map(activeId);
        this.setState({amount, channel})
        Utils.collectBaiduHm(`1v1_${amount}_${channel}_表单填写成功`, "open")
        WxSDK.share(wxShareData)
    }

    call = () => {
        const {amount, channel} = this.state;
        Utils.collectBaiduHm(`1v1_${amount}_${channel}_联系客服`)
        window.location.href = "https://www.sobot.com/chat/h5/index.html?sysNum=4debc641aefd4d859181fcca74633b67"
    }

    render() {

        return (
            <div className={styles.resultBox}>
                <div className={styles.title}>
                    <img src={require('./images/success.png')} />
                    <p>表单填写成功</p>
                </div>
                <div>
                    <p className={styles.wait}>
                        您的专属规划师会如约而至<br />
                        请耐心等待～
                    </p>
                    <p className={styles.tips}>温馨提示 </p>
                    <p className={styles.tips}>规划师工作时间：周一至周日 9:00-19:00</p>
                </div>
                <button onClick={this.call} className={styles.call}>
                    <img src={require('./images/call.png')} />
                联系客服
                </button>
            </div>

        )
    }
}

export default Index;
