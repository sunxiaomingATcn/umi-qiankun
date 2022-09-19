import React, { Component, Fragment } from 'react';
import { connect } from 'dva'
import styles from "./index.scss";
import Utils from '@/utils/utils';

@connect(({ customized }) => ({
    customized,
}))
class FamilyComposition extends Component {
    state = {
        code_family_composition: null
    }

    componentDidMount() {
        const { customized: { gender, code_family_composition }, amount,  channel } = this.props;
        this.setState({ gender, code_family_composition })
        Utils.collectBaiduHm(`1v1_${amount}_${channel}_表单家庭成员`, "open")
    }

    selectFamilySituation = (code_family_composition) => {
        this.setState({ code_family_composition })
        this.next(code_family_composition)
    }

    pre = () => {
        const { prePage } = this.props;
        if (prePage) prePage()
    }

    next = (code_family_composition) => {
        const { nextPage, dispatch, customized: { code_hasChilds, gender } } = this.props;
        if (nextPage) {
            dispatch({
                type: "customized/familyComposition",
                payload: { familyComposition: code_family_composition, gender }
            })
            //有娃
            if (code_hasChilds.includes(code_family_composition)) {
                nextPage()
            } else {
                // 清除历史孩子数据
                // 数量
                dispatch({
                    type: "customized/childCount",
                    payload: null
                })
                // 性别
                dispatch({
                    type: 'customized/childGender',
                    payload: {
                        first: { name: 'firstGender', value: "" },
                        second: { name: 'secondGender', value: "" },
                        third: { name: 'thirdGender', value: "" }
                    }
                })
                // 生日
                dispatch({
                    type: 'customized/familyBirth',
                    payload: [
                        { name: 'firstBirthday', data: "" },
                        { name: 'secondBirthday', data: "" },
                        { name: 'thirdBirthday', data: "" }
                    ]
                })
                nextPage(6)
            }
        }
    }

    render() {
        const { code_family_composition, gender } = this.state;
        return (
            <div className={styles.contentBox}>
                <div className={styles.header}>
                    <h3>家里成员有哪些？</h3>
                    <p>家有几口，保障不缺失</p>
                </div>

                <ul className={styles.family}>
                    <li className={code_family_composition == 0 ? styles.active : ""}
                        onClick={() => this.selectFamilySituation(0)}>
                        <div className={styles.imageBox}><img
                            src={gender === 0 ? require('../images/singleMale.png') : require('../images/singleFemale.png')} />
                        </div>
                        <p>单身</p>
                    </li>
                    <li className={code_family_composition == 4 ? styles.active : ""}
                        onClick={() => this.selectFamilySituation(4)}>
                        <div className={styles.imageBox}>
                            <img
                                src={require('../images/noChild.png')} />
                        </div>
                        <p>已婚无娃</p>
                    </li>

                    <li className={code_family_composition == 1 ? styles.active : ""}
                        onClick={() => this.selectFamilySituation(1)}>
                        <div className={styles.imageBox}><img
                            src={gender === 0 ? require('../images/singleFather.png') : require('../images/singleMother.png')} />
                        </div>
                        <p>{gender === 0 ? '单亲爸爸' : '单亲妈妈'}</p>
                    </li>
                    <li className={code_family_composition == 5 ? styles.active : ""}
                        onClick={() => this.selectFamilySituation(5)}>
                        <div className={styles.imageBox}><img
                            src={require('../images/hasChild.png')} /></div>
                        <p>已婚有娃</p>
                    </li>
                </ul>

                <div className={styles.footer}>
                    <div className={styles.footer}>
                        <button className={styles.back} onClick={this.pre}>返回</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default FamilyComposition;
