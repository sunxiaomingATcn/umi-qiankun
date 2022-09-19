/**
 * title: 邀请好友
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Toast, ActivityIndicator } from 'antd-mobile';
import styles from './inviteUser.scss';
import WxSdk from '@/utils/wx-sdk';
import * as requestMethods from '@/services/public';

@connect(({ my }) => ({
    my,
}))
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list: [],
        };
    }

    componentDidMount() {
        this.props
            .dispatch({
                type: 'my/inviteFriend',
            })
            .then(res => {
                if (res && res.code == 200) {
                    this.setState({ list: res.data });
                }
            });
        if (localStorage.loginData) {
            let loginData = JSON.parse(localStorage.loginData);
            requestMethods.queryUserDetail(loginData.userId).then(res => {
                if (res && res.code === 200) {
                    let userInfo = res.data;
                    let str = encodeURIComponent(
                        `${window.origin}/#/PublicLogin/register?recomCode=${userInfo.account}&id=${userInfo.id}&realName=${userInfo.realName}&tenantId=${userInfo.tenantId}`,
                    );
                    let url = `${window.origin}/#/publiclogin/redirect`
                    WxSdk.getInstance((config,that)=>{
                        console.log(config,that)
                        that.wxShare({
                            title:`${userInfo.realName}代理人邀请您注册澎湃保，赶快点击注册吧！`,
                            desc:'注册成为保险合伙人，邀请好友还有好礼相送~',
                            imgUrl: window.location.origin + '/wx/images/invite.png',
                            link: `${url}?appid=${config.appId}&redirect_uri=${str}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`,
                        });
                    })
                }
            });
        }
    }

    render() {
        const { isShow, list } = this.state;
        return (
            <div className={styles.inviteUser}>
                <div className={styles.headerPng} />
                <div className={styles.list}>
                    <div className={styles.title}>已邀请好友</div>
                    {
                        list.map((item,index)=>{
                            return <div className={styles.item}>
                            <div className={styles.left}>
                                <img src={item.headimgurl} className={styles.image}></img>
                                <div className={styles.name} style={{ WebkitBoxOrient: 'vertical' }}>{item.realName}</div>
                            </div>
                            <div className={styles.middle}>{item.level}</div>
                            <div className={styles.right} >
                                <img
                                    style={{ display: 'none' }}
                                    src={require('../assets/img/userAlready.png')}
                                />
                            </div>
                        </div>
                        })
                    }
                    {list && list.length == 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems:'center', marginTop:'1.8rem' }}>
                            <img style={{ width:'2.8rem', height:'2.5rem' }} src={require('../assets/img/empty.png')}/>
                            <span className={styles.emptyValue}>暂无邀请好友</span>
                        </div>
                    )}
                </div>
                <img
                    onClick={() => {
                        this.setState({ isShow: !this.state.isShow });
                    }}
                    className={styles.inviteBtn}
                    src={require('../assets/img/inviteBtn.png')}
                />
                {isShow && (
                    <div
                        className={styles.share}
                        onClick={() => {
                            this.setState({ isShow: !this.state.isShow });
                        }}
                    >
                        <div className={styles.mask}></div>
                        <div className={styles.lineOne}>立即分享给好友吧</div>
                        <div className={styles.lineTwo}>点击屏幕右上角「···」将本页面分享给好友</div>
                        <img
                            className={styles.shareArrow}
                            src={require('../assets/img/shareArrow.png')}
                        />
                    </div>
                )}
            </div>
        );
    }
}

export default Index;
