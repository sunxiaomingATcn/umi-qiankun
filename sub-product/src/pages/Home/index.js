/**
 * title: 产品
 */
/**
 * 代理人 产品列表
*/
import React, { Component } from 'react';
import { connect } from 'dva';
import { Toast, ActivityIndicator } from 'antd-mobile';
import BScroll from "better-scroll";
import styles from './index.scss';
import Swiper from 'swiper/dist/js/swiper.js';
import 'swiper/dist/css/swiper.min.css';
import Modal from "@/components/modal";
import { getProductLink } from '@/utils/tool/agentInfo';
import WxSDK from "@/utils/wx-sdk";
import * as requestMethods from '@/services/home';

@connect(({ home, login, loading }) => ({
    home,
    login,
    loading: loading.effects['home/queryProductList'],
}))
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clickedIndex: 0,
            loading: true,
            pageSize: 10,
            total: null,
            pullDownRefresh: true,
            pullUpLoad: true,
            queryProductList: [],
            pageCount: 1,
            categoryList: [{ name: '全部', id: undefined },],
        }
        this.outerScroller = null;
        this.more = null;
    }

    categorys = [
        { title: '全部', id: undefined },
        { title: '医疗', id: '' },
        { title: '意外', id: '' },
        { title: '重疾', id: '' },
        { title: '寿险', id: '' },
        { title: '年金', id: '' },
    ];

    componentDidMount() {
        // const data = {
        //     title: "阿保保险严选",
        //     desc: "给家人多一份关爱和保护",
        // };
        // WxSDK.share(data);
        this.getContentScroll();
        this.initTabsCategory();
        this.getProduct();
        this.queryCategoryList()
    }

    getContentScroll = () => {
        const wrapper = document.getElementById('product_scroll_wrapper')
        this.bScroll = new BScroll(wrapper, {
            preventDefault: true,
            scrollY: true,
            // 实时派发scroll事件
            probeType: 3,
            mouseWheel: true,
            scrollbars: true,
            click: true,
            pullDownRefresh: {
                // 下拉距离超过30px触发pullingDown事件
                threshold: 30,
                // 回弹停留在距离顶部20px的位置
                stop: 20
            },
            pullUpLoad: true
        })

        // 下拉刷新
        this.bScroll.on("pullingDown", async () => {
            await this.getProduct();
            this.bScroll.finishPullDown();
        });

        // // 加载更多
        // this.bScroll.on("pullingUp", () => {
        //     const disY = this.bScroll.y - this.bScroll.maxScrollY;
        //     if (disY <= 20) {
        //         const { currentPage, totalPage } = this.state;
        //         if (totalPage && (currentPage >= totalPage)) {
        //             // if (disY < 0) Toast.info('没有更多了');
        //             this.bScroll.finishPullUp();
        //             return;
        //         };
        //         this.setState({ currentPage: currentPage + 1 }, async () => {
        //             await this.loadMore();
        //             this.bScroll.finishPullUp();
        //         })
        //     }
        // })
    }

    initTabsCategory = () => {
        let _this = this;
        new Swiper('.swiper-container', {
            slidesPerView: 6,
            // centeredSlides: true,
            observer: true,//修改swiper自己或子元素时，自动初始化swiper
            observeParents: true,//修改swiper的父元素时，自动初始化swiper
            on: {
                click: function () {
                    if (_this.state.clickedIndex == this.clickedIndex) return;
                    _this.setState({
                        clickedIndex: this.clickedIndex
                    })
                    _this.getProduct();
                }
            }
        });
    }

    getProduct = () => {
        const { dispatch } = this.props;
        // if (this.state.clickedIndex > 0) {
        //     // 其他分类暂时默认空数据
        //     this.setState({
        //         totalPage: 0,
        //         pageCount: 1,
        //         queryProductList: []
        //     })
        //     return;
        // }

        Toast.loading('Loading', 0)
        let loginData = JSON.parse(localStorage.getItem("loginData") || "{}")
        dispatch({
            type: 'home/queryTableList',
            payload: {
                isRecommend: 0,
                productCategoryItems: this.state.categoryList[this.state.clickedIndex].id,
                userWorkId: loginData.userId || ''
            }
        }).then(res => {
            console.log(res)
            Toast.hide();
            const { code } = res;
            if (code === 200) {
                this.setState({
                    queryProductList: res.data
                }, () => {
                    this.bScroll.refresh();
                })
            }
        })
    };

    
    queryCategoryList = () =>{
        requestMethods.queryCategoryList().then(res => {
        if (!res) return;
        console.log('[queryProductList]', res.payload);
        if (res.code === 0) {
            this.setState({
                categoryList: this.state.categoryList.concat(res.payload),
            });
        }
        });
    }

    // loadMore = () => {
    //     const { dispatch } = this.props;
    //     const { currentPage } = this.state;
    //     dispatch({
    //         type: 'home/queryTableList',
    //         payload: {
    //             current: currentPage,
    //             productCategoryItems: this.state.categoryList[this.state.clickedIndex].id,
    //             size: this.state.pageSize
    //         }
    //     }).then(res => {
    //         const { code, payload } = res;
    //         const { queryProductList } = this.state;
    //         if (code === 200) {
    //             queryProductList.push(...res.data);
    //             this.setState({ queryProductList }, () => {
    //                 this.bScroll.refresh();
    //             })
    //         }
    //     })
    // }

    jumpLink = (productId, channelType) => {
        Toast.loading("Loading...", 0)
        const { dispatch } = this.props;
        getProductLink(dispatch, productId, channelType)
            .then(res => Toast.hide())
            .catch(res => {
                Toast.hide();
                if (res == 'presale') {
                    Modal.confirm({
                        content: '产品预售中，详情请联系客服。',
                        okText: '联系客服 ',
                        cancelText: '我知道了',
                        onOk: () => window.location.href = 'https://www.sobot.com/chat/h5/index.html?sysNum=4debc641aefd4d859181fcca74633b67',
                        onCancel: () => console.log('cancel')
                    });
                }
            })
    };

    render() {
        const { queryProductList } = this.state;
        return (
            <div>
                {/* <ActivityIndicator toast text="Loading..." size="large" animating={this.props.loading} /> */}
                <div className={["swiper-container", styles.navbar].join(" ")}>
                    <div className={["swiper-wrapper"].join(' ')}>
                        {this.state.categoryList.map((tab, index) =>
                            <div
                                className={[styles.slide, 'swiper-slide', this.state.clickedIndex == index ? styles.active : null].join(' ')}
                            >{tab.name}
                            </div>
                        )}
                    </div>
                </div>
                <div className={[styles.content_wrapper, styles.outer_scroller].join(' ')}>
                    <div
                        id="product_scroll_wrapper"
                        style={{ height: '100%' }}
                    >
                        <div style={{ paddingBottom: 30 }}>
                            {queryProductList.length > 0 ?
                                queryProductList.map((item, key) => (
                                    <div key={item.id} onClick={() => this.jumpLink(item.productId)}>
                                        <div className={[styles.flex, styles.card].join(' ')}>
                                            <div className={styles.card_left}>
                                                <img src={item.logo} />
                                            </div>
                                            <div className={[styles.flex_basis, styles.card_right].join(' ')}>
                                                <div
                                                    className={styles.title}>{item.saleName}</div>
                                                <div className={styles.description}>{item.description}</div>
                                                <div className={styles.cost}>
                                                    <div className={styles.price}><span>{item.startingPrice}</span> 元起</div>
                                                    {/* <div className={styles.promotion}>推广费 30%</div> */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) :
                                <div className={styles.no_product}>
                                    <img src={require('@/assets/icon/no-product.svg')} />
                                    <p>暂无产品</p>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Index;
