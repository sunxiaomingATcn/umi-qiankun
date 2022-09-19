import React, { Component } from 'react';
import { connect } from 'dva'
import styles from "./index.scss";
import Utils from '@/utils/utils';

@connect(({ customizedV3 }) => ({
    customizedV3,
}))
class Sex extends Component {
    state = {
        gender: ""
    }

    componentDidMount() {
        const { customizedV3: { gender } } = this.props;
        this.setState({ gender })

        const { amount, channel } = this.props;
        Utils.collectBaiduHm(`1v1_v3.0_${amount}_${channel}_表单2-性别`, "open")
    }

    selectGender = (gender) => {
        this.setState({ gender })
        this.next(gender)
    }

    pre = () => {
        const { prePage } = this.props;
        if (prePage) prePage()
    }

    next = (gender) => {
        const { nextPage, dispatch } = this.props;
        if (nextPage) nextPage()

        dispatch({
            type: "customizedV3/gender",
            payload: gender
        })

    }


    render() {
        const { gender } = this.state;
        return (
            <div className={styles.contentBox}>
                <div className={styles.header}>
                    <h3>您的性别是？</h3>
                    <p>男女有别，保障不同</p>
                </div>
                <ul className={styles.sexBox}>
                    <li className={gender === 0 ? styles.active : ""} onClick={() => this.selectGender(0)}>
                        <div className={styles.imageBox}>
                            <img src={require('../images/male.png')} />
                        </div>
                        <p>男士</p>
                    </li>
                    <li className={gender === 1 ? styles.active : ""} onClick={() => this.selectGender(1)}>
                        <div className={styles.imageBox}>
                            <img src={require('../images/female.png')} />
                        </div>
                        <p>女士</p>
                    </li>
                </ul>
                <div className={styles.footer}>
                    <div className={styles.footer}>
                        <button className={styles.back} onClick={this.pre}>返回上一题</button>
                    </div>
                </div>
            </div>


        )
    }
}

export default Sex;
