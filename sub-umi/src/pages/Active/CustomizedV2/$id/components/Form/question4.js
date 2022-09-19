import React, { Component, Fragment } from 'react';
import { DatePickerView, PickerView, Icon, Toast } from 'antd-mobile';
import { connect } from 'dva'
import styles from '../../css/question.less';
import tool from './tool.js'
import moment from 'moment';

const { getDateString } = tool;

@connect(({ customizedV2, loading }) => ({
    customizedV2,
    loading: loading.effects["customizedV2/queryCustomizationDate"]
}))

class CommunicationDate extends Component {
    state = {
        date: undefined,
        times: [],
        isWeekend: false,
        timesList: [],
        complete: false,
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (JSON.stringify(nextProps.customizedV2) !== JSON.stringify(prevState.customizedV2)) {
            return {
                customizedV2: nextProps.customizedV2,
                defaultDate: nextProps.customizedV2.communicationDate
            }
        }
        return null;
    }

    componentDidMount() {
        const { activeId, search, dispatch } = this.props;
        this.setState({ activeId, search })
        dispatch({ type: 'customizedV2/queryCustomizationDate' }).then(() => {
            this.initTimesList()
        })
    }

    initTimesList = (date, cb) => {
        const { customizedV2: { customizationDate = {} } } = this.props;
        const { defaultDate } = this.state;
        // 是否回显缓存选中日期时间
        const isCacheSelectedDate = !date && defaultDate && customizationDate.rangeDate[moment(defaultDate.date).format("YYYY-MM-DD")];
        let defaultDay = date;
        // 初始化
        if (!date) {
            if (isCacheSelectedDate) {
                // 回显缓存选中日期
                defaultDay = defaultDate.date;
            } else {
                Object.keys(customizationDate.rangeDate).forEach(d => {
                    const t = customizationDate.rangeDate[d].rangeTime.find(i => i.isDefault)
                    if (t) {
                        defaultDay = new Date(d);
                        this.setState({ times: t.status === "1" ? [false] : [t.label] })
                        return;
                    }
                })
            }
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
            // 回显缓存选中时间
            if (isCacheSelectedDate) {
                this.timesChange(defaultDate.times)
            } else {
                this.completeStatus()
            }
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
        this.scrollBottom()
    }

    timesChange = (times) => {
        this.setState({ times }, () => {
            this.timeSelectable()
        })
        this.scrollBottom()
    }

    completeStatus = () => {
        if (this.state.times && this.state.times[0] && this.state.date && this.state.timesList.length) {
            this.setState({ complete: true })
        } else {
            this.setState({ complete: false })
        }
    }

    getFormatValue = () => {
        const { times, date } = this.state;

        return {
            communicationDate: getDateString(date),
            communicationTimeRange: times[0],
        }
    }

    pre = () => {
        const { preQuestion, dispatch } = this.props;
        const { times, date } = this.state;

        dispatch({
            type: 'customizedV2/communicationDate',
            payload: { times, date }
        })
        if (preQuestion) preQuestion()
    }

    next = () => {
        const { nextQuestion } = this.props;
        const { times, date } = this.state;
        const communicationDate = getDateString(date)
        //提交表单
        nextQuestion && nextQuestion('submit', communicationDate, times[0])
    }

    scrollBottom = () => {
        const d = document.getElementById("form-container");
        if (!d) return;
        d.scrollTop = d.clientHeight
    }

    render() {
        const { timesList, complete } = this.state;
        const { customizedV2: { customizationDate = {} }, loading } = this.props;
        return (
            <div className={styles.commitBox}>
                <h3 className={styles.title}>4/4 您方便与顾问沟通的时间？</h3>
                <p className={styles.describe}>约定时间，方便沟通</p>
                <div className={styles.commitTimesBox}>
                    {loading ? <p className={styles.nodata}><Icon type="loading" /></p> : <Fragment>
                        <div className={styles.date}>
                            <DatePickerView
                                mode="date"
                                value={this.state.date}
                                minDate={new Date(customizationDate.minDate)}
                                maxDate={new Date(customizationDate.maxDate)}
                                onChange={date => this.changeDate(date)}
                            />
                        </div>
                        {!timesList.length ? <p className={styles.nodata}>已约满</p> : <div className={styles.time}>
                            <PickerView
                                data={timesList}
                                cascade={false}
                                value={this.state.times}
                                onChange={times => this.timesChange(times)}
                            />
                        </div>}
                    </Fragment>}
                </div>
                <div className={styles.nextFooter}>
                    {complete ?
                        <button className={styles.nextPage} onClick={this.next}>立即预约</button> : null}
                </div>
                <div className={styles.preQuestion} onClick={this.pre}>
                    <img src={require('../../images/arrow-left.png')} />
                    <span>返回上一题</span>
                </div>
            </div>
        )
    }
}

export default CommunicationDate;
