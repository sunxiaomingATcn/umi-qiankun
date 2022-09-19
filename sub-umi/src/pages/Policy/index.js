/**
 * title: 保单查询
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { ActivityIndicator, Toast, Popover } from 'antd-mobile';
import styles from './index.scss'
import { Link } from 'umi';
import CrmUnpolicy from './components/crmUnpolicy';
import Swiper from 'swiper/dist/js/swiper.js'
import 'swiper/dist/css/swiper.min.css'
import { history } from 'umi';
import { UserInfo } from './assets/common'

const Item = Popover.Item;

@connect(({ login, policy, pay }) => ({
    login,
    policy,
    pay
}))
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            checkedIndex: 0,
            loading: true,
            moreSearchClicked: false,
        }
    }

    componentDidMount() {

        this.initData()

        const _this = this;
        let mySwiper = new Swiper('.swiper-container', {
            slidesPerView: 'auto',
            // centeredSlides: true,
            observer: true,//修改swiper自己或子元素时，自动初始化swiper
            observeParents: true,//修改swiper的父元素时，自动初始化swiper
            on: {
                click: function () {
                    // 点击slider以外区域 and 点击当前选中slider不执行以下
                    if (this.clickedIndex === undefined || _this.state.checkedIndex == this.clickedIndex) return;
                    _this.setState({
                        checkedIndex: this.clickedIndex
                    });

                    _this.getPolicy(this.clickedIndex);
                }
            }
        });
    }

    /**
     * @param type {Number} 查询方式 : 为空时取query，无query.searchBy默认方式1查询
     * type 1. searchBy = crmUser => 微信绑定crmid,根据crmid查询
     * type 2. searchBy = phone => 根据投保人手机号查询
    */
    initData = (type) => {
        const { location: { query: { searchBy = 'crmUser' }, state: { crmIsBinded } = {} } } = this.props;
        const queryType = type ? type : searchBy == 'phone' ? 2 : 1;
        sessionStorage.setItem("policyQueryType", queryType)

        this.setState({
            loading: true,
            searchBy,
            crmIsBinded,
            queryType
        }, () => {
            queryType === 2 ? this.searchByPhone() : this.searchByCrm()
        })
    }

    // 切换crmid方式查询保单
    pageToCrmSearch = () => {
        history.replace('/Policy?searchBy=crmUser')
        this.initData(1)
    }

    // 根据投保人手机号查询
    searchByPhone = () => {
        this.getPolicy().then(res => {
            this.setState({ loading: false })
            if (!res || res.code !== 0) {
                history.push('/login')
            }
        })
    }

    // 根据微信用户绑定crm查询
    searchByCrm = () => {
        // 获取用户信息 判断是否微信登录，已登录判断是否需要绑定
        UserInfo(this.props).then(data => {
            const { dispatch } = this.props;
            const { customerRelation } = data;
            const { crmIsBinded } = this.state;

            if (crmIsBinded === false) {
                // crmIsBinded false:绑定非crm用户手机号,未绑定
                this.setState({ loading: false })
                dispatch({
                    type: 'policy/clearPoliciesList'
                })
            } else if (customerRelation && customerRelation.customerId) {
                this.setState({
                    customerId: customerRelation.customerId
                })
                this.getPolicy().then(() => {
                    this.setState({ loading: false })
                })
            } else {
                history.push('/Policy/wechat/bind')
            }
        })
    }

    // 获取保单列表
    getPolicy = (clickedIndex) => {
        const { queryType } = this.state;
        const token = queryType == 2 ? localStorage.getItem('token') : localStorage.getItem('wechat_user_token');
        const { dispatch } = this.props;
        return dispatch({
            type: 'policy/queryPoliciesList',
            payload: {
                pageSize: 100,
                token,
                queryType,
                // policyStatus: clickedIndex
            }
        })
    };

    // 更多icon
    handleVisibleChange = () => {
        const { moreSearchClicked } = this.state;
        this.setState({ moreSearchClicked: !moreSearchClicked })
    }

    // 更多下拉列表选中
    onMOreSelect = (e) => {
        if (e.key === 'reLogin') {
            history.push('/login')
        } else if (e.key === 'reBind') {
            const { dispatch } = this.props;
            history.push('/Policy/wechat/bind')
            dispatch({
                type: 'policy/wechatUnBindCrmId'
            }).then(res => {
                Toast.hide()
                if (res && res.code == 0) {
                } else {
                    Toast.info(res.message)
                }
            })
        }
    }

    pay = (index) => {
        const token = localStorage.getItem('token');
        const { dispatch, policy: { queryPoliciesList } } = this.props;
        const { paymentSign } = queryPoliciesList.list[index];
        // console.log(queryPoliciesList,index,queryPoliciesList.list[index])
        if (!paymentSign.quoteRecordId) return;
        Toast.loading('Loading...', 0);
        dispatch({
            type: 'pay/paymentInfo',
            payload: {
                params: {
                    orderNo: paymentSign.orderNo,
                    productId: paymentSign.productId,
                    purchaseOrderId: paymentSign.purchaseOrderId,
                    quoteRecordId: paymentSign.quoteRecordId,
                },
                token
            }
        }).then((res) => {
            Toast.hide();
            const { code, message, payload } = res;
            if (code === 0) {
                window.location.href = payload.paymentSignUrl.signLink;
            } else {
                Toast.fail(message, 2);
                return false;
            }
        })
    };

    chenckToPay = (e, id, policyId, index) => {
        e.preventDefault();
        if (id !== 3) {
            history.push({
                pathname: '/Policy/PolicyDetail',
                query: {
                    policyId
                }
            });
        } else {
            this.pay(index);
        }
    };

    renderPoliciesList = (queryPoliciesList) => {
        return queryPoliciesList.list.map((item, key) => (
            <Link to={`/Policy/PolicyDetail?policyId=${item.id}`} key={key}>
                <div key={key} className={styles.card}>
                    <div className={[styles.flex, styles.align_center, styles.card_header].join(' ')}>
                        <div className={[styles.card_header_name].join(' ')}>{item.product !== null ? item.product.name : ''}</div>
                        <div className={[styles.card_header_state, `accept_insurance${item.status.id}`].join(' ')} onClick={(e) => this.chenckToPay(e, item.status.id, item.id, key)}>{item.status.name}</div>
                    </div>
                    <div className={[styles.flex, styles.card_body].join(' ')}>
                        <div className={styles.text_left}>
                            <div className={styles.card_title}>被保人</div>
                            <div className={styles.card_description}>{item.insurant}</div>
                        </div>
                        <div className={styles.flex_basis}>
                            <div className={styles.datetime}>
                                <div className={styles.card_title}>保障起始日期</div>
                                <div className={styles.card_description}>{item.effectiveDate}</div>
                            </div>
                        </div>
                        <div className={styles.flex_basis}>
                            <div className={styles.datetime}>
                                <div className={styles.card_title}>保费</div>
                                <div className={styles.premiumInCents}>{item.premiumInCents}</div>
                            </div>
                        </div>
                    </div>
                    <div className={[styles.flex, styles.justify_between, styles.card_footer].join(' ')}>
                        <span className={styles.logo} style={{ 'backgroundImage': `url(${item.insuranceCompany.logo})` }}></span>
                        <div className={[styles.policy_number, 'singleLineEllipsis'].join(' ')}>保单号：<span>{item.policyNo}</span></div>
                    </div>
                </div>
            </Link>
        ))
    }

    render() {
        const { policy: { queryPoliciesList } } = this.props;
        const { moreSearchClicked, loading, crmIsBinded, queryType } = this.state;

        return (
            <div className={styles.policyContainer} style={{ background: '#F4F5F6', height: '100%' }}>
                <ActivityIndicator text="正在加载..." animating={loading} />
                <div className={["swiper-container", styles.mySwiper].join(" ")}>
                    <div className={[styles.flex, styles.navbar_wrapper, "swiper-wrapper"].join(' ')}>
                        <div className={[styles.item, 'swiper-slide', this.state.checkedIndex == 0 ? styles.active : null].join(' ')}>全部</div>
                        {/* <div className={[styles.item, 'swiper-slide', this.state.checkedIndex == 1 ? styles.active : null].join(' ')}>已出单</div>
                        <div className={[styles.item, 'swiper-slide', this.state.checkedIndex == 2 ? styles.active : null].join(' ')}>已退保</div> */}
                    </div>
                </div>
                <div className={styles.flexFixBox}>
                    {queryType === 2 ?
                        <div className={styles.requery}><span onClick={this.pageToCrmSearch}>返回</span></div> :
                        <Popover
                            visible={this.state.visible}
                            overlay={[
                                (<Item key="reBind" value="reBind" >切换账号</Item>),
                            ]}
                            onVisibleChange={this.handleVisibleChange}
                            onSelect={this.onMOreSelect}
                        >
                            <div className={styles.requery}><div className={moreSearchClicked ? styles.moreSelect : styles.more} >更多</div></div>
                        </Popover>}
                </div>


                <div className={styles.content_wrapper}>
                    {
                        queryPoliciesList.list.length > 0 ?
                            this.renderPoliciesList(queryPoliciesList) :
                            queryType === 2 ? null : <CrmUnpolicy crmIsBinded={crmIsBinded}
                            />
                    }
                </div>
            </div>
        );
    }
}

export default Index;
