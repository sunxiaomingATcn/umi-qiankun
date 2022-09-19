import React, {Component} from 'react';
import {PickerView, Icon} from 'antd-mobile';
import {connect} from 'dva'
import District from "@/assets/commonData/district";
import styles from "./index.scss";
import Utils from '@/utils/utils';

@connect(({customizedV3}) => ({
    customizedV3,
}))
class City extends Component {
    state = {}

    componentDidMount() {
        const {customizedV3: {code_area_name}} = this.props;
        this.setState({city:code_area_name})
        const { amount,  channel } = this.props;
        Utils.collectBaiduHm(`1v1_v3.0_${amount}_${channel}_表单8-居住地`, "open")
    }

    cityChange = (city) => {
        this.setState({city})
    }

    pre = () => {
        const {prePage} = this.props;
        if (prePage) {
            if(this.props.customizedV3.spouseflag){
                prePage()
            }else{
                prePage(7)
            }
        }

    }

    next = () => {
        const {nextPage, dispatch} = this.props;
        if (nextPage) nextPage()

        const {city} = this.state;
        const province = District.find(item => city[0] == item.value)
        const cityName = province.children ? province.children.find(item => city[1] == item.value) : null;

        dispatch({
            type: 'customizedV3/areaName',
            payload: {
                text: province.label + (cityName ? cityName.label : ""),
                code: city
            }
        })
    }

    render() {
        const {city} = this.state;

        return (
            <div className={styles.contentBox}>
                <div className={styles.header}>
                    <h3>您所在的城市？</h3>
                    <p>服务机构，是否在身边</p>
                </div>
                <PickerView
                    data={District}
                    cols={2}
                    value={this.state.city}
                    onChange={city => this.cityChange(city)}
                >
                </PickerView>
                <div className={styles.footer}>
                    <button className={styles.back} onClick={this.pre}>返回上一题</button>
                    {city && city.length ?
                        <button className={styles.nextPage} onClick={this.next}><span>我选好了</span><Icon type="right" /></button> : null}
                </div>
            </div>


        )
    }
}

export default City;
