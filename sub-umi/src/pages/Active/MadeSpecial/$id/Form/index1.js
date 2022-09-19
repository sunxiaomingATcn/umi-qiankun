/**
 * title: 家庭保障规划
 */
import React, { Component } from 'react';
import { ActivityIndicator, Toast } from 'antd-mobile';
import { connect } from 'dva';
import styles from './formItems/index.scss';
import CustomizedPages from './formItems/pages'
import WxSDK from "@/utils/wx-sdk";
import { history } from 'umi';
import Utils from '@/utils/utils';
import Warning from '@/components/wxWarning'
import md5Map from '../md5Price'
import NotParticipate from './notParticipate';

@connect(({ activeCustom, loading }) => ({
    activeCustom,
    loading: loading.models.activeCustom
}))
class Index extends Component {
    state = {
        current: 1,
        unpaid: true,// 默认不允许
        isWeiXin: undefined,
        againInfoLoading: false
    }

    componentDidMount() {
        const { match: { params: { id: activeId } } } = this.props;
        const activeParams = md5Map(activeId);
        const { wxShareData } = activeParams;
        WxSDK.share(wxShareData)
        this.setState({
            isWeiXin: Utils.isWeiXin(),
            activeParams,
            ...activeParams
        })
        this.initUserInfo()
    }

    initUserInfo = () => {
        const { dispatch, match: { params: { id: activeId } } } = this.props;
        const { amount, activeLink } = md5Map(activeId);
        const crmUserKey = this.props.location.query.crmUserKey || localStorage.getItem("crmUserKey");
        /**
         * 表单为微信环境非微信环境公用
         * 微信环境 =>判断用户登陆状态 控制跳转
         * 非微信环境 => 支付状态 true（非微信免费）
         * */
        if (Utils.isWeiXin() && !crmUserKey) {
            dispatch({
                type: 'activeCustom/queryCustomizationInfo',
                payload: amount
            }).then(res => {
                if (res && res.code == 0) {
                    this.judgeOrderStatus(res)
                } else {
                    this.setState({
                        unpaid: true
                    })
                }
            })
        } else {
            const { dispatch } = this.props;
            if (!crmUserKey) {
                history.replace(activeLink)
            } else {
                dispatch({
                    type: 'activeCustom/queryHomeCustomizationInfo',
                    payload: {
                        crmUserKey,
                    },
                    isWeiXin:Utils.isWeiXin()
                }).then(res => {
                    if (res && res.code === 0) {
                        this.judgeOrderStatus(res)
                    } else {
                        history.replace(activeLink)
                    }
                })
            }
        }
    }

    judgeOrderStatus = (res) => {
        const { formResLink } = this.state;
        let { payload: { status } } = res;
        // status:3 允许填写表单
        switch (status) {
            case 1:
                this.setState({
                    againInfoLoading: false,
                })
                break;
            case 2:
                history.replace(formResLink)
                break;
            case 3:
                this.setState({
                    unpaid: false
                })
                break;
        }
    }

    prePage = (targetPageKey) => {
        const { current } = this.state;
        if (current <= 1) return;
        this.setState({
            current: targetPageKey || current - 1
        })
    }

    nextPage = (targetPageKey) => {
        const { current } = this.state;
        if (current >= CustomizedPages.length) return;
        // 默认下一页
        this.setState({
            current: targetPageKey || current + 1
        })
    }

    renderCurrentPage = () => {
        const { current, activeParams } = this.state;
        const { activeCustom: { customizationInfo } } = this.props;
        const currentPage = CustomizedPages.find(item => item.key == current)
        const Component = currentPage ? currentPage.component : null;
        const { match: { params: { id: activeId } } } = this.props;

        return (Component ?
            <Component
                prePage={this.prePage}
                nextPage={(t) => this.nextPage(t)}
                data={customizationInfo}
                activeId={activeId}
                location={this.props.location}
                {...activeParams}
            /> : null)
    }

    render() {
        const { amount, unpaid, isWeiXin, againInfoLoading } = this.state;
        const { loading } = this.props;
        return (
            <div className={styles.container}>
                <ActivityIndicator animating={isWeiXin === undefined || loading || againInfoLoading} />
                {amount === undefined ? <p className={styles.illegalParam}>参数错误</p> : unpaid ? <NotParticipate /> : <div className={styles.customized_container}>{this.renderCurrentPage()}</div>}
            </div>
        )
    }
}

export default Index;
