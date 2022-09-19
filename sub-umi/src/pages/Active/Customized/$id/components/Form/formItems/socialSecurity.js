import React, {Component} from 'react';
import {connect} from 'dva'
import styles from './index.scss'
import Utils from '@/utils/utils';

@connect(({customizedV3}) => ({
    customizedV3,
}))
class SocialInsurance extends Component {
    state = {
        socialInsurance: ""
    }

    componentDidMount() {
        const {customizedV3: {socialInsurance}} = this.props;
        this.setState({socialInsurance})
        const { amount, channel } = this.props;
        Utils.collectBaiduHm(`1v1_v3.0_${amount}_${channel}_表单社保`, "open")
    }

    select = (socialInsurance) => {
        this.setState({socialInsurance})
        this.next(socialInsurance)
    }

    pre = () => {
        const {prePage} = this.props;
        if (prePage) prePage()
    }

    next = (socialInsurance) => {
        const {nextPage, dispatch} = this.props;
        if (nextPage) {
            nextPage()
            dispatch({
                type: 'customizedV3/socialInsurance',
                payload: socialInsurance
            })
        }
    }

    render() {
        const {socialInsurance} = this.state;
        return (
            <div className={styles.contentBox}>
                <div className={styles.header}>
                    <h3>您有没有社保？</h3>
                    <p>社保有无，费用大不同</p>
                </div>
                <div>
                    <div className={styles.socialSecurityBox}>
                        <div className={styles.socialSecurityHeader}>
                            <img src={require('../images/my.png')}/>
                            <span>本人</span>
                        </div>
                        <div className={styles.item}>
                            <span className={socialInsurance === 0 ? styles.selected : ""}
                                  onClick={() => this.select(0)}>有</span>
                            <span className={socialInsurance === 1 ? styles.selected : ""}
                                  onClick={() => this.select(1)}>无</span>
                        </div>

                    </div>
                </div>
                <div className={styles.footer}>
                    <button className={styles.back} onClick={this.pre}>返回上一题</button>
                </div>
            </div>
        )
    }
}

export default SocialInsurance;

