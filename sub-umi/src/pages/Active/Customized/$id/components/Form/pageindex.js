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
import md5Map from '../../assets/md5Price'
import NotParticipate from './notParticipate';
import { initUserInfo } from '../../assets/common';

@connect(({ activeV3, loading }) => ({
    activeV3,
    loading: loading.models.activeV3
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
        },()=>{
            this.initUserInfo()
        })
    }

    initUserInfo = () => {
        const { activeParams } = this.state;
        initUserInfo(this, Utils.isWeiXin(), activeParams).then(res => {
            const { status } = res;
            this.setState({ userStatus: status, userStatusInfo: res })
            // 微信未登录 status => -1
            if (status == -1) {
                this.toAuthorize()
            }
            if(status == 3){
                this.setState({
                    unpaid:false
                })
            }
        })
    }

    toAuthorize = () => {
        const { authorizedback, activeId, search } = this.state;
        const callbackUrl = `${window.location.origin}/#${authorizedback}${search}`;
        history.push(`/Active/Customized/${activeId}/Auth${search ? search: "?"}&cb=${encodeURIComponent(callbackUrl)}`)
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
        const { activeV3: { customizationInfo } } = this.props;
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
                setUserStatus={this.props.setUserStatus}
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
