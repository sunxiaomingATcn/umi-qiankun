/**
 * title: 支付详情
 */
import React, { Component } from 'react';
import { ActivityIndicator } from 'antd-mobile';
import styles from './index.scss';
import { history } from 'umi';
import md5Map from '../md5Price'
import WxSDK from "@/utils/wx-sdk";
import Utils from '@/utils/utils';

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false
        }
    }

    componentDidMount() {
        const { match: { params: { id: activeId } }, location: { query: { channel = "" } } } = this.props;
        const activeParams = md5Map(activeId);
        const { amount, wxShareData } = activeParams;
        const { state } = this.props.location.query;
        if (state === "success") {
            this.setState({ loading: true })
            setTimeout(() => {
                this.setState({ loading: false })
            }, 1000)
            Utils.collectBaiduHm(`1v1_${amount}_${channel}_支付成功`, "open");
        }
        this.setState({ ...activeParams, activeId, channel, state })
        WxSDK.share(wxShareData)
    }

    goForm = () => {
        const { amount, channel, formLink } = this.state;
        Utils.collectBaiduHm(`1v1_${amount}_${channel}_支付成功`)
        history.replace(formLink)
    };

    render() {
        const { loading, state } = this.state;
        return (
            <div className='container'>
                <ActivityIndicator animating={loading} />
                <div className={[styles.payback_detail, 'flex-c-cc'].join(' ')}>
                    <img src={require(`@/assets/icon/${state == 'success' ? 'paysuccess' : 'fail'}.svg`)} alt="" />
                    <div
                        className={[styles.payback_detail_msg, state == 'fail' ? styles.fail : undefined].join(' ')}>支付{state == 'success' ? '成功' : '失败'}</div>
                    <div className={[styles.payback_detail_tip].join(' ')}>
                        {state == 'success' ? <div>
                            <p>您已购买该服务。</p>
                            <p>请填写您的基本信息，用于家庭保障规划。</p>
                        </div> : <div>
                                <p>支付失败 家庭保障规划服务购买失败，请重新操作。</p>
                            </div>}
                    </div>
                </div>
                <div className={[styles.payback_detail_btn, 'flex-c-cc'].join(' ')}>
                    {state == 'success' &&
                        <button className={[styles.btn, styles.check_policy].join(' ')} onClick={this.goForm}>去填写信息
                    </button>}
                </div>
            </div>
        );
    }
}

export default Index;
