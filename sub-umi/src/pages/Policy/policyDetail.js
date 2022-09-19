/**
 * title: 保单详情
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import styles from './policyDetail.scss'
import { history } from 'umi';
import { ActivityIndicator } from 'antd-mobile';
let policyStatus1 = require('./images/chengbaozhong.svg');
let policyStatus2 = require('./images/chengbaoyouxiao.svg');
let policyStatus3 = require('./images/jiaofeiyuqi.svg');
let policyStatus4 = require('./images/shixiao.svg');
let policyStatus5 = require('./images/tuibao.svg');
let policyStatus6 = require('./images/yishanchu.svg');
let policyStatus7 = require('./images/qita.svg');

const policyStatusImg = [policyStatus1, policyStatus2, policyStatus3, policyStatus4, policyStatus5, policyStatus6, policyStatus7];



@connect(({ login, policy, loading }) => ({
    login,
    policy,
    loading: loading.effects['policy/queryPoliciesDetail'],
}))
class PolicyDetail extends Component {
    constructor(props) {
        super(props);
    }

    state = {
        newPolicyUrl: null
    }

    componentDidMount() {
        const { policyId } = this.props.location.query;
        const type = sessionStorage.getItem("policyQueryType")
        const queryType = type === "2" ? 2 : 1;

        this.queryPoliciesDetail(policyId, queryType)
    }

    queryPoliciesDetail = (policyId, queryType) => {
        const { dispatch } = this.props;
        const token = queryType == 2 ? localStorage.getItem("token") : localStorage.getItem("wechat_user_token");

        dispatch({
            type: 'policy/queryPoliciesDetail',
            payload: {
                token,
                queryType,
                policyId
            }
        })

        dispatch({
            type: "policy/queryPolicieUpdate",
            payload: policyId
        }).then((res) => {
            if (res && res.code == 0) {
                this.setState({
                    newPolicyUrl: res.payload
                })
            }
        })
    }

    render() {
        const { policy: { queryPoliciesDetail } } = this.props;
        const { newPolicyUrl } = this.state;
        let imgKey = queryPoliciesDetail !== null ? parseInt(queryPoliciesDetail.status.id) - 1 : null;
        let applicantInfo = [], insurantInfo = [], renewalFeeInfo = [], insuranceInfo = [], renewalItems = [];
        if (queryPoliciesDetail !== null) {
            applicantInfo = Object.values(queryPoliciesDetail.applicantInfo).filter(Boolean);
            // insurantInfo = Object.values(queryPoliciesDetail.insurantInfo).filter(Boolean);
            renewalFeeInfo = Object.values(queryPoliciesDetail.renewalFeeInfo).filter(Boolean);
            insuranceInfo = Object.values(queryPoliciesDetail.insuranceInfo).filter(Boolean);
        }

        return (
            <div className={styles.container_wrapper}>
                <ActivityIndicator toast text="Loading..." size="large" animating={this.props.loading} />
                <div className={[styles.insurance_order, 'singleLineEllipsis'].join(' ')}>保单号：{queryPoliciesDetail !== null && queryPoliciesDetail.policyNo}</div>
                <div className={[styles.flex, styles.insurance_company].join(' ')}>
                    <div className={styles.flex_basis}>
                        <div className={styles.title}>{queryPoliciesDetail !== null && queryPoliciesDetail.product.name !== null && queryPoliciesDetail.product.name}</div>
                        <div className={styles.logo}>
                            <img src={queryPoliciesDetail !== null ? queryPoliciesDetail.icLogo : undefined} alt="" />
                        </div>
                    </div>
                    <div className={styles.picture}>
                        {imgKey !== null && <img src={policyStatusImg[imgKey]} alt="" />}
                    </div>
                </div>
                <div className={styles.line}></div>
                <a href={queryPoliciesDetail !== null && (newPolicyUrl || queryPoliciesDetail.policyUrl) ? newPolicyUrl || queryPoliciesDetail.policyUrl : "javascript:void(0)"}
                    className={[styles.relative,
                    styles.flex,
                    styles.align_center,
                    styles.insurance_number,
                    queryPoliciesDetail !== null && !(newPolicyUrl || queryPoliciesDetail.policyUrl) ? styles.grey : undefined
                    ].join(' ')}>
                    <div className={styles.mark}></div>
                    <div className={[styles.flex_basis, styles.number].join(' ')}>
                        电子保单
                    </div>
                    <div className={styles.electronic}>
                        <span className={queryPoliciesDetail !== null && !(newPolicyUrl || queryPoliciesDetail.policyUrl) ? styles.arrow_right_grey : styles.arrow_right_blue}></span>
                    </div>
                </a>
                <div className={styles.line}></div>
                <div className={styles.insurance_info}>
                    <div className={[styles.relative, styles.person].join(' ')}>
                        <span>投保人信息</span>
                        <div className={styles.mark}></div>
                    </div>
                    {queryPoliciesDetail !== null && queryPoliciesDetail.applicantInfo !== null && applicantInfo.length > 0 && (
                        <ul className={styles.list}>
                            {queryPoliciesDetail.applicantInfo.name !== null && (
                                <li className={styles.flex}>
                                    <div className={styles.title}>姓名</div>
                                    <div className={[styles.flex_basis, styles.description].join(' ')}>{queryPoliciesDetail.applicantInfo.name}</div>
                                </li>
                            )}

                            {queryPoliciesDetail.applicantInfo.identityType !== null && (
                                <li className={styles.flex}>
                                    <div className={styles.title}>证件类型</div>
                                    <div className={[styles.flex_basis, styles.description].join(' ')}>
                                        {queryPoliciesDetail.applicantInfo.identityType}</div>
                                </li>
                            )}
                            {queryPoliciesDetail.applicantInfo.identity !== null && (
                                <li className={styles.flex}>
                                    <div className={styles.title}>证件号码</div>
                                    <div className={[styles.flex_basis, styles.description].join(' ')}>
                                        {queryPoliciesDetail.applicantInfo.identity}</div>
                                </li>
                            )}
                            {queryPoliciesDetail.applicantInfo.birthday !== null && (
                                <li className={styles.flex}>
                                    <div className={styles.title}>出生日期</div>
                                    <div className={[styles.flex_basis, styles.description].join(' ')}>
                                        {queryPoliciesDetail.applicantInfo.birthday}</div>
                                </li>
                            )}

                            {queryPoliciesDetail.applicantInfo.gender !== null && (
                                <li className={styles.flex}>
                                    <div className={styles.title}>性别</div>
                                    <div className={[styles.flex_basis, styles.description].join(' ')}>
                                        {queryPoliciesDetail.applicantInfo.gender}</div>
                                </li>
                            )}
                            {queryPoliciesDetail.applicantInfo.address !== null && (
                                <li className={styles.flex}>
                                    <div className={styles.title}>地址</div>
                                    <div className={[styles.flex_basis, styles.description].join(' ')}>
                                        {queryPoliciesDetail.applicantInfo.address}</div>
                                </li>
                            )}
                            {queryPoliciesDetail.applicantInfo.mobile !== null && (
                                <li className={styles.flex}>
                                    <div className={styles.title}>手机号</div>
                                    <div className={[styles.flex_basis, styles.description].join(' ')}>
                                        {queryPoliciesDetail.applicantInfo.mobile}</div>
                                </li>
                            )}

                            {queryPoliciesDetail.applicantInfo.email !== null && (
                                <li className={styles.flex}>
                                    <div className={styles.title}>邮箱</div>
                                    <div className={[styles.flex_basis, styles.description].join(' ')}>
                                        {queryPoliciesDetail.applicantInfo.email}</div>
                                </li>
                            )}

                        </ul>
                    )}

                </div>
                <div className={styles.line}></div>
                <div className={styles.insurance_info}>
                    <div className={[styles.relative, styles.person].join(' ')}>
                        <span>被保人信息</span>
                        <div className={styles.mark}></div>
                    </div>

                    {queryPoliciesDetail !== null &&
                        queryPoliciesDetail.insurantInfos !== null && queryPoliciesDetail.insurantInfos.length > 0 && (
                            queryPoliciesDetail.insurantInfos.map((insurantInfo, key) => (<ul className={styles.list} key={key}>
                                {insurantInfo.name !== null && (
                                    <li className={styles.flex}>
                                        <div className={styles.title}>姓名</div>
                                        <div className={[styles.flex_basis, styles.description].join(' ')}>
                                            {insurantInfo.name}</div>
                                    </li>
                                )}

                                {insurantInfo.identityType !== null && (
                                    <li className={styles.flex}>
                                        <div className={styles.title}>证件类型</div>
                                        <div className={[styles.flex_basis, styles.description].join(' ')}>
                                            {insurantInfo.identityType}</div>
                                    </li>
                                )}
                                {insurantInfo.identity !== null && (
                                    <li className={styles.flex}>
                                        <div className={styles.title}>证件号码</div>
                                        <div className={[styles.flex_basis, styles.description].join(' ')}>
                                            {insurantInfo.identity}</div>
                                    </li>
                                )}

                                {insurantInfo.birthday !== null && (
                                    <li className={styles.flex}>
                                        <div className={styles.title}>出生日期</div>
                                        <div className={[styles.flex_basis, styles.description].join(' ')}>
                                            {insurantInfo.birthday}</div>
                                    </li>
                                )}
                                {insurantInfo.gender !== null && (
                                    <li className={styles.flex}>
                                        <div className={styles.title}>性别</div>
                                        <div className={[styles.flex_basis, styles.description].join(' ')}>
                                            {insurantInfo.gender}</div>
                                    </li>
                                )}

                                {insurantInfo.address !== null && (
                                    <li className={styles.flex}>
                                        <div className={styles.title}>地址</div>
                                        <div className={[styles.flex_basis, styles.description].join(' ')}>
                                            {insurantInfo.address}</div>
                                    </li>
                                )}

                                {insurantInfo.mobile !== null && (
                                    <li className={styles.flex}>
                                        <div className={styles.title}>手机号</div>
                                        <div className={[styles.flex_basis, styles.description].join(' ')}>
                                            {insurantInfo.mobile}</div>
                                    </li>
                                )}

                                {insurantInfo.email !== null && (
                                    <li className={styles.flex}>
                                        <div className={styles.title}>邮箱</div>
                                        <div className={[styles.flex_basis, styles.description].join(' ')}>
                                            {insurantInfo.email}</div>
                                    </li>
                                )}

                                {insurantInfo.relation !== null && (
                                    <li className={styles.flex}>
                                        <div className={styles.title}>与投保人关系</div>
                                        <div className={[styles.flex_basis, styles.description].join(' ')}>
                                            {insurantInfo.relation}</div>
                                    </li>
                                )}

                            </ul>
                            ))
                        )}
                </div>
                <div className={styles.line}></div>
                <div className={styles.insurance_info}>
                    <div className={[styles.relative, styles.person].join(' ')}>
                        <span>受益人信息</span>
                        <div className={styles.mark}></div>
                    </div>
                    {queryPoliciesDetail !== null && queryPoliciesDetail.beneficiariesInfos.length > 0 && queryPoliciesDetail.beneficiariesInfos.map((item, key) => (
                        <ul className={styles.list} key={key}>
                            {item.relation !== null && (
                                <li className={styles.flex}>
                                    <div className={styles.title}>受益人是被保险人的</div>
                                    <div className={[styles.flex_basis, styles.description].join(' ')}>{item.relation}</div>
                                </li>
                            )}

                            {item.name !== null && (
                                <li className={styles.flex}>
                                    <div className={styles.title}>第{key + 1}受益人姓名</div>
                                    <div className={[styles.flex_basis, styles.description].join(' ')}>{item.name}</div>
                                </li>
                            )}

                            {item.identityType !== null && (
                                <li className={styles.flex}>
                                    <div className={styles.title}>证件类型</div>
                                    <div className={[styles.flex_basis, styles.description].join(' ')}>
                                        {item.identityType}</div>
                                </li>
                            )}
                            {item.identity !== null && (
                                <li className={styles.flex}>
                                    <div className={styles.title}>证件号码</div>
                                    <div className={[styles.flex_basis, styles.description].join(' ')}>
                                        {item.identity}</div>
                                </li>
                            )}

                            {item.birthday !== null && (
                                <li className={styles.flex}>
                                    <div className={styles.title}>出生日期</div>
                                    <div className={[styles.flex_basis, styles.description].join(' ')}>
                                        {item.birthday}</div>
                                </li>
                            )}
                            {item.gender !== null && (
                                <li className={styles.flex}>
                                    <div className={styles.title}>性别</div>
                                    <div className={[styles.flex_basis, styles.description].join(' ')}>
                                        {item.gender}</div>
                                </li>
                            )}
                            {item.benefit !== null && (
                                <li className={styles.flex}>
                                    <div className={styles.title}>受益比例</div>
                                    <div className={[styles.flex_basis, styles.description].join(' ')}>
                                        {item.benefit}%</div>
                                </li>
                            )}

                        </ul>
                    ))}
                    {queryPoliciesDetail !== null && queryPoliciesDetail.beneficiaryType !== null && (
                        <div className={[styles.beneficiaryType, styles.flex].join(' ')}>
                            <span>受益人</span>
                            <span className={[styles.flex_basis, styles.description].join(' ')}>{queryPoliciesDetail.beneficiaryType}受益人</span>
                        </div>
                    )}

                </div>
                <div className={styles.line}></div>
                <div className={styles.insurance_info}>
                    <div className={[styles.relative, styles.person].join(' ')}>
                        <span>续期缴费信息</span>
                        <div className={styles.mark}></div>
                    </div>
                    {queryPoliciesDetail !== null &&
                        queryPoliciesDetail.renewalFeeInfo !== null && renewalFeeInfo.length > 0 && (
                            <ul className={styles.list}>
                                {queryPoliciesDetail.renewalFeeInfo.renewalBank !== null && (
                                    <li className={styles.flex}>
                                        <div className={styles.title}>开户银行</div>
                                        <div className={[styles.flex_basis, styles.description].join(' ')}>
                                            {queryPoliciesDetail.renewalFeeInfo.renewalBank}</div>
                                    </li>
                                )}

                                {queryPoliciesDetail.renewalFeeInfo.renewalCardholder !== null && (
                                    <li className={styles.flex}>
                                        <div className={styles.title}>持卡人</div>
                                        <div className={[styles.flex_basis, styles.description].join(' ')}>
                                            {queryPoliciesDetail.renewalFeeInfo.renewalCardholder}</div>
                                    </li>
                                )}

                                {queryPoliciesDetail.renewalFeeInfo.renewalAccount !== null && (
                                    <li className={styles.flex}>
                                        <div className={styles.title}>银行账号</div>
                                        <div className={[styles.flex_basis, styles.description].join(' ')}>
                                            {queryPoliciesDetail.renewalFeeInfo.renewalAccount}</div>
                                    </li>
                                )}
                            </ul>
                        )}
                </div>
                <div className={styles.line}></div>
                <div className={styles.insurance_info}>
                    <div className={[styles.relative, styles.person].join(' ')}>
                        <span>投保信息</span>
                        <div className={styles.mark}></div>
                    </div>
                    {queryPoliciesDetail !== null &&
                        queryPoliciesDetail.insuranceInfo !== null && insuranceInfo.length > 0 && (
                            <ul className={styles.list}>

                                {queryPoliciesDetail.insuranceInfo.premium !== null && (
                                    <li className={styles.flex}>
                                        <div className={styles.title}>总保费</div>
                                        <div className={[styles.flex_basis, styles.description].join(' ')}>
                                            {queryPoliciesDetail.insuranceInfo.premium}</div>
                                    </li>
                                )}

                                {queryPoliciesDetail.insuranceInfo.amount !== null && (
                                    <li className={styles.flex}>
                                        <div className={styles.title}>总保额</div>
                                        <div className={[styles.flex_basis, styles.description].join(' ')}>
                                            {queryPoliciesDetail.insuranceInfo.amount}</div>
                                    </li>
                                )}

                                {queryPoliciesDetail.insuranceInfo.effectiveDate !== null && (
                                    <li className={styles.flex}>
                                        <div className={styles.title}>保单生效日</div>
                                        <div className={[styles.flex_basis, styles.description].join(' ')}>
                                            {queryPoliciesDetail.insuranceInfo.effectiveDate}</div>
                                    </li>
                                )}

                                {queryPoliciesDetail.insuranceInfo.guaranteePeriod !== null && (
                                    <li className={styles.flex}>
                                        <div className={styles.title}>保障期间</div>
                                        <div className={[styles.flex_basis, styles.description].join(' ')}>
                                            {queryPoliciesDetail.insuranceInfo.guaranteePeriod}
                                        </div>
                                    </li>
                                )}

                                {queryPoliciesDetail.insuranceInfo.paymentPeriod !== null && (
                                    <li className={styles.flex}>
                                        <div className={styles.title}>缴费年限</div>
                                        <div className={[styles.flex_basis, styles.description].join(' ')}>
                                            {queryPoliciesDetail.insuranceInfo.paymentPeriod}</div>
                                    </li>
                                )}
                            </ul>
                        )}
                </div>
                <div className={styles.line}></div>
                <div className={styles.insurance_info}>
                    <div className={[styles.relative, styles.person].join(' ')}>
                        <span>缴费单信息</span>
                        <div className={styles.mark}></div>
                    </div>
                    {queryPoliciesDetail !== null &&
                        queryPoliciesDetail.renewalItems !== null && queryPoliciesDetail.renewalItems.length > 0 && (
                            <ul className={styles.list}>
                                {queryPoliciesDetail.renewalItems.map((ele, index) => {
                                    return (<li className={[styles.bottomBorder, styles.renewalItemCon].join(' ')} key={index}>
                                        <div className={['flex-r-bc', styles.firstItem].join(' ')} >
                                            <div className={styles.title_bold}>单号：{ele.renewalNo}</div><div className={[styles.unRenewal, ele.status.id !== 1 ? styles.renewal : ''].join(' ')}>{ele.status.name}</div>
                                        </div>
                                        <div className={'flex-r-bc'}>
                                            <div>日期：{ele.renewalDate}  </div><div>金额：{ele.premiumInCents}</div>
                                        </div>
                                    </li>)
                                })}
                            </ul>
                        )}
                </div>
            </div>
        );
    }
}

export default PolicyDetail;
