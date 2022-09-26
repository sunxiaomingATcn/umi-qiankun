/**
 * title:
 */
import React, { Component } from 'react';
import styles from './Footer.scss';
import { getFixValue, isHasAbaoService } from './assets/productConfig/judgeProductFeature';
import Utils from '@/utils/utils';
import iosnohistory from '@/utils/tool/iosnohistory';


class Footer extends Component {

    callService = () => {
        window.location.href = 'https://www.sobot.com/chat/pc/index.html?sysNum=b281423fdaa9428c9565c9026ae74bfa&groupId=7d967d36c0e94c8a8b484467809e36e8';
    };

    openOrderTrial = () => {
        const { confirm, next } = this.props;
        // 如果按产品写死 insurePremiumTrialHidden===true 不弹算费弹窗，直接下一页面
        if (getFixValue('insurePremiumTrialHidden')) {
            next && next({ unQuote: true });
            return;
        }
        confirm && confirm(true);
        this.props.openOrderTrial();
    };

    render() {
        const { quoteDom } = this.props;
        return (
            <footer className={`${styles.footer}`} style={{ height: iosnohistory() ? '1.8rem' : '1.2rem' }}>
                <div className={[styles.footerContent, isHasAbaoService() ? '' : styles.noHasAbaoService].join(' ')}>
                    {isHasAbaoService() &&
                        <button className={[styles.btn_flex, styles.service].join(' ')} onClick={this.callService}>
                            <img src={require('@/assets/icon/service.svg')} alt='' />
                            <span>在线客服</span>
                        </button>}
                    <div className={[styles.btn_flex, styles.insured_amount].join(' ')}>
                        {quoteDom}
                    </div>
                    <div className={[styles.btn_flex, styles.btn_insure].join(' ')}>
                        <button onClick={this.openOrderTrial}>立即投保</button>
                    </div>
                </div>
            </footer>
        );
    }
}

export default Footer;
