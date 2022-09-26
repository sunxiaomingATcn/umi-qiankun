/**
 * title:
 */
import React, { Component, Fragment } from 'react';
import styles from './trail.scss';
import { connect } from "dva";
import { history } from 'umi';
import { Toast } from 'antd-mobile';
import Modal from "@/components/modal";
import iosnohistory from '@/utils/tool/iosnohistory';
@connect(({ healthNew, productNew, common, loading, insureNew }) => ({
    healthNew,
    productNew,
    common,
    insureNew
}))

class Trail extends Component {
    constructor(props) {
        super(props);
    }

    closeOrderTrial = () => {
        this.props.closeOrderTrial();
    };

    tracks(payload) {
        this.props.dispatch({
            type: "insuredNew/tracks",
            payload,
        })
    }

    render() {
        const { title, children, quoteDisabled, quoteDom, next } = this.props;
        return (

            <div className={`${styles.modal_container}`}>
                <div className={styles.modal_popup_body}>
                    <div className={styles.modal_popup_title}>
                        <div className={styles.modal_popup_title_content}>{title}</div>
                        <span onClick={this.closeOrderTrial} />
                    </div>
                    <div className={styles.modal_content} style={{ height: `calc(100% - ${iosnohistory() ? 2.9 : 2.2}rem)` }}>{children}</div>
                    <footer className={[styles.footer].join(' ')} style={{ height: `${iosnohistory() ? 1.8 : 1.2}rem` }}>
                        <div className={styles.footerContent}>
                            {quoteDom}
                            <div className={[styles.btn_flex].join(' ')}>
                                <button
                                    className={quoteDisabled ? 'disabled-btn-primary' : 'btn-primary'}
                                    disabled={quoteDisabled}
                                    onClick={next}
                                >
                                    立即投保
                                </button>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        );
    }
}

export default Trail;
