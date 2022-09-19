/**
 * title: 保险百科
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'dva';
import styles from './assets/css/index.scss';
import { Tabs, Toast, PullToRefresh } from 'antd-mobile';
import { createForm, formShape } from 'rc-form';
import { history } from 'umi';
import Modal from '@/components/modal';

@connect(({ InsuranceEncyclopedia }) => ({
    InsuranceEncyclopedia,
}))
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        const {
            location: { query },
        } = this.props;
        localStorage.setItem('bxbkKey', query && query.key);
        this.queryDetail({ id: query && query.id });
    }

    queryDetail(params = {}) {
        const { dispatch } = this.props;
        dispatch({
            type: 'InsuranceEncyclopedia/queryDetail',
            payload: {
                ...params,
            },
        }).then(res => {
            if (res && res.code == 200) {
                this.setState({ detail: res.data });
            }
        });
    }

    lookMore() {
        history.push({ pathname: '/InsuranceEncyclopedia' });
    }
    render() {
        const { detail } = this.state;
        return (
            <div className={styles.insuranceEncyclopedia}>
                <div className={styles.detail}>
                    <div className={styles.title}>{detail && detail.title}</div>
                    <div className={styles.info}>
                        <div className={styles.author}>{detail && detail.author}</div>
                        <div className={styles.time}>{detail && detail.releaseTime}</div>
                    </div>
                    <div
                        className={styles.content}
                        dangerouslySetInnerHTML={{
                            __html: detail && detail.content,
                        }}
                    ></div>
                    <div
                        className={styles.more}
                        onClick={() => {
                            this.lookMore();
                        }}
                    >
                        查看知识库更多内容
                    </div>
                </div>
            </div>
        );
    }
}

export default Index;
