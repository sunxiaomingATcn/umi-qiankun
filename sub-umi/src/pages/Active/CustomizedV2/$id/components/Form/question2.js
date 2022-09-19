import React, { Component } from 'react';
import { connect } from 'dva';
import styles from '../../css/question.less';

@connect(({ customizedV2 }) => ({
    customizedV2,
}))
class question2 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            options: [
                {
                    label: '本人',
                    src: require('../../images/oneself.png')
                },
                {
                    label: '配偶',
                    src: require('../../images/spouse.png')
                },
                {
                    label: '孩子',
                    src: require('../../images/child.png')
                },
                {
                    label: '全家',
                    src: require('../../images/family.png')
                },
            ],
            forWho: ''
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (JSON.stringify(nextProps.customizedV2) !== JSON.stringify(prevState.customizedV2)) {
            return {
                customizedV2: nextProps.customizedV2,
                forWho: nextProps.customizedV2.insuranceTarget
            }
        }
        return null;
    }

    selected = (i) => {
        const { nextQuestion } = this.props;
        this.setState({ forWho: i });
        const { dispatch } = this.props;
        dispatch({
            type: 'customizedV2/forWho',
            payload: i
        })
        nextQuestion()
    }

    render() {
        const { preQuestion } = this.props;
        const { forWho } = this.state;
        return (
            <div>
                <h3 className={styles.title}>2/4 为谁咨询保险问题？</h3>
                <p className={styles.describe}>为您精准匹配不同类型专业顾问</p>
                <ul className={styles.forWho}>
                    {this.state.options.map(i =>
                        <li
                            key={i.label}
                            className={forWho === i.label ? styles.selectedForWho : ""}
                            onClick={() => this.selected(i.label)}
                        >
                            <img src={i.src} />
                            <p>{i.label}</p>
                        </li>)}
                </ul>
                <div className={styles.preQuestion} onClick={() => { preQuestion() }}>
                    <img src={require('../../images/arrow-left.png')} />
                    <span>返回上一题</span>
                </div>
            </div>
        );
    }
}

export default question2;