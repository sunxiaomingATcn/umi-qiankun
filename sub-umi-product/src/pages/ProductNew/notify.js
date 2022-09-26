/**
 * 第三方健康告知回调中转页面
 * 复兴
 * 英仕健康
*/

import React, { Component, Fragment } from 'react';
import { history } from 'umi';
import { Toast } from 'antd-mobile';
import { connect } from "dva";
import { stringify } from 'qs';

@connect(({ productNew }) => ({
    productNew
}))
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        Toast.loading('Loading...', 0);
        const { location: { query, query: { productId: id, quoteRecordId, status } } } = this.props;
        //status：C-取消投保，N-核保不通过，Y-核保通过，B-无法线上投保
        if (!id || !quoteRecordId) return;
        const proms = [this.getQuote(quoteRecordId), status === 'Y' ? this.getProduct(id) : false]
        Promise.all(proms)
            .then(([quoteRes, productRes]) => {
                Toast.hide();
                const { userWorkId, tenantId } = quoteRes.payload;
                const queryParams = { ...query, id, userWorkId, tenantId };
                if (!productRes && quoteRes.code == 0) {
                    history.replace(`/ProductNew?${stringify(queryParams)}&health=fail`)
                } else if (quoteRes.code == 0 && productRes.code === 0) {
                    if (!userWorkId || !tenantId) {
                        Toast.info("没有代理人信息")
                        return;
                    }
                    history.replace(`/ProductNew/Insured?${stringify(queryParams)}`)
                }
            })
    }

    getProduct = (productId) => {
        const { dispatch } = this.props;
        return dispatch({
            type: 'productNew/queryProductInfo',
            payload: {
                id: productId
            }
        }).then(res => {
            if (res && res.code === 0) {
                const { infoDetails, saleName } = res.payload;
                localStorage.setItem('saleName', saleName);
                // localStorage.setItem('ppb_infoDetails', JSON.stringify(infoDetails));
            }
            return res;
        })
    }

    getQuote = (quoteRecordId) => {
        const { dispatch } = this.props;
        return dispatch({
            type: 'productNew/queryQuoteDetail',
            payload: {
                id: quoteRecordId
            }
        }).then(res => {
            if (res && res.code === 0) {
                const { state, premium } = res.payload;
                localStorage.setItem('premium', premium);
                localStorage.setItem('state', state);
            }
            return res;
        })
    }

    render() {
        return (
            <Fragment></Fragment>
        );
    }
}

export default Index;
