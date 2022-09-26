/**
 * title:
 */
import React, { Component } from 'react';
import styles from './ProHeader.scss';
import Swiper from 'swiper/dist/js/swiper.js';
import { getFixValue } from './assets/productConfig/judgeProductFeature';

class ProHeader extends Component {
    componentDidMount() {
        new Swiper('.swiper-container', {
            slidesPerView: 'auto',
            // centeredSlides: true,
            observer: true,//修改swiper自己或子元素时，自动初始化swiper
            observeParents: true,//修改swiper的父元素时，自动初始化swiper
        });
    }

    handleAge = () => {
        //被保人年龄固定id为10
        const { queryProduct } = this.props;
        let title = '';
        if (queryProduct !== null && queryProduct.clauses && queryProduct.clauses.length > 0) {
            const data = queryProduct.clauses.find(item => item.main).restrictGenes.find((item) => item.dataDictionary.id === 10);
            if (data) {
                let minTag = data.interval.minIsClosed ? '(含)' : '(不含)';
                let maxTag = data.interval.maxIsClosed ? '(含)' : '(不含)';
                title = `${data.interval.min}${data.interval.minUnit !== null ? data.interval.minUnit.name + minTag : ''} - ${data.interval.max}${data.interval.maxUnit !== null ? data.interval.maxUnit.name + maxTag : ''}`;
            }
        }
        return title;

    };

    handleProtect = () => {
        const { queryProduct } = this.props;
        if (queryProduct !== null && queryProduct.clauses && queryProduct.clauses.length > 0) {
            const data = queryProduct.clauses.find(item => item.main).restrictGenes.find((item) => item.dataDictionary.id === 3);
            if (data) {
                return data.options.join('/')
            }
        }
    };

    // banner下title下的描述
    renderDescribe = () => {
        const defaultDescribe = [{ name: '投保年龄', value: this.handleAge() }, { name: '保障期间', value: this.handleProtect() }];
        const additionalDescribe = getFixValue('additionalDescribe') || [];
        return [...defaultDescribe, ...additionalDescribe].filter(item => item.value)
    }

    render() {
        const { queryProduct } = this.props;
        let insuranceCompany = null;
        if (queryProduct !== null) {
            insuranceCompany = queryProduct.insuranceCompany;
        }

        return (
            <header>
                {queryProduct && queryProduct.bannerImage && <div className={styles.banner}>
                    <img src={queryProduct.bannerImage} />
                </div>}
                <section className={styles.title}>
                    <div>
                        <h2 className='flex-r-bc'>
                            <span
                                className={styles.title_header}>{queryProduct !== null && queryProduct.saleName}</span>
                            <img src={insuranceCompany !== null && insuranceCompany.logo} alt=''></img>
                        </h2>
                        {this.renderDescribe().map(item => <h3 style={{ display: 'flex' }}><div style={{ width: '1.1rem', textAlign: 'justify', textAlignLast: 'justify' }}>{item.name}</div>：<div style={{ flex: 1 }}>{item.value}</div></h3>)}
                    </div>
                </section>
                <div className={styles.desc} style={{ borderWidth: queryProduct !== null && queryProduct.features.length > 0 ? 1 : 0 }}>
                    <div className="swiper-container">
                        <div className="swiper-wrapper">
                            {queryProduct !== null && queryProduct.features.length > 0 && queryProduct.features.map(item => (
                                <i key={item.id} className='swiper-slide'>{item.name}</i>
                            ))}

                        </div>
                    </div>
                </div>
            </header>
        );
    }
}

export default ProHeader;
