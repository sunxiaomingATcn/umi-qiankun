import React, {Component} from 'react';
import {PickerView, Icon} from 'antd-mobile';
import {connect} from 'dva'
import District from "@/assets/commonData/district";
import styles from "./index.scss";
import Utils from '@/utils/utils';

@connect(({customized}) => ({
    customized,
}))
class City extends Component {
    state = {}

    componentDidMount() {
        const {customized: {code_area_name}} = this.props;
        this.setState({city:code_area_name})
        const { amount,  channel } = this.props;
        Utils.collectBaiduHm(`1v1_${amount}_${channel}_表单所在城市`, "open")
    }

    cityChange = (city) => {
        this.setState({city})
    }

    pre = () => {
        const {prePage} = this.props;
        if (prePage) prePage()

    }

    next = () => {
        const {nextPage, dispatch} = this.props;
        if (nextPage) nextPage()

        const {city} = this.state;
        const province = District.find(item => city[0] == item.value)
        const cityName = province.children ? province.children.find(item => city[1] == item.value) : null;

        dispatch({
            type: 'customized/areaName',
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
                    <button className={styles.back} onClick={this.pre}>返回</button>
                    {city && city.length ?
                        <button className={styles.nextPage} onClick={this.next}><span>我选好了</span><Icon type="right" /></button> : null}
                </div>
            </div>


        )
    }
}

export default City;
