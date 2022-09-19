import React, {Component} from 'react';
import {connect} from 'dva'
import {Icon} from 'antd-mobile'
import styles from "./index.scss";

@connect(({customized}) => ({
    customized,
}))
class ChildrenSex extends Component {
    state = {
        complete: false,
        childCount: "",
        firstGender: "",
        secondGender: "",
        thirdGender: "",
    }

    componentDidMount() {
        const {customized: {childCount, firstGender, secondGender, thirdGender}} = this.props;
        if (childCount) {
            this.setState({childCount, firstGender, secondGender, thirdGender}, _ => {
                this.sexComplete()
            })
        }

    }

    sexComplete = () => {
        const {childCount, firstGender, secondGender, thirdGender} = this.state;
        const childs = [firstGender, secondGender, thirdGender].splice(0, childCount);
        if (childs.every(i => i !== "")) {
            this.setState({complete: true})
        }
    }

    selectSex = (num, sex) => {

        let targetChildSex = null;
        switch (num) {
            case 1:
                targetChildSex = 'firstGender';
                break;
            case 2:
                targetChildSex = 'secondGender';
                break;
            case 3:
                targetChildSex = 'thirdGender';
                break;
        }

        this.setState({[targetChildSex]: sex}, _ => {
            this.sexComplete()
        })
    }

    pre = () => {
        const {prePage} = this.props;
        if (prePage) prePage()

    }

    next = () => {
        const {nextPage, dispatch} = this.props;
        if (nextPage) {
            nextPage()
        }
        // childGender
        const {childCount, firstGender, secondGender, thirdGender} = this.state;

        dispatch({
            type: 'customized/childGender',
            payload: {
                first: {
                    name: 'firstGender',
                    value: childCount >= 1 ? firstGender : ""
                },
                second: {
                    name: 'secondGender',
                    value: childCount >= 2 ? secondGender : ""
                },
                third: {
                    name: 'thirdGender',
                    value: childCount >= 3 ? thirdGender : ""
                }
            }
        })
    }

    render() {

        const {complete, childCount, firstGender, secondGender, thirdGender} = this.state;

        return (
            <div className={styles.contentBox}>
                <div className={styles.header}>
                    <h3>请问小孩的性别？</h3>
                    <p>家有几口，保障不缺失</p>
                </div>
                <ul className={styles.childsSex}>
                    <li className={styles.childsItem}>
                        <div className={styles.childsHeader}>
                            <img src={require('../images/first_child.png')}/> <span>大宝的性别</span>
                        </div>
                        <div className={styles.sexItem}>
                            <span className={firstGender === 0 ? styles.selected : ""}
                                  onClick={() => this.selectSex(1, 0)}>男孩</span>
                            <span className={firstGender === 1 ? styles.selected : ""}
                                  onClick={() => this.selectSex(1, 1)}>女孩</span>
                        </div>
                    </li>
                    {childCount > 1 ?
                        <li className={styles.childsItem}>
                            <div className={styles.childsHeader}>
                                <img src={require('../images/second_child.png')}/> <span>二宝的性别</span>
                            </div>
                            <div className={styles.sexItem}>
                                <span className={secondGender === 0 ? styles.selected : ""}
                                      onClick={() => this.selectSex(2, 0)}>男孩</span>
                                <span className={secondGender === 1 ? styles.selected : ""}
                                      onClick={() => this.selectSex(2, 1)}>女孩</span>
                            </div>
                        </li> : null}
                    {childCount > 2 ?
                        <li className={styles.childsItem}>
                            <div className={styles.childsHeader}>
                                <img src={require('../images/third_child.png')}/> <span>三宝的性别</span>
                            </div>

                            <div className={styles.sexItem}>
                            <span className={thirdGender === 0 ? styles.selected : ""}
                                  onClick={() => this.selectSex(3, 0)}>男孩</span>
                                <span className={thirdGender === 1 ? styles.selected : ""}
                                      onClick={() => this.selectSex(3, 1)}>女孩</span>
                            </div>
                        </li> : null}
                </ul>
                <div className={styles.footer}>
                    <button className={styles.back} onClick={this.pre}>返回</button>
                    {complete ?
                        <button className={styles.nextPage} onClick={this.next}><span>我选好了</span><Icon type="right"/>
                        </button> : null}
                </div>
            </div>
        )
    }
}

export default ChildrenSex;
