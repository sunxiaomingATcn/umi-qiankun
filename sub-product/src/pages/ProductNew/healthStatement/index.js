/**
 * title: 健康告知
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './index.scss';
import { ActivityIndicator, Toast } from 'antd-mobile';
import { history } from 'umi';
import WxSDK from "@/utils/wx-sdk";
import utils from "@/utils/utils";
import iosnohistory from '@/utils/tool/iosnohistory';
import routerTrack from '@/components/routerTrack';


@routerTrack({ id: 'page20' })
@connect(({ healthNew, productNew, loading, insureNew }) => ({
    healthNew,
    productNew,
    insureNew,
    loading: loading.effects['productNew/queryQuoteDetail']
}))

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            healthStatement: null,
            data: null
        }
    }

    componentDidMount() {
        new WxSDK().hideAllNonBaseMenuItem();
        this.getQuote()
    }

    componentWillUnmount() {
    }

    getQuote = () => {
        const { quoteRecordId } = this.props.location.query;
        const { dispatch } = this.props;
        return dispatch({
            type: 'productNew/queryQuoteDetail',
            payload: {
                id: quoteRecordId
            }
        }).then(res => {
            if (res && res.code === 0) {
                this.setState({
                    data: res.payload.healthStatementContents[0],
                    healthStatement: res.payload.healthStatementContents
                });
            }
            return res;
        })
    }

    tracks(payload) {
        this.props.dispatch({
            type: "insuredNew/tracks",
            payload,
        })
    }

    checkHealthy = (key) => {
        const { data, healthStatement } = this.state;
        const { id, quoteRecordId, healthStatementUrl, ...rest } = this.props.location.query;

        if (key == 'next') {
            if (data.typeId == 1 && healthStatement.length > 1) {
                this.setState({
                    data: healthStatement[1]
                })
            } else {

                setTimeout(() => {
                    history.push({
                        pathname: '/ProductNew/insured',
                        query: { ...rest, id, quoteRecordId }
                    }
                    );
                }, 0)
            }
        } else {
            // 智能核保
            if (healthStatementUrl) {
                this.props.trackStop()
                    .then(() => {
                        window.location.href = healthStatementUrl;
                    })
                return;
            }
            Toast.info('不满足购买此产品要求，暂时无法购买', 2)
        }
    };

    render() {
        const { healthStatement, data } = this.state;
        return (
            <div className={styles.container_wrapper} id="roo1">
                <ActivityIndicator toast text="Loading..." size="large" animating={this.props.loading} />
                {healthStatement && healthStatement.length > 1 && <header
                    className={[styles.header, data.typeId != 1 ? styles.checked : ""].join(' ')}>
                    <div
                        className={[styles.header_title, data.typeId != 1 ? styles.checked : ""].join(' ')}>投保人健康告知
                    </div>
                    <div className={data.typeId != 1 ? styles.checked : ""}>被保人健康告知</div>
                </header>}
                <section className={styles.content}>
                    {healthStatement && <div className={styles.title}>
                        <div className={styles.tip}>重要</div>
                        <h3>为保证{data.typeId == 1 ? '投保人' : '被保险人'}的保险权益在理赔时不受影响，请确认{data.typeId == 1 ? '投保人' : '被保险人'}符合以下投保条件</h3>
                    </div>}
                    <div className={styles.content_questions}>
                        <ul>
                            {
                                data && data.content && <li key={data.id} className={styles.questions_item}>
                                    <p dangerouslySetInnerHTML={{ __html: data.content }}></p>
                                </li>
                            }
                        </ul>
                    </div>
                </section>
                <footer className={styles.footer} style={{ height: `${iosnohistory() ? 1.8 : 1.2}rem` }}>
                    <div className={styles.footerContainer}>
                        <div className={[styles.bottom_btn, styles.fail].join(' ')}>
                            <button onClick={this.checkHealthy}>
                                <img src={require('@/assets/icon/error.png')} alt='' />
                                <span>部分情况有</span>
                            </button>
                        </div>
                        <div className={[styles.bottom_btn].join(' ')}>
                            <button onClick={() => this.checkHealthy('next')}>
                                <img src={require('@/assets/icon/success.png')} alt='' />
                                <span>以上情况全无</span>
                            </button>
                        </div>
                    </div>
                </footer>
            </div>
        );
    }
}

export default Index;
