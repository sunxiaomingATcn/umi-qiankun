import React, { Component } from 'react';
import { DatePicker, Picker, List } from 'antd-mobile';
import Item from '@/components/Item/item';
import RadioButton from '@/components/radioButton/RadioButton';
import BottomPicker from '@/components/Picker/Picker';
import { connect } from 'dva';
import cloneDeep from 'lodash/cloneDeep';
import Utils from "@/utils/utils";
import Modal from '@/components/modal';
import { getInsuredAgeboundaryDayDiff, getPremiumTrialProfessionCategoryDes } from '../../assets/productConfig/judgeProductFeature';
import Select, { Option } from 'rc-select';
import styles from './index.scss'
import moment from 'moment'

const nowTimeStamp = Date.now();
const now = new Date(nowTimeStamp);


@connect(({ common, insuredNew }) => ({
    common,
    insuredNew
}))

class Input extends Component {
    constructor(props) {
        super(props);

        this.state = {
            item: this.props.item,
        };
    }


    static getDerivedStateFromProps(nextProps, prevState) {
        const { item } = nextProps;
        if (item !== null && JSON.stringify(item) !== JSON.stringify(prevState.item)) {
            return {
                item: item,
                value: item.defaultValue
            }
        }
        return null;
    }


    onClickRadioButton = (e, value, tag) => {
        this.tracks([{ operateType: 13, productId: localStorage.getItem("product_id"), msg: `选择项=${this.props.item.name}，选择结果：${value}` }])
        e.preventDefault();
        // console.log(value);
        const { item } = this.state;
        const { updateRestrictGenes, saveQuoteDisabled } = this.props;
        item.defaultValue = value;
        updateRestrictGenes && updateRestrictGenes(item, tag);
        saveQuoteDisabled && saveQuoteDisabled(false);
        this.setState({
            item
        });
    };

    tracks(payload) {
        this.props.dispatch({
            type: "insuredNew/tracks",
            payload,
        })
    }

    componentDidMount() {
        if (this.props.item.type.value == 1) {
            if (this.props.item.options.length == 1) {
                this.tracks([{ operateType: 14, productId: localStorage.getItem("product_id"), msg: `选择项=${this.props.item.name}，选择结果：${this.props.item.options[0]}` }])
            }
        }
    }

    onClickButtonPicker = (value) => {
        const { tag } = this.props;
        const { item } = this.state;
        const { updateRestrictGenes, saveQuoteDisabled } = this.props;
        item.defaultValue = value;
        updateRestrictGenes && updateRestrictGenes(item, tag);
        saveQuoteDisabled && saveQuoteDisabled(false);
        this.setState({
            item
        });
    };

    /*
    * 附加条款名称太长，只显示后半部分
    * */
    formatTitle = () => {
        const { item: { name } } = this.props;
        const title = cloneDeep(name);
        return title.split('-').length > 1 ? title.split('-')[1] : name;
    };

    getRadio = () => {
        const { item } = this.state;
        const { tag, occupationCategory } = this.props;
        const options = cloneDeep(item.options);
        let newOptions = [];
        let moreOptions = [];
        if (item.options.length > 6) {
            newOptions = options.filter((item, index) => index < 6);
            moreOptions = options.filter((item, index) => index > 5);
        } else {
            newOptions = options;
        }
        // console.log(newOptions,moreOptions)
        return <div>
            {item.options.length > 0 && newOptions.map((value, index) => (
                <RadioButton
                    key={index}
                    checked={item.defaultValue === (value)}
                    onClick={(e) => this.onClickRadioButton(e, value, tag)}
                    style={{ marginLeft: '0.2rem', marginBottom: '0.2rem' }}
                >
                    {value}
                </RadioButton>
            ))}
            {item.options.length > 6 &&
                <BottomPicker
                    checked={this.checkOptions(item.defaultValue, moreOptions)}
                    onClick={this.onClickButtonPicker}
                    title={this.formatTitle()}
                    defaultValue={this.checkOptions(item.defaultValue, moreOptions) ? [item.defaultValue] : []}
                    item={moreOptions}
                    style={{ marginLeft: '0.2rem', marginBottom: '0.2rem', display: "inline-block" }}
                >
                </BottomPicker>
            }
            {
                item.id === (occupationCategory && occupationCategory.restrictGene) && <div onClick={() => this.openOccupationCategory(occupationCategory)} style={{ color: '#3a8fff', display: 'inline-block', marginLeft: '.3rem' }}>
                    职业类别表
                </div>
            }
        </div>;
    };

    openOccupationCategory = (occupationCategory) => {
        console.log(occupationCategory);
        const { filePath, richText } = occupationCategory;
        if (richText && richText.length > 0) {
            const title = '职业类别表';
            Modal.popup({
                title,
                content: <div
                    dangerouslySetInnerHTML={{ __html: richText }} />
            })
        } else {
            window.open(filePath);
        }
    };

    checkOptions = (value, moreOptions) => {
        let flag = false;
        moreOptions.forEach(item => {
            if (item === value) {
                flag = true
            }
        });
        return flag;
    };


    dateChange = (date, tag) => {
        const { item } = this.state;
        const { updateRestrictGenes, saveQuoteDisabled } = this.props;
        const newDate = this.formatDate(date);
        item.defaultValue = newDate;
        updateRestrictGenes && updateRestrictGenes(item, tag);
        saveQuoteDisabled && saveQuoteDisabled(false);
        this.setState({ item });
    };


