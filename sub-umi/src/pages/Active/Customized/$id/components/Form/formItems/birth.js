import React, { Component } from 'react';
import { Tabs, DatePickerView, Icon } from 'antd-mobile'
import { connect } from 'dva'
import styles from './index.scss'
import tool from './tool.js'
import Utils from '@/utils/utils';

const { getDateString } = tool;

const minDate = new Date('1919-01-01')
const maxDate = new Date()
const defaultAdultDate = new Date();
defaultAdultDate.setFullYear(defaultAdultDate.getFullYear() - 25);
const defaultChildDate = new Date();
defaultChildDate.setFullYear(defaultChildDate.getFullYear() - 1);
const defaultParentsDate = new Date();
defaultParentsDate.setFullYear(defaultParentsDate.getFullYear() - 50);

@connect(({ customizedV3 }) => ({
    customizedV3,
}))
class Birth extends Component {
    state = {
        tabsPage: 0,
        tabs: [],
        skip: false,
        birthday_date: null,
        spouseBirthday_date: null,
        firstBirthday_date: null,
        secondBirthday_date: null,
        thirdBirthday_date: null,
        motherBirthday_date: null,
        fatherBirthday_date: null,
    }

    componentDidMount() {
        const { customizedV3: { birthday, spouseBirthday, firstBirthday, secondBirthday, thirdBirthday, fatherBirthday, motherBirthday }
        } = this.props;
        const { amount, channel } = this.props;
        Utils.collectBaiduHm(`1v1_v3.0_${amount}_${channel}_表单5-生日`, "open")
        this.setState({
            birthday_date: birthday ? new Date(birthday) : defaultAdultDate,
            spouseBirthday_date: spouseBirthday ? new Date(spouseBirthday) : defaultAdultDate,
            firstBirthday_date: firstBirthday ? new Date(firstBirthday) : defaultChildDate,
            secondBirthday_date: secondBirthday ? new Date(secondBirthday) : defaultChildDate,
            thirdBirthday_date: thirdBirthday ? new Date(thirdBirthday) : defaultChildDate,
            fatherBirthday_date: fatherBirthday ? new Date(fatherBirthday) : defaultParentsDate,
            motherBirthday_date: motherBirthday ? new Date(motherBirthday) : defaultParentsDate
        }, _ => {
            this.initTabs()
        })
    }

    initTabs = () => {
        const { customizedV3: { childCount }, customizedV3 } = this.props;
        let tabs = [{ value: '本人', name: 'birthday' }];
        const spouse = { value: '配偶', name: 'spouseBirthday' };
        const childs = [{ value: '大宝', name: 'firstBirthday' }, { value: '二宝', name: 'secondBirthday' }, { value: '三宝', name: 'thirdBirthday' }];
        const mother = { name: "motherBirthday", value: "母亲" + (customizedV3.motherBirthday ? "" : customizedV3.birthday ? "(已跳过)" : "(可选)") }
        const father = { name: "fatherBirthday", value: "父亲" + (customizedV3.fatherBirthday ? "" : customizedV3.birthday ? "(已跳过)" : "(可选)") }
        if (!this.singleFamily()) {
            tabs.push(spouse)
        }
        if (childCount) {
            tabs = tabs.concat(childs.splice(0, childCount))
        }
        tabs = tabs.concat(father, mother);

        tabs = tabs.map(i => {
            return { ...i, select: !!customizedV3[i.name] }
        })

        this.setState({ tabs }, () => {
            this.selectedBirth()
        })
    }

    /**
     * 已选择icon
    */
    selectedBirth = () => {
        const { tabs } = this.state;
        const curTabs = tabs.map(item => {
            return {
                ...item,
                title: <span className={item.select ? "tabsHeader" : ""}>{item.value}</span>,
            }
        })
        this.setState({ tabs: curTabs })
    }

    singleFamily = () => {
        //单(身)亲、非单(身)亲
        const { customizedV3: { code_family_composition: familyComposition, code_singleFamily } } = this.props;
        return code_singleFamily.includes(familyComposition)
    }

    changeDate = (date, key) => {
        this.setState({ [key + "_date"]: date })
    }

    isSkip = () => {
        return Promise.resolve().then(() => {
            const { tabsPage, tabs } = this.state;
            // 父母非必填
            const isParents = tabsPage >= tabs.length - 2 && tabsPage <= tabs.length - 1;
            this.setState({ skip: !!isParents })
        })
    }

