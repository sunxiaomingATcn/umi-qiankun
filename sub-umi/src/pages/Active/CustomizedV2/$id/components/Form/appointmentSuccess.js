

import React, { Component } from 'react';
import Utils from '@/utils/utils';
import styles from '../../css/form.less';
import { connect } from 'dva';

@connect(({ customizedV2 }) => ({
    customizedV2,
}))
class appointmentSuccess extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.collectBaiduHm()
    }

    collectBaiduHm = (action = "open") => {
        const { activeParams } = this.props;
        Utils.collectBaiduHm(`1v1_${activeParams.amount}_${activeParams.channel}_预约成功`, action)
    }

    call = () => {
        this.collectBaiduHm('click');
        window.location.href = "https://www.sobot.com/chat/h5/index.html?sysNum=4debc641aefd4d859181fcca74633b67"
    }

    render() {
        return (
            <div className={styles.appointmentSuccess}>
                <a onClick={this.call} className={styles.customerService}><img src={require('../../images/customerService.png')} /></a>
            </div>
        );
    }
}

export default appointmentSuccess;