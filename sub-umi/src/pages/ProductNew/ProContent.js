/**
 * title:
 */
import React, { Component, Fragment } from 'react';
import styles from './ProContent.scss';
import { Link } from 'umi';
import RadioButton from '@/components/radioButton/RadioButton';
import { Accordion } from 'antd-mobile';
import Modal from '@/components/modal';
import Swiper from 'swiper/dist/js/swiper.js';
import Utils from "@/utils/utils";
import { getFixValue, getSalesStatement } from './assets/productConfig/judgeProductFeature';

class ProContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            queryProduct: null,
            productProtectItems: []
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const { queryProduct } = nextProps;
        if (queryProduct !== null && JSON.stringify(queryProduct) !== JSON.stringify(prevState.queryProduct)) {
            return {
                queryProduct,
                productProtectItems: queryProduct.productProtectItems.slice(0, 4),
            }
        }
        return null
    }

    // 保障方案 关联因子
    handleBasicInsurance = () => {
        const { queryProduct: { basicRestrictGene, guaranteePlan }, restrictGenes } = this.props;
        const basicRestrictGeneIndex = restrictGenes.findIndex(item => item.id === basicRestrictGene);
        const guaranteePlanIndex = guaranteePlan && (basicRestrictGene != guaranteePlan) ? restrictGenes.findIndex(item => item.id === guaranteePlan) : -1;
        new Swiper('.swiper-container-basicInsurance', {
            slidesPerView: 'auto',
            observer: true,
            observeParents: true
        });
        return <>
            {[
                { restrictGene: restrictGenes[guaranteePlanIndex], restrictIndex: guaranteePlanIndex },
                { restrictGene: restrictGenes[basicRestrictGeneIndex], restrictIndex: basicRestrictGeneIndex }
            ].map(({ restrictGene, restrictIndex }) => restrictGene && restrictGene.display ?
                <div className={styles.sum_insured}>
                    <h3>{restrictGene.name}</h3>
                    <div className="swiper-container-basicInsurance" style={{ flex: 1, overflow: 'hidden' }}>
                        <div className="swiper-wrapper">
                            {restrictGene.options.map((item, index) => {
                                return <RadioButton
                                    key={index}
                                    className={`swiper-slide  ${styles.sum_insured_item}`}
                                    checked={restrictGene.defaultValue === item}
                                    onClick={(e) => this.onClickRadioButton(e, item, restrictIndex, restrictGene)}
                                >
                                    {item}
                                </RadioButton>
                            })
                            }
                        </div>
                    </div>
                </div>
                : null)}
        </>
    };

    /**
     * 保障方案 方案
    */
    accordionTitle = (title, defaultValue, item) => {
        let basicValue = defaultValue;
        const { queryProduct: { basicRestrictGene }, restrictGenes } = this.props;
        const basicInsurance = restrictGenes && restrictGenes.filter((item) => item.id === basicRestrictGene)[0];
        // 关联基本保额
        if (item.valueType.value === 1) {
            const value = basicInsurance ? basicInsurance.defaultValue : '';
            const num = parseInt(value);
            basicValue = value && value.replace(num, (num * basicValue / 100).toString());
        }
        // 关联算费因子
        if (item.valueType.value === 3 && restrictGenes) {
            const value = basicInsurance ? basicInsurance.defaultValue : '';
            const valueMap = item.restrictGeneValue && item.restrictGeneValue.find(i => i.name === value) || {};
            basicValue = valueMap.value;
        }
        const arr = [title, basicValue];
        const liEles = arr.map((item, index) => {
            return React.createElement("li", {
                key: index
            }, item)
        });
        return React.createElement("ul", { className: styles.accordion_title }, liEles);
    };

    /**
     * feature_4174
     * compensate 特殊
    */
    renderBottomDetails = () => {
        const { queryProduct, queryProduct: { additionalInfoDisplay = {} } } = this.state;
        const displayMap = { droits: 'protectDroits', insuranceCase: 'productTypicalCase', faqs: 'commonProblems', flows: 'compensate' };

        return Object.values(additionalInfoDisplay).includes(true) && <div className={styles.helpers}>
            <ul className='flex-r-ac'>
                {queryProduct.bottomDetails && queryProduct.bottomDetails.map(item => {
                    let imgUrl = require(`./images/${item.name}.png`)
                    return (item.value && additionalInfoDisplay[displayMap[item.name]] &&
                        <li key={item.name} className='flex-c-cc' onClick={() => this.popRights(item)}>
                            <img src={imgUrl} alt='' />
                            <span>{item.title}</span>
                        </li>)
                })}
                {queryProduct.compensate && additionalInfoDisplay[displayMap.flows] &&
                    <li key={queryProduct.compensate.id}
                        className='flex-c-cc'
                        onClick={() => this.popRights({ name: 'compensate', title: '理赔服务', value: { richText: queryProduct.compensate.richText } })}
                    >
                        <img src={require('./images/flows.png')} alt='' />
                        <span>理赔服务</span>
                    </li>
                }
            </ul>
        </div>
    }

    popRights = (item) => {
        let { title } = item;
        const content = this.rightsContentInit(item);
        this.showPopUp({ title, content });
    };

    rightsContentInit(item) {
        let content = null;
        if (item.name === 'droits') {
            const iconUrl = require('./images/star.svg');
            content = <ul style={{ height: '100%', marginTop: '-0.3rem' }}>
                {item.value.map((item, index) => {
                    return (<li key={index} className={styles.droits}>
                        <div>
                            <img src={iconUrl} alt='' /><h3>{item.droitTitle}</h3>
                        </div>
                        <p>{item.droitContent}</p>
                    </li>)
                })}
            </ul>;
        } else if (item.name === 'faqs') {
            content = <ul style={{ height: '100%', marginTop: '-0.3rem' }}>
                {item.value.map((item, index) => {
                    return (<li key={index} className={styles.faqs}>
                        <div>
                            <span className={styles.question}>Q</span>
                            <h3>{item.problem}</h3>
                        </div>
                        <div>
                            <span className={styles.answer}>A</span>
                            <h4>{item.answer}</h4>
                        </div>
                    </li>)
                })}
            </ul>
        } else if (item.name == 'flows') {
            content = <div style={{ height: '100%' }}>
                <ul>
                    {item.value.compensateFlowSteps.map((ele, index) => {
                        return (<li key={index} className={[styles.flows_step].join(' ')}>
                            {index !== 0 && <div className={styles.flows_trail_top} />}
                            {index < item.value.compensateFlowSteps.length - 1 &&
                                <div className={styles.flows_trail_bottom} />}
                            <div className={styles.flows_boll} />
                            <div className={[styles.flows, styles.flows_cont].join(' ')}>
                                <div
                                    className={styles.flows_title}>{`第${Utils.toChinesNum(index + 1)}步`}：{ele.title}</div>
                                <div className={styles.flows_content}>{ele.content}</div>
                            </div>
                        </li>)
                    })}
                </ul>
                <div className={[styles.flows, styles.flows_step].join(' ')} style={{ borderBottom: '0' }}>
                    <div className={styles.info} />
                    <div className={styles.flows_cont}>
                        <h3 className={styles.flows_title}>理赔须知</h3>
                        <div dangerouslySetInnerHTML={{ __html: item.value.claimsNoticeText }} />
                    </div>
                </div>
            </div>
        } else {
            content = <div className={styles.popContent} dangerouslySetInnerHTML={{ __html: item.value.richText }} />;
        }
        return content;
    }

    showPopUp = ({ title, content, url }) => {
        Modal.popup({
            title,
            content,
            url
        })
    };

    openOrderTrial = () => {
        this.props.confirm(true);
        this.props.openOrderTrial();
    };

    loadMoreProtectItem = () => {
        const { queryProduct } = this.state;
        this.setState({
            productProtectItems: queryProduct.productProtectItems
        });
    };

    // 更新算费因子默认值
    onClickRadioButton = (e, value, index, targetRestrictGene) => {
        e.preventDefault();
        const { updateRestrictGenes } = this.props;
        targetRestrictGene.defaultValue = value;
        updateRestrictGenes && updateRestrictGenes(targetRestrictGene, index);
    };

    render() {
        const { queryProduct, restrictGenes, id, quoteDom } = this.props;
        const { productProtectItems } = this.state;
        return (
            <section className={styles.ProContent}>
                <div>
                    <div className={styles.ProContent_header}>
                        <p>
                            保障方案
                            <Link to={`/productNew/protectItems?id=${id}&basicRestrictGene=${queryProduct.basicRestrictGene ? queryProduct.basicRestrictGene : ''}`} className={styles.header_more}>更多详情</Link>
                        </p>
                        {restrictGenes && this.handleBasicInsurance()}
                    </div>
                    <div className={styles.my_accordion}>
                        <div>
                            <Accordion>
                                {productProtectItems.length > 0 && productProtectItems.map((item) => (
                                    <div className={styles.productProtectItems}>{this.accordionTitle(item.name, item.basicValue, item)}</div>
                                ))}
                            </Accordion>
                        </div>
                        {queryProduct !== null && queryProduct.productProtectItems.length > 4 && productProtectItems.length === 4 && (
                            <div className={`${styles.accordionMore} flex-r-cc`} onClick={this.loadMoreProtectItem}>
                                <span>展开</span><img src={require('./images/open_icon.svg')} alt=''></img>
                            </div>
                        )}
                    </div>
                    <div className={styles.insured_container}>
                        <div className={styles.insured_wrapper}>
                            {quoteDom}
                            {!getFixValue('insurePremiumTrialHidden') && <button onClick={this.openOrderTrial}>保费试算</button>}
                        </div>
                        <div className={styles.services_wrapper}>
                            <p>更多详情，请阅读：
                                {queryProduct.files && queryProduct.files.map(item => <a href={item.value} target="_black">《{item.name && item.name.includes('.') ? item.name.substring(0, item.name.lastIndexOf(".")) : item.name}》</a>)}
                            </p>
                        </div>
                    </div>
                    <div className={styles.img}>
                        <p>
                            {queryProduct !== null && queryProduct.productReads.length > 0 && queryProduct.productReads.map((value, key) => (
                                <img key={key} src={value.filePath} alt="" />
                            ))}
                        </p>
                    </div>
                    {this.renderBottomDetails()}
                </div>
                <div className={styles.rights}>
                    <>
                        <p>本产品由{queryProduct.insuranceCompany.fullName}提供</p>
                        <p>{getSalesStatement().salesCompany}进行销售</p>
                    </>
                </div>
            </section>
        );
    }
}

export default ProContent;
