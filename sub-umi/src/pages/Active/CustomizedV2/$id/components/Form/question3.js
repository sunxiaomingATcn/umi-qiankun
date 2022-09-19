import React, { Component } from 'react';
import { connect } from 'dva';
import styles from '../../css/question.less';
@connect(({ customizedV2 }) => ({
    customizedV2,
}))
class question3 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            options: [
                { label: '重疾+医疗' },
                { label: '财富规划' },
                { label: '全面配置' },
            ],
            selectedIndex: null
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (JSON.stringify(nextProps.customizedV2) !== JSON.stringify(prevState.customizedV2)) {
            return {
                customizedV2:nextProps.customizedV2,
                selectedIndex: nextProps.customizedV2.buyWhat
            }
        }
        return null;
    }

    selected = (i) => {
        const { nextQuestion } = this.props;
        this.setState({ selectedIndex: i });
        const { dispatch } = this.props;
        dispatch({
            type: 'customizedV2/buyWhat',
            payload: i
        })
        nextQuestion()
    }

    render() {
        const { preQuestion } = this.props;
        const { selectedIndex } = this.state;

        return (
            <div>
                <h3 className={styles.title}>3/4 考虑哪些险种？</h3>
                <p className={styles.describe}>为您精准匹配不同类型专业顾问</p>
                <ul className={styles.choices}>
                    {this.state.options.map(i => (<li key={i.label} className={selectedIndex === i.label ? styles.selectedOption : ""} onClick={() => this.selected(i.label)}>{i.label}</li>))}
                </ul>
                <div className={styles.preQuestion} onClick={() => { preQuestion() }}>
                    <img src={require('../../images/arrow-left.png')} />
                    <span>返回上一题</span>
                </div>
            </div>
        );
    }
}

export default question3;