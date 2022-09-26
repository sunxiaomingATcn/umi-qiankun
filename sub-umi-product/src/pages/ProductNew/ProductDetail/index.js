/**
 * title: 投保信息详情
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import styles from './index.scss';
import utils from "@/utils/utils";

// import {Toast} from "antd-mobile";
// import Utils from '@/utils/utils';
// import { payFixPrice } from '../assets/judgeProductFeature';
@connect(({ pay, loading, productNew }) => ({
    pay,
    productNew,
    loading: loading.models.pay,
}))
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            index: 0,
        }
    }

    componentDidMount() {
        const { location } = this.props;
        let channel = localStorage.getItem('channel')
        utils.collectBaiduHm(`投保信息详情页_曝光_进入投保信息详情页_${localStorage.getItem('product_id')}_${channel?channel:""}`, "open")
        const { dispatch } = this.props;
        dispatch({
            type: "productNew/queryDetail",
            payload:{
                id:this.props.location.query.orderNo
            }
        })
    }

    render() {
        const { productNew: { productDetail } } = this.props
        console.log(productDetail.applicantInfo.valEndDate||productDetail.applicantInfo.identityPeriod)
        return (
            <div className={styles.container}>
                {
                    productDetail && <div className={styles.productDetail}>
                        <div className={styles.productinfo}>
                            <div className={styles.name}>
                                <p>{productDetail.productName}</p>
                                <p>投保单号:{productDetail.proposalNo}</p>
                            </div>
                            <div className={styles.logo}>
                                <img src={productDetail.thumbnailImage}></img>
                            </div>
                        </div>
                        <div className={styles.line}></div>
                        <div className={styles.item_warpper}>
                            <div className={styles.item}>
                                <div className={styles.item_children} style={{ fontWeight: "bold" }} >基本信息</div>
                            </div>
                        </div>
                        {
                            productDetail.safeguard && <div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} >保障期限</div>
                                    <div className={styles.item_extra}  >{productDetail.safeguard}</div>
                                </div>
                            </div>
                        }
                        {
                            productDetail.premium && <Fragment> <div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} >总保费</div>
                                    <div className={styles.item_extra}  >￥{productDetail.premium}</div>
                                </div>
                            </div>
                                <div className={styles.line}></div>
                            </Fragment>
                        }
                        

                        <div className={styles.item_warpper}>
                            <div className={styles.item}>
                                <div className={styles.item_children} style={{ fontWeight: "bold" }} >投保人信息</div>
                            </div>
                        </div>
                        {
                            productDetail.applicantInfo.name && <div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} >姓名</div>
                                    <div className={styles.item_extra}  >{productDetail.applicantInfo.name}</div>
                                </div>
                            </div>
                        }
                        {
                            <div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} >税收居民身份</div>
                                    <div className={styles.item_extra}  >仅为中国税收居民</div>
                                </div>
                            </div>
                        }
                        {
                            productDetail.applicantInfo.identityTypeStr && <div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} >证件类型</div>
                                    <div className={styles.item_extra}  >{productDetail.applicantInfo.identityTypeStr}</div>
                                </div>
                            </div>
                        }
                        {
                            productDetail.applicantInfo.identity && <div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} >证件号码</div>
                                    <div className={styles.item_extra}  >{productDetail.applicantInfo.identity}</div>
                                </div>
                            </div>
                        }
                        {
                            (productDetail.applicantInfo.valEndDate||productDetail.applicantInfo.identityPeriod) && <div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} >证件有效期至</div>
                                    <div className={styles.item_extra}  >{productDetail.applicantInfo.valEndDate||productDetail.applicantInfo.identityPeriod}</div>
                                </div>
                            </div>
                        }
                        {
                            productDetail.applicantInfo.livingStr && <div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} >居住地区</div>
                                    <div className={styles.item_extra}  >{productDetail.applicantInfo.livingStr}</div>
                                </div>
                            </div>
                        }
                        {
                            productDetail.applicantInfo.detailsAddress && <div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} >联系地址</div>
                                    <div className={styles.item_extra}  >{productDetail.applicantInfo.detailsAddress}</div>
                                </div>
                            </div>
                        }
                        {
                            productDetail.applicantInfo.mobile && <div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} >手机号码</div>
                                    <div className={styles.item_extra}  >{productDetail.applicantInfo.mobile}</div>
                                </div>
                            </div>
                        }
                        {
                            productDetail.applicantInfo.email && <Fragment><div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} >邮箱</div>
                                    <div className={styles.item_extra}  >{productDetail.applicantInfo.email}</div>
                                </div>
                            </div>
                            </Fragment>
                        }
                        {
                            productDetail.insurantInfo&&<Fragment><div className={styles.line}></div><div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} style={{ fontWeight: "bold" }} >被保险人信息</div>
                                    <div className={styles.item_extra} >{productDetail.insurantInfo=="本人"?"本人":"他人"}</div>
                                </div>
                            </div>
                            </Fragment>
                        }
                        {
                            productDetail.insurantInfo&&productDetail.insurantInfo.relationStr && <div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} >是投保人的</div>
                                    <div className={styles.item_extra}  >{productDetail.insurantInfo.relationStr}</div>
                                </div>
                            </div>
                        }
                        {
                            productDetail.insurantInfo&&productDetail.insurantInfo.name && <div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} >姓名</div>
                                    <div className={styles.item_extra}  >{productDetail.insurantInfo.name}</div>
                                </div>
                            </div>
                        }
                        {
                            productDetail.insurantInfo&&productDetail.insurantInfo.identityTypeStr && <div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} >证件类型</div>
                                    <div className={styles.item_extra}  >{productDetail.insurantInfo.identityTypeStr}</div>
                                </div>
                            </div>
                        }
                        {
                            productDetail.insurantInfo&&productDetail.insurantInfo.identity && <div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} >证件号码</div>
                                    <div className={styles.item_extra}  >{productDetail.insurantInfo.identity}</div>
                                </div>
                            </div>
                        }
                        {
                            productDetail.insurantInfo&&(productDetail.insurantInfo.valEndDate||productDetail.insurantInfo.identityPeriod) && <div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} >证件有效期至</div>
                                    <div className={styles.item_extra}  >{productDetail.insurantInfo.valEndDate||productDetail.insurantInfo.identityPeriod}</div>
                                </div>
                            </div>
                        }
                        {
                            productDetail.insurantInfo&&productDetail.insurantInfo.professionStr && <div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} >职业</div>
                                    <div className={styles.item_extra}  >{productDetail.insurantInfo.professionStr}</div>
                                </div>
                            </div>
                        }
                        {
                            productDetail.insurantInfo&&productDetail.insurantInfo.mobile && <div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} >手机号码</div>
                                    <div className={styles.item_extra}  >{productDetail.insurantInfo.mobile}</div>
                                </div>
                            </div>
                        }
                        {
                            productDetail.insurantInfo&&productDetail.insurantInfo.height && <div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} >身高</div>
                                    <div className={styles.item_extra}  >{productDetail.insurantInfo.height}cm</div>
                                </div>
                            </div>
                        }
                        {
                            productDetail.insurantInfo&&productDetail.insurantInfo.weight && <Fragment><div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} >体重</div>
                                    <div className={styles.item_extra}  >{productDetail.insurantInfo.weight}kg</div>
                                </div>
                            </div>
                            <div className={styles.line}></div>
                            </Fragment>
                        }
                        {
                            productDetail.renewalFeeInfo&&<div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} style={{ fontWeight: "bold" }} >续期缴费信息</div>
                                </div>
                            </div>
                        }
                        {
                            productDetail.renewalFeeInfo&&productDetail.renewalFeeInfo.isRenewalPay && <div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} >是否自动续保</div>
                                    <div className={styles.item_extra}  >{productDetail.renewalFeeInfo.isRenewalPay==1?"自动续保":"非自动续保"}</div>
                                </div>
                            </div>
                        }
                        {
                            productDetail.renewalFeeInfo&&productDetail.renewalFeeInfo.renewalPayAccount && <div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} >银行账号</div>
                                    <div className={styles.item_extra}  >{productDetail.renewalFeeInfo.renewalPayAccount}</div>
                                </div>
                            </div>
                        }
                        {
                            productDetail.renewalFeeInfo&&productDetail.renewalFeeInfo.renewalPayBank && <div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} >开户银行</div>
                                    <div className={styles.item_extra}  >{productDetail.renewalFeeInfo.renewalPayBank}</div>
                                </div>
                            </div>
                        }
                        {
                            productDetail.renewalFeeInfo&&productDetail.renewalFeeInfo.renewalPayCardholder && <Fragment><div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} >持卡人</div>
                                    <div className={styles.item_extra}  >{productDetail.renewalFeeInfo.renewalPayCardholder}</div>
                                </div>
                            </div>
                            <div className={styles.line}></div>
                            </Fragment>
                        }
                        {
                            productDetail.rightsAndInterests&&<div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} style={{ fontWeight: "bold" }} >保障权益</div>
                                </div>
                            </div>
                        }
                        {
                            productDetail.rightsAndInterests&&productDetail.rightsAndInterests.map((item,index)=>{
                                return <div className={styles.item_warpper}>
                                <div className={styles.item}>
                                    <div className={styles.item_children} >{item.name}</div>
                                    <div className={styles.item_extra}  >{item.value}</div>
                                </div>
                            </div>
                            })
                        }
                    </div>
                }
            </div>
        );
    }
}

export default Index;