    formatDate(date) {
        let da = new Date(date);
        let year = da.getFullYear(),
            month = da.getMonth() + 1 < 10 ? '0' + (da.getMonth() + 1) : da.getMonth() + 1,
            day = da.getDate() < 10 ? '0' + da.getDate() : da.getDate();
        let newDate = [year, month, day].join('-');
        return newDate;
    };
    /**
     * 京东安联年龄区间向后移动一天
     * 最大周岁65周岁 起始日期减少一天
     * 最小天数30天 结束日期增加一天
     * 
     * 瑞智保 
     * 时间+1基础上后移2天
    */
    getMinDate = () => {
        const { item } = this.state;
        let stime;
        //日期
        if (item !== null && item.type.value === 2) {
            const { item: { interval: { maxUnit, maxIsClosed, max } } } = this.state;
            stime = Utils.setPreDateFormat({
                years: maxUnit.value === 3 ? maxIsClosed ? max + 1 : max : 0,
                days: maxUnit.value === 1 ? maxIsClosed ? max + 1 : max : getInsuredAgeboundaryDayDiff().min
            });
        }
        return new Date(stime);
    };

    dateok(date) {
        const Y = date.getFullYear();
        const M = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
        const D = date.getDate().length == 1 ? date.getDate() : "0" + date.getDate()
        const curDay = Y + '-' + M + '-' + D;
        this.tracks([{ operateType: 13, productId: localStorage.getItem("product_id"), msg: `选择项=${this.props.item.name}，选择结果：${curDay}` }])
    }


    getMaxDate = () => {
        const { item } = this.state;
        let etime;
        //日期 minUnit.value 3 周岁
        if (item !== null && item.type.value === 2) {
            const { item: { interval: { minUnit, min, minIsClosed } } } = this.state;
            etime = Utils.setPreDateFormat({
                years: minUnit.value === 3 ? minIsClosed ? min : min + 1 : 0,
                days: minUnit.value === 1 ? minIsClosed ? min : min + 1 : getInsuredAgeboundaryDayDiff().max
            });
        }
        return new Date(etime);
    };

    pickerChange = (value, tag) =>{
        const { item } = this.state;
        const { updateRestrictGenes, saveQuoteDisabled } = this.props;
        item.defaultValue = value[0];
        updateRestrictGenes && updateRestrictGenes(item, tag);
        saveQuoteDisabled && saveQuoteDisabled(false);
        this.setState({ item });
    }

    inputInit() {
        const { item } = this.state;
        let { type, description, name, defaultValue } = item;
        let minDate = this.getMinDate();
        let maxDate = this.getMaxDate();
        if(localStorage.ppb_visting_productName == '机动车延长保修保险UAC'){
            maxDate = new Date(moment().format('YYYY-MM-DD'))
            minDate = new Date(
                moment()
                  .add(2, 'days')
                  .subtract(96, 'months')
                  .format('YYYY-MM-DD'),
              );
        }
        const { tag, occupationCategory } = this.props;
        let isCar300UAC = localStorage.ppb_visting_productName == '机动车延长保修保险UAC' || localStorage.ppb_visting_productName == '人保驾乘意外险产品EAU'
        let input;
        // 0：下拉 1：日历 2：日历+下拉框 3：文本输入框 4：地区 5：职业 6：密码框 7：文本 8：对话框 9：单选框 齐心的

        // 1：单选框 2：日历 3：复选框 4：下拉框  阿保的
        switch (type.value) {
            case 1:
                if(name == '保障计划' && isCar300UAC){
                    let newOptions = []
                    item.options.forEach((val)=>{
                        newOptions.push({value:val,label:val})
                    })
                    input = <Picker data={newOptions} onChange={(e)=>{this.pickerChange(e,tag)}} value={[item.defaultValue]} cols={1} className="forss">
                        <List.Item className={styles.item} arrow="horizontal">{item.name}</List.Item>
                  </Picker>
                }else if(( name == '二手车成交价（万元）' || name=='是否日系车' ) && localStorage.ppb_visting_productName == '人保驾乘意外险产品EAU'){
                    input = <Item extraDom={item.defaultValue} domStyle={{ marginRight: 0 }}>{item.name}</Item>
                }else {
                    input = <Item extraDom={this.getRadio()} domStyle={{ marginRight: 0 }}
                    description={description}
                    annotation={(occupationCategory && occupationCategory.restrictGene == item.id) ? getPremiumTrialProfessionCategoryDes() : null}
                    >{item.name}</Item>
                }
                break;
            case 2:
                console.log(this.formatTitle());
                input = <div style={{
                    borderBottom: '1px solid #efefef'
                }}>
                    <DatePicker
                        mode="date"
                        minDate={minDate}
                        maxDate={maxDate}
                        disabled={name == '初登日期' && localStorage.ppb_visting_productName == '人保驾乘意外险产品EAU'}
                        title={this.formatTitle()}
                        extra="请选择"
                        value={defaultValue !== null ? new Date(defaultValue) : now}
                        onChange={(date) => this.dateChange(date, tag)}
                        onOk={(date) => { this.dateok(date) }}
                    >
                        <Item description={description}>{item.name}</Item>
                    </DatePicker>
                </div>;
                
                break;

        }
        return input;
    }

    render() {
        return (
            <React.Fragment>
                {this.inputInit()}
            </React.Fragment>
        );
    }
}

export default Input;



