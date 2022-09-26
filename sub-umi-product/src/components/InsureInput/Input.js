import React, {Component} from 'react';
// import PropTypes from 'prop-types';
import styles from './input.scss';
import {Accordion, DatePicker, List, Picker, Toast} from 'antd-mobile';
import Item from './item';
import {connect} from 'dva';
import Modal from "@/components/modal";
import Job from "../Input/job";

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
let dataList = [];
let keyList = [];

const generateList = (data) => {
    for (let i = 0; i < data.length; i++) {
        const node = data[i];
        const {label, value} = node;
        dataList.push({label, value});
        if (node.children) {
            generateList(node.children);
        }
    }
};

let MinDate = new Date(now.setFullYear(now.getFullYear() - 20));
let nowDate = new Date(now.setFullYear(now.getFullYear() + 20));
let MaxDate = new Date(now.setFullYear(now.getFullYear() + 20));

@connect(({common}) => ({
    common,
}))


class Input extends Component {

    state = {
        value: this.props.item.defaultValue,
        date: this.props.item.defaultValue ? new Date(this.props.item.defaultValue) : this.props.defaultDate,
        time: now,
        utcDate: utcNow,
        dpValue: null,
        customChildValue: null,
        visible: false,
        data: [],
        cols: 1,
        verifyCode: null,
        pickerValue: [],
        asyncValue: [this.props.item.subRestrictGenes ? this.props.item.subRestrictGenes[0].defaultValue : ''],
        sValue: [],
        cardCodeReg: new RegExp(/^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/),
        singleValue: this.props.item.defaultValue ? [this.props.item.defaultValue] : [],
        errorRemind: '',
        disabled: false,
        jobName: '',
        jobId: '',
        codeText: '获取验证码',
        phone: '',
        item: this.props.item,
        checked: false
    };

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
        }
    };

    getRadio = (defaultValue, values, protectItem, id, apiName, name) => {
        const {getFieldDecorator} = this.props.form;
        let i = (getFieldDecorator(`${id},${apiName}`, {
            initialValue: this.state.value,
            validateTrigger: 'onBlur',
            rules: [{
                required: true,
                message: `请选择${name}`
            }],
        })
        (<div className={[styles.radio_container, 'flex-r-cc'].join(' ')} key={1}>
            {values.map((item, index) => {
                return <label
                    key={index}
                    className={[styles.checkRadio, (this.state.value === item.controlValue) ? styles.checkRadio_checked : undefined].join(' ')}
                    style={{marginLeft: '0.3rem'}}>
                    <input type='radio'
                           onChange={(e) => this.onChange1(e, item.controlValue)}
                           name={`${id}${apiName}${index}`}
                           checked={this.state.value === item.controlValue}
                           value={item.controlValue}
                    />{item.value}
                </label>
            })
            }
        </div>));
        return i;
    };

    formatArr(data) {
        const Arr = [];
        for (let i = data.min; i <= data.max; i += data.step) {
            Arr.push(i + data.unit);
        }
        return Arr
    }


    uniq(arr) {
        let hash = {};
        return arr.filter((val) => {
            return hash.hasOwnProperty(typeof val + JSON.stringify(val)) ?
                false : hash[typeof val + JSON.stringify(val)] = true;
        });
    }

    formatPicker(data) {
        const Arr = [];
        data.forEach(item => {
            Arr.push({
                label: item.value,
                value: item.controlValue
            })
        });
        let arr = this.uniq(Arr);
        return [arr];
    }

    dateChange = (date, item) => {
        this.setState({date});
    };


    jobClick = (key, name, isInsure) => {
        const {form: {setFieldsValue}, id} = this.props;
        let {item: {apiName}, asyncValue} = this.state;
        setFieldsValue({[id + ',' + apiName]: asyncValue});
        if (isInsure == '是') {
            this.setState({
                jobName: name,
                jobId: key
            });
            setFieldsValue({[id + ',' + apiName]: key});
            this.props.getParentValues((id+'Job'),name)
            this.Modal();
        } else {
            Toast.fail('职业不在承保范围内', 2)
        }
    };

    optionsChange = (v, name, item) => {
        console.log(item);
        this.setState({singleValue: v});
        if (name == '为谁投保') {
            this.props.onPersonChange(v[0]);
        } else if (name == '受益人信息') {
            this.props.onBeneficiaryChange(v[0]);
        }
    };

    inputChange = (e) => {
        this.setState({value: e.target.value})
    };
    inputCodeChange = (e) => {
        this.setState({
            verifyCode: e.target.value
        })
    };

    inputFocus = (id, apiName) => {
        if (apiName == 'cardCode') {
            const {form: {getFieldValue}} = this.props;
            const controlValue = getFieldValue(`${id},cardType`);
            // const idRegex = [
            //     {controlValue: "1", regex: "^\d{18}$|^\d{17}[Xx\d]$"},
            //     {controlValue: "2", regex: "^(?![a-zA-Z]+$)[\da-zA-Z]{6,18}$"},
            //     {controlValue: "5", regex: "^(?!.*_)\w{8,18}$"},
            //     {controlValue: "6", regex: "^\d{4,18}$|^[\一-\龥]+字第\d{4,18}$"},
            //     {controlValue: "7", regex: "^[A-Z0-9\(\)]{8,12}$"}
            // ];
            // idRegex.forEach(item => {
            //     if (item.controlValue == controlValue) {
            //         this.setState({
            //             cardCodeReg: item.regex
            //         })
            //     }
            // });
        }
    };

    inputInit() {
        const {getFieldProps, getFieldError, getFieldDecorator} = this.props.form;
        const {item, cardCodeReg, disabled, codeText, verifyCode, jobName} = this.state;
        const {type, values, defaultValue, name, defaultRemind, apiName, attributeValues, regex, errorRemind, required} = item;
        const {minDate, maxDate, id} = this.props;
        const errors = getFieldError(`${id},${apiName}`);
        let input;

        // 0：下拉 1：日历 2：日历+下拉框 3：文本输入框 4：地区 5：职业 6：密码框 7：文本 8：对话框 9：单选框
        switch (type) {
            case 0:
                let attributeValuesArr;
                if (attributeValues) {
                    attributeValuesArr = this.formatPicker(attributeValues, apiName)
                }
                if (apiName != 'cardType' && apiName != 'fiscalResidentIdentity') {
                    input = (<div>
                        <Picker
                            {...getFieldProps(`${id},${apiName}`, {
                                initialValue: this.state.singleValue,
                                rules: [{
                                    required,
                                    message: `请选择${name}`
                                }]
                            })}
                            data={attributeValuesArr}
                            title={name}
                            cascade={false}
                            extra="请选择"
                            onOk={(v) => this.optionsChange(v, name, item)}
                        >
                            <Item arrow="horizontal" errors={errors}>{name}</Item>
                        </Picker>
                    </div>);
                } else if (apiName == 'fiscalResidentIdentity') {
                    input = (
                        (getFieldDecorator(`${id},${apiName}`, {
                            initialValue: '1',
                        })(<div>
                            <Item arrow="horizontal" extraDom={'仅为中国税收居民'} domStyle={{marginRight: 0}}
                                  errors={errors}>{name}</Item>
                        </div>))
                    )
                } else {
                    input = (
                        (getFieldDecorator(`${id},${apiName}`, {
                            initialValue: '1',
                        })(<div>
                            <Item arrow="horizontal" extraDom={'身份证'} domStyle={{marginRight: 0}}
                                  errors={errors}>{name}</Item>
                        </div>))
                    )
                }

                break;
            case 1:
                if (apiName == 'cardPeriod') {
                    const errorStart = getFieldError(`${id},dateStart`);
                    const errorEnd = getFieldError(`${id},dateEnd`);
                    const {checked} = this.state;

                    input = <React.Fragment>
                        <div className={styles.container}>
                            <div className='flex-r-bc'>
                                <span className={`${styles.label}`}>{name}</span>
                                <div className='flex-r-bc '>
                                    <span className={styles.card_period}>长期</span>
                                    <input type="checkbox"
                                           checked={checked} className={styles.checke}
                                           onChange={(e) => this.setState({checked: !checked})}/>
                                </div>
                            </div>
                            <div className={styles.errors}> {(errors) ? errors.join(',') : null}</div>
                        </div>
                        {
                            (getFieldDecorator(`${id},dateStart`, {
                                initialValue: this.state.date,
                                validateTrigger: 'onBlur',
                                rules: [
                                    {
                                        required,
                                        message: `请选择此内容`
                                    }
                                ]
                            })(
                                <DatePicker
                                    mode="date"
                                    minDate={MinDate}
                                    maxDate={nowDate}
                                    title={name}
                                    extra="请选择"
                                    onChange={(date) => this.dateChange(date, item)}

                                >
                                    <Item errors={errorStart}>起</Item>
                                </DatePicker>
                            ))
                        }
                        {
                            !checked && (getFieldDecorator(`${id},dateEnd`, {
                                initialValue: this.state.date,
                                validateTrigger: 'onBlur',
                                rules: [
                                    {
                                        required,
                                        message: `请选择此内容`
                                    }
                                ]
                            })(
                                <DatePicker
                                    mode="date"
                                    minDate={nowDate}
                                    maxDate={MaxDate}
                                    title={name}
                                    extra="请选择"
                                    onChange={(date) => this.dateChange(date, item)}
                                >
                                    <Item errors={errorEnd}>止</Item>
                                </DatePicker>
                            ))
                        }
                    </React.Fragment>
                } else if (apiName != 'birthday') {
                    input =
                        (getFieldDecorator(`${id},${apiName}`, {
                            initialValue: this.state.date,
                            rules: [
                                {
                                    required,
                                    pattern: new RegExp(regex),
                                    message: errorRemind
                                }
                            ]
                        })(
                            <DatePicker
                                mode="date"
                                minDate={minDate}
                                maxDate={maxDate}
                                title={name}
                                extra="请选择"
                                onChange={(date) => this.dateChange(date, item)}
                            >
                                <Item>{name}</Item>
                            </DatePicker>
                        ));
                }
                break;
            case 2:
                input = <div></div>;
                break;
            case 3:
                if (apiName == 'mobile' && id == 'insurant') {
                    const codeErrors = getFieldError(`${id},verifyCode`);
                    input = <React.Fragment>
                        {
                            (getFieldDecorator(`${id},${apiName}`, {
                                initialValue: this.state.value,
                                validateTrigger: 'onBlur',
                                rules: [
                                    {
                                        required,
                                        pattern: new RegExp(regex),
                                        message: errorRemind
                                    }
                                ]
                            })
                            (<div className={`${styles.container}`}>
                                <div className='flex-r-bc'>
                                    <span className={`${styles.label}`}>{name}</span>
                                    <input className={styles.mobile_input}
                                           type='text'
                                           onChange={(e) => this.inputChange(e)}
                                           placeholder='请输入手机号'
                                           onFocus={() => this.inputFocus(id, apiName)}
                                    />
                                    <div className={styles.line}></div>
                                    <div className={[styles.send, disabled ? styles.disabled : undefined].join(' ')}
                                         onClick={(e) => this.getCodeClick(e)}>{codeText}</div>
                                </div>
                                <div className={styles.errors}> {(errors) ? errors.join(',') : null}</div>
                            </div>))
                        }
                        {
                            (getFieldDecorator(`${id},verifyCode`, {
                                initialValue: this.state.verifyCode,
                                validateTrigger: 'onBlur',
                                rules: [
                                    {
                                        required: true,
                                        message: '请输入验证码'
                                    },
                                    this.checkCode
                                ],
                                trigger: 'onBlur'
                            })
                            (<div className={`${styles.container}`}>
                                <div className='flex-r-bc'>
                                    <span className={`${styles.label}`}>验证码</span>
                                    <input type='text'
                                           onChange={(e) => this.inputCodeChange(e)}
                                           placeholder='请输入验证码'
                                    />
                                </div>
                                <div className={styles.errors}> {(codeErrors) ? codeErrors.join(',') : null}</div>
                            </div>))
                        }
                    </React.Fragment>
                } else {
                    input = (getFieldDecorator(`${id},${apiName}`, {
                        initialValue: this.state.value,
                        validateTrigger: 'onBlur',
                        rules: [
                            {
                                required,
                                pattern: regex ? new RegExp(regex) : cardCodeReg,
                                message: errorRemind ? errorRemind : defaultRemind
                            }
                        ]
                    })
                    (<div className={`${styles.container}`}>
                        <div className='flex-r-bc'>
                            <span className={`${styles.label}`}>{name}</span>
                            <input type='text'
                                   onChange={(e) => this.inputChange(e)}
                                   placeholder={defaultRemind}
                                   onFocus={() => this.inputFocus(id, apiName)}
                            />
                        </div>
                        <div className={styles.errors}> {(errors) ? errors.join(',') : null}</div>
                    </div>));
                }
                break;
            case 4:
                input = (getFieldDecorator(`${id},${apiName}`, {
                    rules: [
                        {
                            required,
                            message: `请选择${name}`
                        }
                    ]
                })(
                    <Picker
                        title={name}
                        data={this.state.data}
                        cols={this.state.cols}
                        onPickerChange={this.onPickerChange}
                        onOk={(v) => this.onOk(v)}
                    >
                        <Item errors={errors} onClick={() => this.onClick(item)}>{name}</Item>
                    </Picker>
                ));

                break;
            case 5:
                input =
                    (getFieldDecorator(`${id},${apiName}`, {
                        rules: [
                            {
                                required,
                                message: `请选择${name}`
                            }
                        ]
                    })(
                        <Picker
                            extra={this.state.jobName}
                            disabled>
                            <Item onClick={this.getJobs} errors={errors}>{name}</Item>
                        </Picker>));
                break;
            case 6:
                let list1 = values ? values : attributeValues;
                let dom = <div style={{display: 'flex'}}>
                    {this.getRadio(defaultValue, list1, item)}
                    <span onClick={this.getJobs} style={{marginLeft: '0.2rem'}}>{item.defaultValue}</span>
                </div>;
                if (item.key == 'insurantJob') {
                    input = <div>
                        <Item extraDom={dom}>{name}</Item>
                    </div>;
                } else {
                    input = <div>
                        <Item extraDom={this.getRadio(defaultValue, list1, item, id, apiName, name)}>{name}</Item>
                    </div>;
                }
                break;
            case 7 :
                break;
            case 8:
                break;
            case 9:
                let list = values ? values : attributeValues;
                let extraDom = this.getRadio(defaultValue, list, item, id, apiName, name);
                input = (getFieldDecorator(`${id},${apiName}`, {
                    initialValue: this.state.value,
                    rules: [
                        {
                            required,
                            message: errorRemind ? errorRemind : defaultRemind ? defaultRemind : `请选择${name}`
                        }
                    ]
                })(
                    <div>
                        <Item extraDom={extraDom}
                              errors={errors}
                              domStyle={{marginRight: 0}}
                        >{name}</Item>
                    </div>
                ));
                break;
        }
        return input;
    }


    formatArea = (areas) => {
        const Arr = [];
        areas.forEach((item, idx) => {
            Arr.push({
                label: item.areaName,
                value: item.areaCode
            });
        });
        return Arr;
    };

    onClick = () => {
        let that = this;
        const {dispatch} = this.props;
        dispatch({
            type: 'common/queryArea',
            payload: {
                id: this.props.productId,
                areaCode: ''
            }
        }).then(res => {
            const Area = that.formatArea(res.payload.areas);
            if (this.props.common.fullArea) {
                this.setState({
                    data: this.props.common.fullArea,
                });
            } else {
                this.setState({
                    asyncValue: [],
                    data: Area,
                });
            }

            this.handleQueryArea(Area);
        });

    };

    handleQueryArea = (area) => {
        const {dispatch} = this.props;
        const d = [...this.state.data];
        let that = this;
        if (area.length > 0) {
            dispatch({
                type: 'common/queryArea',
                payload: {
                    id: this.props.productId,
                    areaCode: area[0].value
                }
            }).then(res => {
                let colNum = 2;
                if (res.code === 0 && res.payload.areas.length > 0) {
                    const areaSecond = that.formatArea(res.payload.areas);
                    area[0].children = areaSecond;
                    dispatch({
                        type: 'common/queryArea',
                        payload: {
                            id: this.props.productId,
                            areaCode: areaSecond[0].value
                        }
                    }).then((data) => {
                        if (data.code === 0 && data.payload.areas.length > 0) {
                            console.log(1111);
                            colNum = 3;
                            const areaThird = that.formatArea(data.payload.areas);
                            area[0].children[0].children = areaThird;
                            this.setState({
                                data: area,
                                cols: colNum
                            })
                        }
                    })

                    this.setState({
                        data: area,
                        cols: colNum
                    })


                }
            });
        }

    };

    onOk = (v) => {
        const {form: {setFieldsValue}, id} = this.props;
        let {item: {apiName}, asyncValue, data} = this.state;
        generateList(data);
        if (asyncValue.length === 0) {
            asyncValue = v;
        }
        let title = '';
        if(asyncValue.length > 0){
            asyncValue.forEach((item)=>{
                const result = dataList.find((val)=>val.value === item);
                if(result) title += result.label;
            })
        }

        this.props.getParentValues(id+'ProvCity',title);

        setFieldsValue({[id + ',' + apiName]: asyncValue});

    };

    onPickerChange = (val) => {
        const {dispatch, form: {setFieldsValue}, id} = this.props;
        const {item: {apiName}} = this.state;
        const d = [...this.state.data];
        const newD = JSON.parse(JSON.stringify(d));
        const asyncValue = [...val];
        const that = this;
        dispatch({
            type: 'common/queryArea',
            payload: {
                id: this.props.productId,
                areaCode: val[val.length - 1]
            }
        }).then(res => {
            let colNum = 2;
            if (res.code === 0 && res.payload.areas.length > 0) {
                if (val.length <= 1) {
                    d.forEach((item) => {
                        if (item.value == val[val.length - 1]) {
                            if (!item.children) {
                                item.children = [];
                                item.children = that.formatArea(res.payload.areas)
                                asyncValue.push(res.payload.areas[0].areaCode);
                                dispatch({
                                    type: 'common/queryArea',
                                    payload: {
                                        id: this.props.productId,
                                        areaCode: res.payload.areas[0].areaCode
                                    }
                                }).then((data) => {
                                    if (data.code === 0 && data.payload.areas.length > 0) {
                                        colNum = 3;
                                        item.children[0].children = that.formatArea(data.payload.areas);
                                        asyncValue.push(data.payload.areas[0].areaCode);
                                        dispatch({
                                            type: 'common/queryFullArea',
                                            payload: d
                                        });
                                        this.setState({
                                            data: d,
                                            cols: colNum,
                                            asyncValue,
                                        });
                                    }
                                })
                            } else {

                            }
                        }
                    });

                } else {
                    colNum = 3;
                    const index = d.findIndex((item) => item.value === val[0]);
                    if (index > -1) {
                        const cal = d[index].children.findIndex((item) => item.value === val[1]);
                        if (cal > -1) {
                            d[index].children[cal].children = that.formatArea(res.payload.areas);
                        }
                    }
                }
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
            setFieldsValue({
                [id + ',' + apiName]: asyncValue
            });
            this.handleArea(val, d)
        });


    };

    checkCode = (rule, value, callback) => {
        console.log(this.state.verifyCode);
        if (!/^\d{6}$/.test(this.state.verifyCode)) {
            callback('请输入正确6位验证码');
        } else {
            callback();
        }
        callback();
    };

    checkData = () => {
        if (!this.state.value) {
            Toast.fail('请输入手机号码', 2);
            return false
        }
        if (!/^1[3456789]\d{9}$/.test(this.state.value)) {
            Toast.fail('请输入正确的手机号', 2);
            return false
        }
        return true;
    };

    getJobs = () => {
        const {dispatch} = this.props;
        Toast.loading('Loading...', 0);
        dispatch({
            type: 'common/queryJobList',
            payload: {
                id: this.props.productId,
            }
        }).then(res => {
            const jobs = res.payload.jobs;
            const title = '选择职业类别';
            const content = <Job jobs={jobs} jobClick={this.jobClick}></Job>;
            this.Modal = Modal.popup({
                title,
                content,
                padding: true,
                onOk: () => console.log('ok'),
            });
            Toast.hide();
        });
    };

    getCodeClick = (e) => {
        e.preventDefault();
        const {value} = this.state;
        const {dispatch} = this.props;
        if (this.state.isWait) {
            return false
        }
        if (!this.checkData()) return false;
        dispatch({
            type: 'login/sendValidation',
            payload: {
                mobile: value
            }
        }).then((data) => {
            if (data.code === 0) {
                Toast.success('验证码发送成功', 2);
                // 接口成功发送验证码并倒计时
                this.setTime()
            }
        })
    };

    setTime = () => {
        this.setState({isWait: true, disabled: false});
        let countdown = 60;
        this.setState({codeText: countdown + 's获取'});
        this.timer = setInterval(() => {
            if (countdown === 0) {
                this.setState({
                    codeText: '重新获取',
                    isWait: false,
                    disabled: true
                });
                clearInterval(this.timer);
            } else {
                countdown--;
                this.setState({
                    codeText: countdown + 's获取',
                    disabled: false
                });
            }
        }, 1000);
    };


    handleArea = (val, area) => {
        const {id} = this.props;
        generateList(area);
        let name = '';
        if (val.length > 0) {
            val.forEach((item, key) => {
                const data = dataList.find((value) => value.value == item);
                if (data) {
                    name += data.label;
                }

            })

        }
        console.log(name);
    };

    render() {
        return (
            <React.Fragment>
                {this.inputInit()}
            </React.Fragment>
        );
    }
}

export default Input;





