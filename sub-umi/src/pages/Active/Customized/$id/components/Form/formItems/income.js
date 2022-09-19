import React, {Component} from 'react';
import {PickerView, Icon} from 'antd-mobile';
import {connect} from 'dva'
import styles from './index.scss'
import Utils from '@/utils/utils';

const incomeList = [
    {value: '10万元以下', label: "10万元以下"},
    {value: '10-20/万元', label: "10-20/万元"},
    {value: '20-30/万元', label: "20-30/万元"},
    {value: '30-50/万元', label: "30-50/万元"},
    {value: '50万元以上', label: "50万元以上"},
]

@connect(({customizedV3}) => ({
    customizedV3,
}))
class Income extends Component {
    state = {}

    componentDidMount() {
        const {customizedV3: {income}} = this.props;
        this.setState({income:[income]})
        const { amount, channel } = this.props;
        Utils.collectBaiduHm(`1v1_v3.0_${amount}_${channel}_表单6-收入-本人`, "open")
    }

    incomeChange = (income) => {
        this.setState({income})
    }

    pre = () => {
        const {prePage} = this.props;
        if (prePage) prePage()
    }

    next = () => {
        const {nextPage, dispatch} = this.props;
        if (nextPage) {
            if(this.props.customizedV3.spouseflag){
                nextPage()
            }else{
                nextPage(9)
            }
            dispatch({
                type: "customizedV3/income",
                payload: this.state.income[0]
            })
        }
    }

    render() {
        const {income} = this.state;
        return (
            <div className={styles.contentBox}>
                <div className={styles.header}>
                    <h3>您的税前年收入？</h3>
                    <p>量入为出，合理定预算</p>
                </div>
                <div className={styles.ruleheight}>
                    <PickerView
                        data={incomeList}
                        cols={1}
                        value={this.state.income}
                        onChange={income => this.incomeChange(income)}
                    />
                </div>
                <div className={styles.footer}>
                    <button className={styles.back} onClick={this.pre}>返回上一题</button>
                    {income ? <button className={styles.nextPage} onClick={this.next}><span>我选好了</span><Icon type="right" /></button> : null}

                </div>

            </div>

        )
    }
}

export default Income;
