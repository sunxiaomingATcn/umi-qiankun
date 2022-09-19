import React, { Component } from 'react';
import styles from './formItems/index.scss';


class NotPart extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return (<div className={styles.notParticipate}>
            <img src={require('@/assets/png/logo.png')} />
            <p className={styles.noAuthorize}>请联系阿保客服，购买家庭保障规划服务后填写表单</p>
        </div>);
    }
}

export default NotPart;
