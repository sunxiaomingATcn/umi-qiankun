import React, { Component } from 'react';
import { Link } from 'umi';
import { history } from 'umi';
import { connect } from 'dva';
import callService from '@/assets/commonData/callService';
import styles from './index.less';

@connect(({ policy }) => ({
    policy
}))
class crmUnpolicy extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
    }

    reBind = () => {
        const { dispatch } = this.props;
        history.push('/Policy/wechat/bind')
        dispatch({
            type: 'policy/wechatUnBindCrmId'
        })
    }

    render() {
        const { crmIsBinded } = this.props;
        return (
            <div className={styles.crmUnpolicy}>
                <p>暂无保单，您可以</p>
                {crmIsBinded === false ?
                    <p><a onClick={() => callService()}>联系阿保</a></p>
                    :
                    <p><a onClick={this.reBind}>切换账号</a></p>
                }
            </div>
        );
    }
}

export default crmUnpolicy;
