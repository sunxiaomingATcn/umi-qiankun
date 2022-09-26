import React, {Component} from 'react';
// import PropTypes from 'prop-types';
import styles from './input.scss';
import {DatePicker, Picker, Toast} from 'antd-mobile';
import Item from './item';
import RadioButton from '../radioButton/RadioButton';
import {formShape} from 'rc-form';
import {connect} from 'dva';
import Modal from "@/components/modal";
import Job from "./job";

const nowTimeStamp = Date.now();
const now = new Date(nowTimeStamp);
// GMT is not currently observed in the UK. So use UTC now.
const utcNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));

// Make sure that in `time` mode, the maxDate and minDate are within one day.
let minDate = new Date(nowTimeStamp - 1e7);
const maxDate = new Date(nowTimeStamp + 1e7);
// console.log(minDate, maxDate);
if (minDate.getDate() !== maxDate.getDate()) {
    minDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
}
console.log(minDate, maxDate)

@connect(({common}) => ({
    common
}))

    // new Date().setFullYear(now.getFullYear () -this.props.item.values[0].min)
class Input extends Component {
    constructor(props) {
        super(props)

        this.state = {
            value: this.props.item.name == '基本保额' ? (this.props.defaultInsuranceAmount ? this.props.defaultInsuranceAmount : this.props.item.defaultValue) : this.props.item.defaultValue,
            date: this.props.item.defaultValue ? new Date(this.props.item.defaultValue) : now,
            minDate: this.props.item.type == 1 ? new Date(new Date().setFullYear(now.getFullYear() - this.props.item.values[0].max - 1) + Math.abs(this.props.item.values[0].subDictionary.min ? this.props.item.values[0].subDictionary.min * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)) : null,
            maxDate: this.props.item.type == 1 ?
                new Date(new Date(new Date().setFullYear(new Date().getFullYear() - this.props.item.values[0].min)) - Math.abs(this.props.item.values[0].subDictionary.max ? this.props.item.values[0].subDictionary.max * 24 * 60 * 60 * 1000 : 0))
                : null,
            time: now,
            utcDate: utcNow,
            dpValue: null,
            customChildValue: null,
            visible: false,
            data: [],
            cols: 1,
            pickerValue: [],
            asyncValue: [this.props.item.subRestrictGenes ? this.props.item.subRestrictGenes[0].defaultValue : ''],
            sValue: [],
            singleValue: this.props.item.defaultValue ? [this.props.item.defaultValue] : [],
            colorValue: ['#00FF00'],
            errorRemind: '',
            item: this.props.item,
        };
    }


    static getDerivedStateFromProps(nextProps, prevState) {
        const {item} = nextProps;
        if (item !== null && JSON.stringify(item) !== JSON.stringify(prevState.item)) {
            return {
                item: item,
                value: item.defaultValue
            }
        }
        return null;
    }


    onChange1 = (e, item) => {
        if (e.target.value) {
            this.setState({
                value: e.target.value,
            });
            console.log(e.target);
            this.props.handleTrial(item.key ? item.key : item.protectItemId, e.target.value);
        }
    };


    onChange2 = (controlValue, item) => {
        this.setState({
            value: controlValue
        });
        // this.props.handleTrial(item.key ?item.key:item.protectItemId,e.target.value);
    };

    onChange3 = (v, item) => {
        if (v.length > 0) {
            this.props.handleTrial('province', v[0]);
            v[1] && this.props.handleTrial('city', v[1]);
            // v[2] && this.props.handleTrial('city', v[2]);
        }
    };

    getRadio = (defaultValue, values, protectItem) => {
        if (values && values[0].type === '1') {
            return <div>
                {values.map(item => (
                    <RadioButton
                        key={item.value}
                        checked={this.state.value === (item.unit ? (item.value + item.unit) : item.value)}
                        onClick={(e) => this.onChange1(e, protectItem)}
                        style={{marginLeft: '0.2rem', marginBottom: '0.15rem'}}
                        value={item.unit ? (item.value + item.unit) : item.value}>
                        {item.unit ? (item.value + item.unit) : item.value}
                    </RadioButton>
                ))}
            </div>
        } else if (values && values[0].type === '2') {
            const Arr = this.formatArr(values[0]);
            return <div>
                {Arr.map((item, index) => (
                    <RadioButton
                        key={index}
                        checked={this.state.value === item}
                        onClick={(e) => this.onChange1(e, protectItem)}
                        style={{marginLeft: '0.2rem', marginBottom: '0.2rem'}}
                        value={item}>
                        {item}
                    </RadioButton>
                ))}
            </div>
        } else {
            return <div>{values.map((item, index) => (
                <RadioButton
                    key={index}
                    checked={this.state.value === item.controlValue}
                    onClick={(e) => this.onChange2(e, item.controlValue)}
                    style={{marginLeft: '0.2rem', marginBottom: '0.2rem'}}
                    i>
                    {item.value}
                </RadioButton>
            ))}</div>;
        }

    };

