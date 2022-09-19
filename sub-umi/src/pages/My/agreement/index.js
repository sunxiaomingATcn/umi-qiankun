/**
 * title: 注册政策
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './agreement.scss';
import { history } from 'umi';

@connect(({ my }) => ({
    my,
}))
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {}

    render() {
        let loginData = JSON.parse(localStorage.loginData)
        return (
            <div className={styles.agreement}>
                <div
                    className={styles.item}
                    onClick={() => {
                        history.push(`/My/agreement/detail?id=${loginData.tenantId}`);
                    }}
                >
                    <div>用户注册与使用服务协议</div>
                    <img src={require('../assets/img/arrow-right.png')} />
                </div>
                <div
                    className={styles.item}
                    onClick={() => {
                        history.push(`/My/agreement/Privacy?id=${loginData.tenantId}`);
                    }}
                >
                    <div>隐私政策</div>
                    <img src={require('../assets/img/arrow-right.png')} />
                </div>
            </div>
        );
    }
}

export default Index;
