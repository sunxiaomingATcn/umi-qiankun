import React, { Component } from 'react';
import { connect } from 'dva';
import styles from '../../css/question.less';

@connect(({ customizedV2 }) => ({
    customizedV2,
}))
class question1 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: ''
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (JSON.stringify(nextProps.customizedV2) !== JSON.stringify(prevState.customizedV2)) {
            return {
                customizedV2: nextProps.customizedV2,
                name: nextProps.customizedV2.name
            }
        }
        return null;
    }

    next = () => {
        const { nextQuestion } = this.props;
        const { name } = this.state;
        const { dispatch } = this.props;
        dispatch({
            type: 'customizedV2/name',
            payload: name
        })
        nextQuestion()
    }

    onChange = (value) => {
        this.setState({ name: value })
    }

    handleBlur = (value) => {
        this.setState({
            nameValErr:!value
        })
    }

    render() {
        const { name, nameValErr } = this.state;

        return (
            <div>
                <h3 className={styles.title}>1/4 怎么称呼您？</h3>
                <p className={styles.describe}>便于沟通，提供服务</p>
                <div className={[nameValErr ? styles.errorInput : "", styles.nameInput].join(" ")}>
                    <input
                        placeholder="请输入姓名"
                        maxLength={30}
                        type="text"
                        value={name}
                        onChange={e => this.onChange(e.target.value)}
                        onBlur={e => this.handleBlur(e.target.value)}
                    />
                    {nameValErr && <p className={styles.error}><span>请输入姓名</span></p>}
                </div>
                {name && <div className={styles.complete} onClick={this.next}>
                    我填好了
                    <img src={require('../../images/arrow-right.png')} />
                </div>}
            </div>
        );
    }
}

export default question1;