    formatArr(data) {
        const Arr = [];
        for (let i = data.min; i <= data.max; i += data.step) {
            Arr.push(i + data.unit);
        }
        return Arr
    }


    test = (rule, value, callback) => {
        const {form, form: {getFieldsValue}} = this.props;
        if (value.length > 0) {
            form.validateFields(['confirm'], {force: true});
        } else {
            callback('请选择');
        }
        callback();
    };


    formatDate(date) {
        let da = new Date(date);
        let year = da.getFullYear(),
            month = da.getMonth() + 1 < 10 ? '0' + (da.getMonth() + 1) : da.getMonth() + 1,
            day = da.getDate() < 10 ? '0' + da.getDate() : da.getDate();
        let newDate = [year, month, day].join('-');
        return newDate;
    };

    dateChange = (date, item) => {
        this.setState({date});
        const newDate = this.formatDate(date);
        console.log(newDate);
        this.props.handleTrial(item.key ? item.key : item.protectItemId, newDate);
    };

    getJobs = () => {
        const {dispatch} = this.props;
        Toast.loading('Loading...', 0);
        dispatch({
            type: 'common/queryJobList',
            payload: {
                id: this.props.id,
            }
        }).then(res => {
            console.log(res);
            const jobs = res.payload.jobs;
            const title = '查询职业类别 ';
            const content = this.formatJob(jobs);
            Modal.popup({
                title,
                content,
                padding: true
            });
            Toast.hide();
        });
    };

    formatJob(jobs) {
        const {firstIndex, secondIndex} = this.state;
        console.log(firstIndex)
        let content = null;
        console.log(jobs);
        content =
            <Job jobs={jobs}
                 firstIndex={firstIndex}
                 secondIndex={secondIndex}
            ></Job>
        return content;
    }

    jobClick = (key) => {
        console.log(key);
    };

    optionsChange = (v, name) => {
        this.setState({singleValue: v});
        if (name == '为谁投保') {
            this.props.onPersonChange(v[0]);
        }
    };

    inputChange = (e) => {
        this.setState({value: e.target.value})
    };

    formatPicker(data) {
        const Arr = [];
        data.forEach(item => {
            Arr.push({
                label: item.value,
                value: item.controlValue
            })
        });
        return [Arr];
    }

    formatArea = (area) => {
        const Arr = [];
        area[0].values.forEach((item, idx) => {
            Arr[idx] = {
                label: item.name,
                value: item.value
            };
        });
        return Arr;
    };

