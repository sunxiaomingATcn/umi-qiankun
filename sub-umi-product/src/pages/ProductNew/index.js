/**
 * title: 产品详情
 */
/**
 * 客户 & 代理人
*/
import React, { Component } from 'react';
import { Toast } from 'antd-mobile';
import Footer from './Footer'
import ProHeader from './ProHeader';
import ProContent from './ProContent';
import { connect } from 'dva';
import Trail from "@/pages/ProductNew/trail";
import Input from "./components/FeeInput/Input";
import cloneDeep from 'lodash/cloneDeep';
import moment from 'moment';
import Utils from '@/utils/utils'
import Modal from "@/components/modal";
import WxSDK from "@/utils/wx-sdk";
import { history } from 'umi';
import { getFixValue, getInfoDetails, getSalesStatement, getInsuranceTips, getPremiumTrialTitle } from './assets/productConfig/judgeProductFeature';
import getSpecialPaymentQuote from './assets/productConfig/getSpecialPaymentQuote';
import { setCustomerToken } from '@/utils/tool/customer';
import iosnohistory from '@/utils/tool/iosnohistory';
import routerTrack from '@/components/routerTrack';
import FileRead from './components/FileRead';
import styles from './index.scss';


@routerTrack({ id: 'page10', resetuuid: true })
@connect(({ login, productNew, loading, insuredNew }) => ({
    login,
    productNew,
    insuredNew,
    loading: loading.effects['productNew/queryProductInfo', 'productNew/queryQuote']
}))
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            headerData: null,
            footerData: null,
            orderTrialOpen: false,
            queryProduct: null,
            quoteDisabled: false,
            restrictGenes: null,
            oldRestrictGenes: null,
            second: 3,
            isClick: false,
            isShow: false
        };
        localStorage.removeItem('ppb_visting_productName')
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const { productNew: { queryProduct } } = nextProps;
        if (queryProduct !== null && JSON.stringify(queryProduct) !== JSON.stringify(prevState.queryProduct)) {
            return {
                queryProduct
            }
        }
        return null
    }

    componentDidMount() {
        const { query: { id, health, parm } } = this.props.location;
        if (health === 'fail') {
            Modal.confirm({
                content: '很抱歉，您不符合该产品投保条件，无法获得保障，如有疑问请咨询客服。',
                // okText: '看看其他产品',
                cancelText: '我知道了',
                // onOk: () => history.push('/home'),
            })
        }
        if (parm) {
            localStorage.setItem('state_parm', parm);
        }
        this.dataInit(id);
        this.getRestrictGenes(id);
    }

    componentWillUnmount() {
    }

    // 获取分享链接
    initShare = (shareData) => {
        const { dispatch, location: { query: { id, userWorkId, tenantId, ...rest } } } = this.props;
        dispatch({
            type: 'home/jumpLink',
            payload: {
                ...rest,
                'blade-auth': undefined, // 去掉blade-auth
                id,
                userWorkId,
                tenant: tenantId
            }
        }).then(payload => {
            WxSDK.share({
                ...shareData,
                link: payload && payload.url
            })
        })
    }

    dataInit(id) {
        const { dispatch, location: { query } } = this.props;
        // 存储客户token
        setCustomerToken(query['blade-auth'] || '')
        dispatch({
            type: 'productNew/queryProductInfo',
            payload: {
                id
            }
        }).then(res => {
            if (res && res.code === 0) {
                const { payload: { saleName, description, thumbnailImage } } = res;
                setTimeout(() => {
                    // this.capture()
                }, 500)
                this.setState({
                    proID: res.payload.id,
                    insuranceCompany: res.payload.insuranceCompany
                })
                const sharedata = {
                    title: saleName,
                    desc: description,
                    imgUrl: thumbnailImage
                };
                this.initShare(sharedata)

                localStorage.setItem("product_id", res.payload.id)
                localStorage.setItem('ppb_visting_productName', saleName)
                localStorage.setItem('ppb_infoDetails', JSON.stringify(res.payload.infoDetails));
            } else {
                // window.history.go(-1)
            }
        })
    }

    /*
    * 初始化算费试算算费数据
    * */
    restrictGenesInfoInit = () => {
        let info = [];
        const { restrictGenes } = this.state;
        restrictGenes && restrictGenes.forEach((item) => {
            // 隐藏因子只有一个选项参与算费 & 后台配置不展示因子参与算费
            if (item.relationship_display || !item.display || (item.options && item.options.length === 1)) {
                info.push({
                    restrictGene: item.id,
                    value: item.defaultValue
                });
                if (item.relationships) {
                    for (let key in item.relationships) {
                        if (item.relationships[key].postEquivalenceRestrictGene) {
                            info.push({
                                restrictGene: item.relationships[key].postEquivalenceRestrictGene,
                                value: restrictGenes.find(e => e.id == key).defaultValue
                            });
                        }
                    }
                }
            }
        });
        return info;
    };


    closeOrderTrial = () => {
        this.setState({
            orderTrialOpen: false
        })
    };
    openOrderTrial = () => {
        // this.tracks([{ operateType: 12, msg: `点击内容=立即投保`, productId: localStorage.getItem("product_id") }])
        this.setState({
            orderTrialOpen: true
        })
    };

    saveQuoteDisabled = (value) => {
        this.setState({
            quoteDisabled: value
        })
    };

    countDown() {
        this.time = setInterval(() => {
            let second = --this.state.second
            this.setState({
                second: second
            }, () => {
                if (this.state.second < 1) {
                    clearInterval(this.time)
                    this.setState({
                        isClick: true
                    })
                }
            })
        }, 1000);
    }

    tracks(payload) {
        this.props.dispatch({
            type: "insuredNew/tracks",
            payload,
        })
    }


    /*
    *   新算费因子更新到state，并处理对后续因子影响
    *   item 算费因子
    * */

    updateRestrictGenes = (item, index) => {
        const { restrictGenes } = this.state;
        const newRestrictGenes = cloneDeep(restrictGenes);
        newRestrictGenes[index] = item;
        this.setState({
            restrictGenes: newRestrictGenes
        }, () => {
            if (Object.keys(item.relationships).length > 0) {
                this.reSetRelation(item)
            } else {
                this.getQueryQuote();
            }
            // console.log(restrictGenes, 2222222222222);
        });

    };


    reSetRelation(restrictGenesItem) {
        const oldRestrictGenes = cloneDeep(this.state.oldRestrictGenes);
        const newRestrictGenes = cloneDeep(this.state.restrictGenes);
        const { relationships } = restrictGenesItem;
        // console.log(restrictGenesItem,2222222222,relationships);
        for (let key in relationships) {
            // console.log(relationshipKey);
            const oldRestrictGenesItem = oldRestrictGenes.find(item => item.id == key); // 缓存后置因子
            const currentPostRes = oldRestrictGenes.find(item => item.id == key); // 当前后置因子
            const curResMorePreResList = newRestrictGenes.filter(i => Object.keys(i.relationships).length).filter(i => i.relationships[key]); // 当前后置所有前置
            const currentPostResType = currentPostRes.type.value == 1 ? 1 : 2;                         //当前后置类型
            let currentPostOptions = oldRestrictGenesItem.options ? oldRestrictGenesItem.options : []; // 目标后置因子options：['value','value'...]
            // console.log(curResMorePreResList,333);
            let currentPostInterval = oldRestrictGenesItem.interval || {}; // 目标后置因子区间{min,max,...}
            let currentPostDisplay = true; // 目标后置因子relationship_display

            curResMorePreResList.forEach(r => {
                const preResRelList = r.relationships[currentPostRes.id]; // 当前前置因子目标后置[{relationship_display:true,preOptions:[]...},...]
                preResRelList.forEach(item => {
                    const { preOptions, preInterval, postOptions, postInterval } = item;
                    const preType = preOptions ? "radio" : preInterval && "range",
                        postType = postOptions ? "radio" : postInterval && "range";// 因子类型：radio:单选, range:区间；
                    const condition = preType === "radio" ? item.preOptions.includes(r.defaultValue) : this.compareTimeInterval(r.defaultValue, item.preInterval);// 条件
                    // console.log(condition, item, 1111);
                    // 结果 条件为真时 && 判断后置类型  处理后置结果
                    if (condition) currentPostDisplay *= item.display; // 多前置不应该存在可选结果没有交集,如果存在配置错误，只要有一个前置导致不展示就不展示
                    // console.log(currentPostDisplay, item, key,1312312312)
                    switch (condition && postType) {
                        case "radio":
                            currentPostOptions = currentPostOptions.filter(i => item.postOptions.includes(i));
                            break;
                        case "range":
                            currentPostInterval = Utils.compareTimeSetInterval(item.postInterval, currentPostRes.interval);
                            break;
                    }
                })
            });
            // 判断类型去做因子选项更改
            if (currentPostResType === 1) {
                // console.log(restrictGenesItem,restrictGenesItem.defaultValue,key);
                newRestrictGenes.map((ele, index) => {
                    if (ele.id == key) {
                        ele.relationship_display = currentPostDisplay;
                        if (JSON.stringify(ele.options) === JSON.stringify(currentPostOptions)) {
                            return false;
                        } else {
                            ele.options = currentPostOptions.filter(function (v) {
                                return oldRestrictGenesItem.options.indexOf(v) !== -1 // 取交集
                            });
                        }
                    }
                });
            } else if (currentPostResType === 2) {
                newRestrictGenes.map((ele) => {
                    if (ele.id == key) {
                        ele.relationship_display = currentPostDisplay;
                        if (JSON.stringify(ele.interval) === JSON.stringify(currentPostInterval)) {
                            return false;
                        } else {
                            ele.interval = Utils.compareTimeSetInterval(currentPostInterval, oldRestrictGenesItem.interval);
                        }
                    }
                });
            }
            // console.log(newRestrictGenes,222);
        }
        this.setState({
            restrictGenes: newRestrictGenes
        }, () => {
            if (this.isNeedReSetValue()) {
                this.reSetValue();
            } else {
                this.getQueryQuote();
            }
        });
    }

    /**
     * 打开/关闭消费者权益保障服务弹窗（可回溯提示）
    */
    confirm = (flag = false) => {
        this.setState({
            isShow: flag,
            isClick: false,
            second: 3
        })
    }

    /*
* 初始化本条因子选项值
* */
    reSetItem(restrictGenesItem, RestrictGenesArr) {
        const oldRestrictGenes = cloneDeep(this.state.oldRestrictGenes);
        const currentPostRes = oldRestrictGenes.find(item => item.id === restrictGenesItem.id); // 当前后置因子
        const curResMorePreResList = RestrictGenesArr.filter(i => Object.keys(i.relationships).length).filter(i => i.relationships[restrictGenesItem.id]);// 当前因子所有前置
        let currentPost = currentPostRes.options ? currentPostRes.options : currentPostRes.interval; // 目标后置因子options：['value','value'...]
        let currentPostDisplay = true;// 目标后置因子relationship_display
        // console.log(curResMorePreResList,1111);
        curResMorePreResList.forEach(r => {
            const preResRelList = r.relationships[restrictGenesItem.id]; // 当前前置因子目标后置[{relationship_display:true,preOptions:[]...},...]
            preResRelList.forEach(item => {
                const { preOptions, preInterval, postOptions, postInterval } = item;
                const preType = preOptions ? "radio" : preInterval && "range",
                    postType = postOptions ? "radio" : postInterval && "range";// 因子类型：radio:单选, range:区间；
                const condition = preType === "radio" ? item.preOptions.includes(r.defaultValue) : this.compareTimeInterval(r.defaultValue, item.preInterval); // 是否在范围内
                // 结果 条件为真时 && 判断后置类型  处理后置结果
                if (condition) currentPostDisplay *= item.display; // 多前置不应该存在可选结果没有交集,如果存在配置错误，只要有一个前置导致不展示就不展示
                // console.log(currentPost, item, 555);
                switch (condition && postType) {
                    case "radio":
                        currentPost = currentPost.filter(i => item.postOptions.includes(i));
                        break;
                    case "range":
                        currentPost = Utils.compareTimeSetInterval(item.postInterval, currentPost);
                        break;
                }
            })
        });
        // console.log(restrictGenesItem, currentPostDisplay, 339)
        restrictGenesItem.relationship_display = currentPostDisplay;
        restrictGenesItem.options ? restrictGenesItem.options = currentPost : restrictGenesItem.interval = currentPost;
        if (restrictGenesItem.options && !restrictGenesItem.options.includes(restrictGenesItem.defaultValue) || (restrictGenesItem.options && restrictGenesItem.defaultValue === null)) {
            restrictGenesItem.defaultValue = restrictGenesItem.options[0];
        } else if (restrictGenesItem.interval && !this.compareTimeInterval(restrictGenesItem.defaultValue, restrictGenesItem.interval) || (restrictGenesItem.interval && restrictGenesItem.defaultValue === null)) {
            restrictGenesItem.defaultValue = moment(Utils.formatIntervalTime(restrictGenesItem.interval).etime).format('YYYY-MM-DD');
        }
        return restrictGenesItem;  // 返回处理后因子
    }

    compareTimeInterval = (defaultValue, preInterval) => {
        // 比较时间区间
        // console.log(defaultValue,123123123)
        const time = moment(defaultValue);
        const { stime, etime } = Utils.formatIntervalTime(preInterval);
        return Utils.compareTime({ time, stime, etime });
    };


    getRestrictGenes(id) {
        const { dispatch } = this.props;
        dispatch({
            type: 'productNew/queryRestrictGenes',
            payload: {
                id
            }
        }).then(res => {
            if (res && res.code === 0) {
                let restrict_genes = []
                res.payload.forEach((item, index) => {
                    restrict_genes.push({
                        id: item.id,
                        name: item.name
                    })
                })
                if (localStorage.ppb_visting_productName == '机动车延长保修保险UAC' || localStorage.ppb_visting_productName == '人保驾乘意外险产品EAU') {
                    localStorage.setItem('restrict_genes', JSON.stringify(restrict_genes))
                }
                this.setState({
                    restrictGenes: res.payload,
                    oldRestrictGenes: cloneDeep(res.payload),
                }, () => this.checkData());
            }
        })
    }


    /*
    * 对算费因子遍历，更改选项值
    * */
    checkData = () => {
        const { restrictGenes } = this.state;
        const RestrictGenesArr = [];
        restrictGenes && restrictGenes.map((item) => {
            RestrictGenesArr.push(this.reSetItem(item, RestrictGenesArr));
        });
        this.setState({
            restrictGenes: RestrictGenesArr
        }, () => {
            if (this.isNeedReSetValue()) {
                this.reSetValue();
            } else {
                this.getQueryQuote();
            }
        });
        // console.log(newRestrictGenes,123123123123);
    };

    isNeedReSetValue = () => {
        const { restrictGenes } = this.state;
        let flag = false;
        restrictGenes && restrictGenes.forEach((item) => {
            if ((item.options && !item.options.includes(item.defaultValue)) || (item.interval && !this.compareTimeInterval(item.defaultValue, item.interval))) {
                flag = true;
            }
        });
        return flag;
    };

    /*
    * 若范围内无值，重新赋值后再次处理后置问题
    * */
    reSetValue = () => {  //
        const { restrictGenes } = this.state;
        const newRestrictGenes = cloneDeep(restrictGenes);
        const RestrictGenesArr = [];
        newRestrictGenes && newRestrictGenes.map((item) => {
            RestrictGenesArr.push(this.reSetItem(item, RestrictGenesArr));
        });
        this.setState({
            restrictGenes: RestrictGenesArr
        }, () => {
            this.getQueryQuote();
        });
    };

    getQueryQuote = async () => {
        const { dispatch } = this.props;
        const { id } = this.props.location.query;
        const { restrictGenes } = this.state;
        const info = this.restrictGenesInfoInit();
        // 参与算费的缴费方式值的类型
        await dispatch({
            type: 'productNew/queryQuote',
            payload: {
                id,
                info
            },
            detailedQuotation: true
        }).then(res => {
            if (res && res.code == 0) {
                // 算费结果展示dom
                this.setState({ quoteDom: getSpecialPaymentQuote({ premium: res.payload.premium }, { restrictGenes, quoteRestrictGene: info }) })
            }
        })
        sessionStorage.setItem(`ppb_restrictGenes`, JSON.stringify(restrictGenes))
    };

    renderRestrictGenes = () => {
        const { queryProduct, restrictGenes } = this.state;
        // 处理基本保额隐藏
        // const basicAmountRestrictGene = restrictGenes && restrictGenes.find(item => item.name === '基本保额')
        // if (basicAmountRestrictGene) basicAmountRestrictGene.relationship_display = !!basicAmountIsShow();
        let data = null;
        if (queryProduct !== null && restrictGenes !== null && restrictGenes.length > 0) {
            data = <div>
                {
                    restrictGenes.map((item, index) => {
                        return (item.relationship_display && item.display) ? <Input key={item.id}
                            item={item}
                            tag={index}
                            occupationCategory={queryProduct.occupationCategory}
                            saveQuoteDisabled={this.saveQuoteDisabled}
                            updateRestrictGenes={this.updateRestrictGenes}
                            id={this.props.location.query.id} /> : null
                    })
                }
            </div>;
        }
        return data;
    }

    pictureNotifyClick = ({ target: { id } }) => {
        // 注意给指定InsuranceTips的客户告知书添加dom id = pictureNotify
        if (id != 'pictureNotify') return;
        const { queryProduct: { pictureNotify: { richFile, richText } } = {} } = this.state;
        const infoDetails = getInfoDetails();
        const appointPictureNotify = infoDetails && infoDetails.find(item => item.name === 'pictureNotify');
        if (richFile) {
            Modal.popup({
                title: "客户告知书",
                content: <FileRead file={{ url: richFile }} />,
            })
        } else if (appointPictureNotify && appointPictureNotify.value && appointPictureNotify.value.filePath) {
            window.open(appointPictureNotify.value.filePath);
        } else if (richText) {
            let content = <div className={styles.popContent} dangerouslySetInnerHTML={{ __html: richText }} />
            Modal.popup({
                title: "客户告知书",
                content,
            })
        }
    }

    renderTracBack = () => {
        const { insuranceCompany } = this.state;
        // 可回溯弹窗
        const insuranceTips = getInsuranceTips({
            insuranceCompany: insuranceCompany && insuranceCompany.fullName,
            salesCompany: getSalesStatement().salesCompany
        }) || {};
        return this.state.isShow ? <div className={styles.InsuranceTips}>
            <div className={styles.mask}></div>
            <div className={styles.Tips}>
                <div className={styles.title}>
                    <h3>{insuranceTips.title}</h3>
                </div>
                <div className={styles.TipsContent}>
                    <div onClick={this.pictureNotifyClick} dangerouslySetInnerHTML={{ __html: insuranceTips.content }}></div>
                </div>
                <div className={styles.tipsBtn}>
                    <button
                        onClick={() => this.confirm()}
                        style={{ background: "#0065FF" }}
                    >
                        {insuranceTips.submitText}
                    </button>
                </div>
            </div>
        </div> : null
    }

    /**
     * 跳转下一页面
    */
    next = () => {
        Toast.loading('Loading...', 0);
        const {
            dispatch,
            location: { query, query: { id: productId } },
            productNew: { quoteInfo, queryProduct },
        } = this.props;
        if (queryProduct && queryProduct.innerSaleStatus === 1) {
            const { location: { query: { tenantId, userWorkId } } } = this.props;
            dispatch({
                type: 'productNew/saveQuote',
                payload: {
                    quoteCode: quoteInfo.quoteCode,
                    parm: localStorage.getItem("state_parm"),
                    tenantId,
                    userWorkId
                }
            }).then((res) => {
                Toast.hide();
                if (res && res.code === 0) {
                    // localStorage.setItem('saleName', queryProduct ? queryProduct.saleName : '');
                    // localStorage.setItem('premium', res.payload.premium);
                    this.saveQuoteDisabled(true);

                    const queryParams = {
                        ...query,
                        'blade-auth': undefined,
                        id: productId,
                        healthStatementUrl: res.payload.healthStatementUrl,
                        quoteRecordId: res.payload.id
                    }
                    // 算费因子存在保障计划并且为精英版时 无健康告知
                    // const guaranteeElitePlan = restrictGenes.find(item => (item.id == guaranteePlan && item.defaultValue === '精英版'));
                    if (res.payload.healthStatementContents && res.payload.healthStatementContents.length > 0) {
                        history.push({
                            pathname: '/ProductNew/healthStatement',
                            query: queryParams,
                        });
                    } else if (res.payload && res.payload.healthStatementUrl) {
                        // 智能核保
                        this.props.trackStop()
                            .then(() => {
                                window.location.href = res.payload.healthStatementUrl;
                            })
                        return;
                    } else {
                        if (localStorage.ppb_visting_productName == '机动车延长保修保险UAC') {
                            history.push({
                                pathname: '/ProductNew/UAC/carAssessment',
                                query: queryParams,
                            });
                        } else {
                            history.push({
                                pathname: '/ProductNew/Insured',
                                query: queryParams,
                            });
                        }
                    }
                }

            })
        } else if (queryProduct && queryProduct.innerSaleStatus === 2) {
            Modal.confirm({
                content: '产品预售中，详情请联系客服。',
                okText: '联系客服 ',
                cancelText: '我知道了',
                onOk: () => window.location.href = 'https://www.sobot.com/chat/h5/index.html?sysNum=4debc641aefd4d859181fcca74633b67',
                onCancel: () => console.log('cancel')
            });
        }

    };

    render() {
        const { productNew: { quoteInfo }, location: { query: { id } } } = this.props;
        const { queryProduct, restrictGenes, orderTrialOpen, quoteDom } = this.state;
        return (
            <div id="rot1" className={styles.proContainer}>
                {queryProduct !== null && <>
                    <div
                        className={styles.proContentContainer}
                        style={{ overflowY: orderTrialOpen ? 'hidden' : 'auto', 'height': `calc(100% - ${iosnohistory() ? 1.8 : 1.2}rem)` }}>
                        <ProHeader queryProduct={queryProduct} />
                        <ProContent
                            quoteInfo={quoteInfo}
                            queryProduct={queryProduct}
                            restrictGenes={restrictGenes}
                            openOrderTrial={this.openOrderTrial}
                            confirm={this.confirm}
                            updateRestrictGenes={this.updateRestrictGenes}
                            id={id}
                            quoteDom={quoteDom}
                        />
                    </div>
                    <Footer
                        {...this.state.footerData}
                        quoteInfo={quoteInfo}
                        openOrderTrial={this.openOrderTrial}
                        confirm={this.confirm}
                        quoteDom={quoteDom}
                        next={this.next}
                    />
                    {this.state.orderTrialOpen && <Trail
                        trackStop={this.props.trackStop}
                        quoteInfo={quoteInfo}
                        quoteDisabled={this.state.quoteDisabled}
                        saveQuoteDisabled={this.saveQuoteDisabled}
                        productId={this.props.location.query.id}
                        title={getPremiumTrialTitle(queryProduct && queryProduct.saleName)}
                        closeOrderTrial={this.closeOrderTrial}
                        quoteDom={quoteDom}
                        location={this.props.location}
                        next={this.next}
                    >
                        {this.renderRestrictGenes()}
                    </Trail>}
                </>}
                {this.renderTracBack()}
            </div>
        );
    }
}

export default Index;
