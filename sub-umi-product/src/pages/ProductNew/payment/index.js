/**
 * 运营中心 订单列表 继续支付中转页面
 * query存储localStorage 提供参数跳转给/ProductNew/Pay页面
*/

import React, { Component } from 'react';
import { history } from 'umi';
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        const { location: { query } } = this.props;
        ['token', 'saleName', 'premium'].forEach(item => localStorage.setItem(item, query[item]))
        history.replace({ pathname: '/ProductNew/Pay', query })
    }

    render() {
        return (
            <div></div>
        );
    }
}

export default index;