    inputInit() {
        const {getFieldProps, getFieldError, getFieldDecorator} = this.props.form;
        const {item} = this.state;
        const {type, values, defaultValue, name, display, defaultRemind, apiName, attributeValues, regex, errorRemind, required} = item;
        const errors = getFieldError(name);
        let input;
        // 0：下拉 1：日历 2：日历+下拉框 3：文本输入框 4：地区 5：职业 6：密码框 7：文本 8：对话框 9：单选框
        switch (type) {
            case 0:
                let attributeValuesArr;
                if (attributeValues) {
                    attributeValuesArr = this.formatPicker(attributeValues)
                }
                input = (<div>
                    <Picker
                        {...getFieldProps(name, {
                            initialValue: this.state.singleValue,
                            rules: [{
                                required,
                            },
                                this.test
                            ]
                        })}
                        data={attributeValuesArr}
                        title={name}
                        cascade={false}
                        extra="请选择"
                        onOk={(v) => this.optionsChange(v, name)}
                    >
                        <Item arrow="horizontal" errors={errors}>{name}</Item>
                    </Picker>
                </div>);
                break;
            case 1:
                input = <div style={{
                    borderBottom: '1px solid #efefef', marginBottom: '0.15rem'
                }}>
                    <DatePicker
                        mode="date"
                        minDate={this.state.minDate}
                        maxDate={this.state.maxDate}
                        title={name}
                        extra="请选择"
                        value={this.state.date}
                        onChange={(date) => this.dateChange(date, item)}
                    >
                        <Item>{name}</Item>
                    </DatePicker>
                </div>;

                break;
            case 2:
                input = <div>

                </div>
                break;
            case 3:
                input = (getFieldDecorator(name, {
                    initialValue: this.state.value,
                    rules: [
                        {
                            required,
                            pattern: new RegExp(regex),
                            message: defaultRemind
                        }
                    ]
                })
                (<div className={`${styles.container}`}>
                    <div className='flex-r-bc'>
                        <span className={`${styles.label}`}>{name}</span>
                        <input type='text'
                               onChange={(e) => this.inputChange(e)}
                               placeholder={defaultRemind}
                        />
                    </div>
                    <div className={styles.errors}> {(errors) ? errors.join(',') : null}</div>
                </div>));
                break;
            case 4:
                let areaData = this.formatArea(item.subRestrictGenes);
                input =
                    <Picker
                        data={this.state.data.length > 0 ? this.state.data : areaData}
                        cols={this.state.cols}
                        value={this.state.asyncValue}
                        onPickerChange={this.onPickerChange}
                        onOk={v => this.onChange3(v)}
                    >
                        <Item extra={this.state.asyncValue} onClick={() => this.onClick(item)}>{name}</Item>
                    </Picker>;
                break;
            case
            5:

                break;
            case 6:
                let list1 = values ? values : attributeValues;
                let dom = <div style={{display: 'flex'}}>
                    {this.getRadio(defaultValue, list1, item)}
                    <span onClick={this.getJobs}
                          style={{marginLeft: '0.2rem', color: '#3A8FFF'}}>
                        {item.defaultValue}职业列表</span>
                </div>;
                if (item.key == 'insurantJob') {
                    input = <div style={{borderBottom: '1px solid #efefef'}}>
                        <Item extraDom={dom} domStyle={{marginRight: 0}}>{name}</Item>
                    </div>;
                } else {
                    input = <div style={{borderBottom: '1px solid #efefef'}}>
                        <Item extraDom={this.getRadio(defaultValue, list1, item)}
                              domStyle={{marginRight: 0}}>{name}</Item>
                    </div>;
                }
                break;
            case
            7:
                break;
            case 8:
                break;
            case 9:
                let list = values ? values : attributeValues;

                if (item.name == '基本保额') {
                    input = <Item
                        extraDom={this.getRadio(defaultValue, list, item)}
                        domStyle={{marginRight: 0}}
                    >{name}</Item>;
                } else {
                    input = <Item extraDom={this.getRadio(defaultValue, list, item)} domStyle={{marginRight: 0}}
                    >{name}</Item>;
                }

                break;
        }
        return input;
    }

    onClick = (item) => {
        console.log(item.subRestrictGenes);

        const Area = this.formatArea(item.subRestrictGenes);
        if (this.props.common.fullArea) {
            this.setState({
                data: this.props.common.fullArea,
            });
        } else {
            this.setState({
                data: Area,
            });
        }
    };

    onPickerChange = (val) => {
        const {dispatch} = this.props;
        const d = [...this.state.data];
        const asyncValue = [...val];
        dispatch({
            type: 'common/queryArea',
            payload: {
                id: this.props.id,
                areaCode: val[val.length - 1]
            }
        }).then(res => {
            let colNum = 2;
            if (res.code === 0 && res.payload.areas.length > 0) {
                d.findIndex((item) => {
                    if (item.value == val && !item.children) {
                        item.children = [];
                        res.payload.areas.forEach(ele => {
                            item.children.push({
                                value: ele.areaCode,
                                label: ele.areaName
                            })
                        });
                        asyncValue.push(res.payload.areas[0].areaCode);
                    } else if (item.children) {
                        item.children.findIndex(ele => {
                            if (ele.value === val[val.length - 1] && !ele.children) {
                                ele.children = [];
                                res.payload.areas.forEach(m => {
                                    ele.children.push({
                                        value: m.areaCode,
                                        label: m.areaName
                                    })
                                });
                                colNum = 3;
                                asyncValue.push(res.payload.areas[0].areaCode);
                            }
                        })
                    }
                });
                dispatch({
                    type: 'common/queryFullArea',
                    payload: d
                });
                this.setState({
                    data: d,
                    cols: colNum,
                    asyncValue,
                });
            } else {
                dispatch({
                    type: 'common/queryFullArea',
                    payload: d
                });
                this.setState({
                    data: d,
                    cols: asyncValue.length,
                    asyncValue,
                });
            }
        });
    };


    render() {
        return (
            <React.Fragment>
                {this.props.item.display && this.inputInit()}
            </React.Fragment>
        );
    }
}

export default Input;


Input.propTypes = {
    form: formShape,
};