    prePerson = () => {
        const { tabsPage } = this.state;

        if (tabsPage === 0) {
            this.pre()
            return;
        }else{
            this.isSkip();
        }
        this.setState({ tabsPage: tabsPage - 1 })
    }

    nextPerson = () => {
        const { tabsPage, tabs } = this.state;

        tabs[tabsPage].value = tabs[tabsPage].value.replace("(可选)", "").replace("(已跳过)", "")
        this.isSkip()

        tabs[tabsPage].select = true;
        this.setState({
            tabs,
            tabsPage: tabsPage + !!(tabsPage < tabs.length - 1),
        }, _ => {
            if (tabsPage >= tabs.length - 1) {
                this.next()
            }
            this.selectedBirth()
        })
    }

    skipPerson = () => {
        const { tabsPage, tabs } = this.state;
        tabs[tabsPage].value = tabs[tabsPage].value.replace("(可选)", "").replace("(已跳过)", "") + "(已跳过)";
        tabs[tabsPage].select = false;
        this.setState({
            tabs,
            tabsPage: tabsPage + !!(tabsPage < tabs.length - 1),
        }, _ => {
            if (tabsPage >= tabs.length - 1) {
                this.next()
            }
            this.selectedBirth()
        })
    }

    pre = () => {
        const { prePage, customizedV3: { code_family_composition, code_hasChilds } } = this.props;
        if (prePage) {
            prePage()
            //单身
            if (code_hasChilds.includes(code_family_composition)) {
                prePage()
            } else {
                prePage(3)
            }
        }
    }

    next = () => {
        const { nextPage, dispatch, customizedV3: { childCount } } = this.props;
        const { birthday_date, spouseBirthday_date, firstBirthday_date, secondBirthday_date, thirdBirthday_date, fatherBirthday_date, motherBirthday_date, tabs, } = this.state;

        if (nextPage) {
            nextPage()
            dispatch({
                type: 'customizedV3/familyBirth',
                payload: [
                    { name: 'birthday', data: getDateString(birthday_date) },
                    { name: 'spouseBirthday', data: this.singleFamily() ? "" : getDateString(spouseBirthday_date) },
                    { name: 'firstBirthday', data: childCount >= 1 ? getDateString(firstBirthday_date) : "" },
                    { name: 'secondBirthday', data: childCount >= 2 ? getDateString(secondBirthday_date) : "" },
                    { name: 'thirdBirthday', data: childCount >= 3 ? getDateString(thirdBirthday_date) : "" },
                    { name: 'fatherBirthday', data: (tabs.find(i => i.name == "fatherBirthday") || {}).select ? getDateString(fatherBirthday_date) : "" },
                    { name: 'motherBirthday', data: (tabs.find(i => i.name == "motherBirthday") || {}).select ? getDateString(motherBirthday_date) : "" }
                ]
            })
        }
    }

    render() {
        const { tabs, skip } = this.state;
        return (
            <div className={styles.birthBox}>
                <div className={styles.header}>
                    <h3>家人生日是什么时候？</h3>
                    <p>记录生日，精确计算费用</p>
                </div>
                <div className={styles.paddingT5}>
                    <Tabs
                        renderTabBar={props => <Tabs.DefaultTabBar {...props} page={4} />}
                        tabs={tabs}
                        swipeable={false}
                        page={this.state.tabsPage}
                    >
                        {tabs.map(item => {
                            return (<div
                                key={item.name}
                                className={styles.datePickerBox}
                            >
                                <DatePickerView
                                    mode="date"
                                    minDate={minDate}
                                    maxDate={maxDate}
                                    value={this.state[item.name + "_date"]}
                                    onChange={date => this.changeDate(date, item.name)}
                                />
                            </div>)
                        })}
                    </Tabs>
                </div>
                <div className={styles.footer}>
                    <button className={styles.back} onClick={() => this.prePerson()}>返回上一题</button>
                    <button className={styles.nextPage} onClick={() => this.nextPerson()}>
                        <span>我选好了</span>
                        <Icon type="right" />
                    </button>
                    {skip && <button className={styles.skip} onClick={() => this.skipPerson()}>
                        <span>跳过</span>
                    </button>}
                </div>
            </div>
        )
    }
}

export default Birth;
