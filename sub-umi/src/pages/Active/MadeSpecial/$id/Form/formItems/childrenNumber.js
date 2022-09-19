import React, {Component} from 'react';
import {connect} from 'dva'
import {Icon} from 'antd-mobile';
import styles from "./index.scss";

@connect(({customized, loading}) => ({
    customized,
    loading: loading.models.customized,

}))
class ChildrenNum extends Component {
    state = {
        selectedNum: ""
    }

    componentDidMount(){
        const {customized:{childCount}} = this.props;
        if(childCount){
            this.setState({selectedNum:childCount})
        }
    }

    pre = () => {
        const {prePage} = this.props;
        if (prePage) prePage()

    }

    next = (num) => {
        const {nextPage} = this.props;
        if (nextPage) {
            nextPage()
        }
    }

    selectNum = (num) => {
        const {nextPage, dispatch} = this.props;
        if (nextPage) {
            nextPage()
        }
        dispatch({
            type:"customized/childCount",
            payload:num
        })
    }

    render() {
        const {selectedNum} = this.state;
        return (
            <div className={styles.contentBox}>
                <div className={styles.header}>
                    <h3>请问您有几个孩子？</h3>
                    <p>家有几口，保障不缺失</p>
                </div>
                <div className={styles.children}>
                    <div onClick={() => this.selectNum(1)} className={selectedNum == 1 ? styles.active : ""}>1个</div>
                    <div onClick={() => this.selectNum(2)} className={selectedNum == 2 ? styles.active : ""}>2个</div>
                    <div onClick={() => this.selectNum(3)} className={selectedNum == 3 ? styles.active : ""}>3个</div>
                </div>
                <div className={styles.footer}>
                    <button className={styles.back} onClick={this.pre}>返回</button>
                </div>
            </div>
        )
    }
}

export default ChildrenNum;
