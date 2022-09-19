/**
 * title: 家庭保障规划
 */
/**
 * 需求背景 https://www.chechegroup.com/ 进行ICP备案，需要有交易流程，故此提供特别版（只有付费定制）
 * 家庭定制活动 =>
 * 微信 => 使用组件 AbaoUser（微信授权）
 * 非微信 => 使用组件 UnAbaoUser（不生成用户）
*/
import React, { Component } from 'react';
import styles from './index.scss';
import Utils from '@/utils/utils';
import AbaoUser from './abaoAser';
import UnAbaoUser from './unAbaoUser';

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        return (
            <div className={styles.container}>
                {Utils.isWeiXin() ? <AbaoUser {...this.props} /> : <UnAbaoUser {...this.props} />}
            </div>
        );
    }
}

export default Index;
