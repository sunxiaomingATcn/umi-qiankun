/**
 * title: 家庭保险方案定制服务
 */
import React, { Component } from 'react';
import { initUserInfo } from './assets/common';
import { ActivityIndicator } from 'antd-mobile';
import { connect } from 'dva';
import WxSDK from "@/utils/wx-sdk";
import { history } from 'umi';
import IosKeyboardRetraction from '@/components/IosKeyBoardBack';
import Utils from '@/utils/utils';
import md5Map from './assets/md5Price';
import ActiveIndex from './components/Active';
import ActiveForm from './components/Form';
import styles from './css/index.less';

@IosKeyboardRetraction
@connect(({ customizedV2 }) => ({
    customizedV2
}))
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userStatus: undefined
        }
    }

    componentDidMount() {
        const { match: { params: { id: activeId } } } = this.props;
        const activeParams = md5Map(activeId);
        if (activeParams.amount === undefined) return;
        this.setState({
            ...activeParams,
            activeParams,
            activeId
        }, () => {
            this.initUserInfo()
        })
        if (Utils.isWeiXin()) WxSDK.share(activeParams.wxShareData)
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
        })
    }

    toAuthorize = () => {
        const { authorizedback, activeId, search } = this.state;
        const callbackUrl = `${window.location.origin}/#${authorizedback}${search}`;
        history.push(`/Active/CustomizedV2/${activeId}/Auth${search ? search: "?"}&cb=${encodeURIComponent(callbackUrl)}`)
    }

    // 设置用户状态
    setUserStatus = (userStatus) => {
        this.setState({ userStatus })
    }

    render() {
        const { userStatus, userStatusInfo, activeParams } = this.state;

        return (
            <div className={styles.container}>
                {userStatus == 2 || userStatus == 3 ?
                    <ActiveForm
                        userStatus={userStatus}
                        activeParams={activeParams}
                        setUserStatus={this.setUserStatus}
                    /> :
                    userStatus == 4 || userStatus <= 1 ? <ActiveIndex
                        userStatus={userStatus}
                        activeParams={activeParams}
                        setUserStatus={this.setUserStatus}
                        userStatusInfo={userStatusInfo}
                    /> : <ActivityIndicator text="正在加载" animating={true} />}
            </div>
        );
    }
}

export default Index;
