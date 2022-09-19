import React, { Component } from 'react';
import { history } from 'umi';
import { DatePickerView, PickerView, Icon, Toast } from 'antd-mobile';
import { connect } from 'dva'
import styles from "./index.scss";
import tool from './tool.js'
import moment from 'moment';
import Utils from '@/utils/utils';

const { getDateString } = tool;

function sexCodeToStr(value) {
    return typeof (value) === "number" ? value ? "女" : "男" : "";
}

@connect(({ customizedV3, activeV3 }) => ({
    customizedV3,
    activeV3
}))

class CommunicationDate extends Component {
    state = {
        date: undefined,
        times: [],
        isWeekend: false,
        timesList: [],
        complete: false,
    }

    componentDidMount() {
        const { activeId, search, dispatch } = this.props;
        this.setState({ activeId, search })

        const { amount, channel } = this.props;
        Utils.collectBaiduHm(`1v1_v3.0_${amount}_${channel}_表单9-沟通时间`, "open")

        dispatch({ type: 'activeV3/queryCustomizationDate' }).then(() => {
            this.initTimesList()
        })
    }

    initTimesList = (date, cb) => {
        const { activeV3: { customizationDate = {} } } = this.props;
        let defaultDay = date;
        // 初始化
        if (!date) {
            Object.keys(customizationDate.rangeDate).forEach(d => {
                const t = customizationDate.rangeDate[d].rangeTime.find(i => i.isDefault)
                if (t) {
                    defaultDay = new Date(d);
                    this.setState({ times: t.status === "1" ? [false] : [t.label] })
                    return;
                }
            })
        }

        const curDay = (moment(defaultDay).format("YYYY-MM-DD"));
        const curRangeDate = customizationDate.rangeDate[curDay];
        let rangeTime = curRangeDate ? curRangeDate.rangeTime.map(item => {
            return { ...item, value: item.label, label: item.label + (item.status === "1" ? "(已约满)" : "") }
        }) : []
        // 当前日期已约满
        if (curRangeDate && curRangeDate.status == 1) {
            rangeTime = []
        }
        this.setState({
            date: defaultDay,
            timesList: rangeTime
        }, () => {
            this.completeStatus()
            cb && cb()
        })
    }

    /**
     * 时间可选择判断
    */
    timeSelectable = () => {
        const { timesList, times = [] } = this.state;
        const t = timesList.find(i => i.value == times && times[0]);
        const i = timesList.findIndex(i => i.value == times && times[0]);
        let tar_time = times[0];
        if (!t) {
            // 当且日期该时间段已不在时间范围 => 滚动到时间范围第一个时间段
            tar_time = timesList[0] ? timesList[0].value : false;
        } else if (t.status == 1) {
            // 当前日期所有时间段都已约满 => false
            const allStatus = timesList.reduce((t1, t2) => t1 * t2.status, 1)
            if (allStatus) {
                tar_time = false;
            } else {
                // 当前日期该时间段已约满 => 滚动到下一个可选时间段
                let nextTimeIndex = timesList.findIndex((t, ind) => t.status == "0" && ind > i);
                nextTimeIndex = nextTimeIndex ? nextTimeIndex : timesList.findIndex((t) => t.status == "0");
                tar_time = nextTimeIndex > -1 ? timesList[nextTimeIndex].value : false;
            }
        }

        this.setState({
            times: [tar_time]
        }, () => {
            this.completeStatus()
        })
    }

    changeDate = (date) => {
        this.initTimesList(date, () => {
            this.timeSelectable()
        })
    }

    timesChange = (times) => {
        this.setState({ times }, () => {
            this.timeSelectable()
        })
    }

    completeStatus = () => {
        if (this.state.times && this.state.times[0] && this.state.date && this.state.timesList.length) {
            this.setState({ complete: true })
        } else {
            this.setState({ complete: false })
        }
    }

    getFormatValue = () => {
        const { customizedV3 } = this.props;
        let targetKeys = Object.keys(customizedV3).filter(i => !i.includes("_"))
        targetKeys = targetKeys.reduce((pre, next) => {
            return {
                ...pre,
                [next]: next.toLocaleLowerCase().includes("gender") ? sexCodeToStr(customizedV3[next]) : customizedV3[next]
            }
        }, {})
        const { childCount, socialInsurance } = targetKeys;
        const { times, date } = this.state;

        return {
            ...targetKeys,
            communicationDate: getDateString(date),
            communicationTimeRange: times[0],
            childCount: !childCount ? "" : childCount + "个",
            socialInsurance: typeof (socialInsurance) === "number" ? !socialInsurance ? "有" : "无" : ""
        }
    }

    pre = () => {
        const { prePage } = this.props;
        if (prePage) prePage()

    }

    next = () => {
        const { dispatch, activeLink, channel } = this.props;

        //提交表单
        const targetKeys = this.getFormatValue()
        Toast.loading('Loading...', 0)
        const crmUserKey = this.props.location.query.crmUserKey;
        const type = Utils.isWeiXin() ? 'activeV3/submitCustomized' : 'activeV3/submitUnWcCustomized';

        // return;
        dispatch({
            type,
            payload: { ...targetKeys, channel, sourceUrl: window.location.href }
        }).then(res => {
            if (res && res.code == 0) {
                this.props.setUserStatus(2,true,1)
                Toast.hide()
            } else {
                if (res && res.message) {
                    Toast.info(res.message)
                } else {
                    Toast.info("网络问题，定制失败，请重试。")
                }
            }
        })
    }

    render() {
        const { timesList, complete } = this.state;
        const { activeV3: { customizationDate = {} } } = this.props;
        return (
            <div className={styles.commitBox}>
                <div className={styles.commitHeader}>
                    <h3>最后一步：<br />您方便与顾问沟通的时间？</h3>
                    <p>约定时间，方便沟通</p>
                </div>

                <div className={styles.commitTimesBox}>
                    <div className={styles.date}>
                        <DatePickerView
                            mode="date"
                            value={this.state.date}
                            minDate={new Date(customizationDate.minDate)}
                            maxDate={new Date(customizationDate.maxDate)}
                            onChange={date => this.changeDate(date)}
                        />
                    </div>
                    <div className={styles.time}>
                        {!timesList.length ?
                            <p className={styles.nodata}>已约满</p> : <PickerView
                                data={timesList}
                                cascade={false}
                                value={this.state.times}
                                onChange={times => this.timesChange(times)}
                            />}

                    </div>

                    <div className={styles.footer}>
                        <button className={styles.back} onClick={this.pre}>返回上一题</button>
                        {complete ?
                            <button className={styles.nextPage} onClick={this.next}>
                                <span>我选好了</span>
                                <Icon type="right" /></button> : null}
                    </div>
                </div>
            </div>
        )
    }
}

export default CommunicationDate;
