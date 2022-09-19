/**
 * title: 邀请好友，赢千元奖励
*/
import React, { Component } from 'react';
import { connect } from 'dva';
import { InputItem, Toast } from 'antd-mobile';
import WxSDK from "@/utils/wx-sdk";
import { history } from 'umi';
import IosKeyboardRetraction from '@/components/IosKeyBoardBack';
import WxWarning from '@/components/wxWarning';
import Utils from '@/utils/utils';
import Reg from '@/utils/RegEx';
import ArtVerifyCode from '@/components/VerifyCode/Code';
import styles from './css/index.less';

@IosKeyboardRetraction
@connect(({ customizedInv }) => ({
    customizedInv
}))
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mobile: '',
            validationCode: '',
            needForm: false,
            showPoster: false,
            posterUrl: '',
            crmCustomerId: null,
        };
    }

    componentDidMount() {
        if (!Utils.isWeiXin()) return;
        // 登录判断
        Toast.loading("Loading...", 0)
        const { dispatch } = this.props;
        dispatch({
            type: 'customizedInv/queryUserInfo'
        }).then(res => {
            if (res && res.code === 0) {
                const { isCrmUser, crmCustomerId } = res.payload;
                // 是否CRM用户
                this.setState({ needForm: !isCrmUser, crmCustomerId })
            } else {
                this.toAuthorize()
            }
            Toast.hide()
        })
        WxSDK.share({
            title: '邀请好友，赢千元奖励',
            desc: '好事成双，现金奖励，上不封顶。'
        })
    }

    toAuthorize = () => {
        const { location: { search } } = this.props;
        const callbackUrl = `${window.location.origin}/#/Active/customizedInv/AuthBack${search}`;
        history.push(`/Authorize?cb=${encodeURIComponent(callbackUrl)}`)
    }

    handleBlur = (key, val, reg) => {
        const result = !reg.test(val);
        this.setState({
            [`${key}ValErr`]: result ? `${key === 'mobile' ? `请输入${val ? '正确' : ''}手机号` : `${val ? '验证码错误' : '请输入验证码'}`}` : undefined
        })
        return result;
    }

    validationCode = () => {
        const { dispatch } = this.props;
        const { mobile, validationCode } = this.state;
        Toast.loading('Loading...', 0)
        return dispatch({
            type: 'login/validationCode',
            payload: {
                mobile,
                validationCode
            }
        })
    }

    getPoster = () => {
        Toast.loading('Loading...', 0)
        const { crmCustomerId } = this.state;
        const { dispatch } = this.props;
        const shareLink = `${window.location.origin}/#/active/customized/578eb0cfaba23bee?channel=22222&crmCustomerId=${crmCustomerId}`
        dispatch({
            type: 'customizedInv/queryPoster',
            payload: {
                content: shareLink
            }
        }).then(res => {
            this.setState({ showPoster: true, posterUrl: res.payload })
        })
    }

    submit = () => {
        const { needForm, mobile, validationCode } = this.state;
        const { dispatch } = this.props;
        if (needForm) {
            const checkMobile = this.handleBlur('mobile', mobile, Reg.mobile);
            const checkValidationCode = this.handleBlur('validationCode', validationCode, Reg.validationCode6);
            if (checkMobile || checkValidationCode) {
                return;
            }
            this.validationCode().then(res => {
                if (res && res.code === 0) {
                    dispatch({
                        type: 'customizedInv/searchCrmUserByPhone',
                        payload: {
                            mobile
                        }
                    }).then(res => {
                        Toast.hide()
                        const { isCrmUser, crmCustomerId } = res.payload;
                        // 是否CRM用户
                        if (isCrmUser) {
                            this.setState({ crmCustomerId })
                            this.getPoster()
                        } else {
                            history.push('/active/made/578eb0cfaba23bee?channel=22222')
                        }
                    })
                }
            })
        } else {
            this.getPoster()
        }
    }

    render() {
        const { mobileValErr, validationCodeValErr, needForm, showPoster, posterLoaded = false, posterUrl } = this.state;

        return (
            Utils.isWeiXin() ?
                showPoster ?
                    <div className={styles.posterContainer}>
                        <div className={styles.poster}>
                            <img
                                style={{ opacity: Number(posterLoaded) }}
                                onLoad={
                                    () => {
                                        this.setState({ posterLoaded: true });
                                        Toast.hide()
                                    }
                                }
                                src={posterUrl}
                            />
                        </div>
                        <div>
                            <div className={styles.postMessage}>— 您的邀请好友专属福利海报 —</div>
                            <div className={styles.postShare}>长按海报图片 → 发送给朋友或保存到手机</div>
                        </div>
                    </div> : <div className={styles.cusInv}>
                        <img className={styles.logo} src={require('./images/logo.png')} />
                        {needForm ? <div className={styles.cusInvNeedForm}>
                            <div className={styles.inputContainer}>
                                <div className={[mobileValErr ? styles.errorInput : "", styles.phone].join(" ")}>
                                    <InputItem
                                        clear
                                        type="digit"
                                        onBlur={v => this.handleBlur('mobile', v, Reg.mobile)}
                                        onFocus={() => { this.setState({ visCode: true, orderIsCreatedAutoMobile: false }) }}
                                        value={this.state.mobile}
                                        onChange={mobile => this.setState({ mobile: mobile.substr(0, 11) })}
                                        placeholder="请输入手机号"
                                    ></InputItem>
                                    {mobileValErr && <p className={styles.error}>{mobileValErr}</p>}
                                </div>
                                <div className={[validationCodeValErr ? styles.errorInput : "", styles.code].join(" ")}>
                                    <InputItem
                                        placeholder="请输入验证码"
                                        type="digit"
                                        onChange={validationCode => this.setState({ validationCode: validationCode.substr(0, 6) })}
                                        value={this.state.validationCode}
                                        onBlur={v => this.handleBlur('validationCode', v, Reg.validationCode6)}
                                    />
                                    <div className={styles.artVerifyCode}>
                                        <ArtVerifyCode
                                            phone={this.state.mobile}
                                            color="#FF591B"
                                            disabledColor="#FF591B"
                                            border={false}
                                            codeText="获取验证码"
                                            countdownSuffix="s"
                                            mobileRegName="mobile1"
                                            dispatch={this.props.dispatch}
                                        />
                                    </div>
                                    {validationCodeValErr && <p className={styles.error}>{validationCodeValErr}</p>}
                                </div>
                                <div className={styles.submit} onClick={this.submit}>马上给好友送福利</div>
                                <p className={styles.des}>— 生成您邀请好友的专属福利海报 —</p>
                            </div>

                        </div>
                            : <div className={styles.cusInvUnForm}>
                                <div className={styles.submit} onClick={this.submit}>马上给好友送福利</div>
                                <p className={styles.des}>— 生成您邀请好友的专属福利海报 —</p>
                            </div>
                        }
                    </div> : <WxWarning />
        );
    }
}

export default index;
