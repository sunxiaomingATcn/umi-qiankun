/**
 * title: 支付详情
 */
import React, { Component } from 'react';
import { ActivityIndicator } from 'antd-mobile';
import styles from './index.scss';
import { history } from 'umi';
import md5Map from '../assets/md5Price'
import WxSDK from "@/utils/wx-sdk";
import Utils from '@/utils/utils';

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            state: 'loading'
        }
    }

    componentDidMount() {
        const { match: { params: { id: activeId } }, location: { query: { channel = "", state = "fail" } } } = this.props;
        const activeParams = md5Map(activeId);
        const { amount, wxShareData } = activeParams;
        Utils.collectBaiduHm(`1v1_${amount}_${channel}_${state === "success" ? '支付成功' : '支付失败'}`, "open");
        // 延迟获取支付状态 避免未完成支付回调
        setTimeout(() => {
            if (state === "success") {
                sessionStorage.setItem("pay",true)
                history.replace({ pathname: activeParams.activeLink, search: activeParams.search })
            }
            this.setState({ state })
        }, 2000)
        WxSDK.share(wxShareData)
    }

    render() {
        const { state } = this.state;
        return (
            <div className={styles.container}>
                <ActivityIndicator text="正在获取支付状态" animating={state === 'loading'} />
                {
                    state && state !== 'success' ? <div className={[styles.payback_detail, 'flex-c-cc'].join(' ')}>
                        <img src={require(`@/assets/icon/fail.svg`)} alt="" />
                        <div
                            className={styles.payback_detail_msg}>支付失败</div>
                        <div className={[styles.payback_detail_tip].join(' ')}>
                            <div>
                                <p>支付失败 家庭定制服务购买失败，请重新操作。</p>
                            </div>
                        </div>
                    </div> : null
                }
            </div>
        );
    }
}

export default Index;
